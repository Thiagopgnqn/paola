import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { getEffectiveCampaignStatus } from '../pricing-engine/index.js';
import { isDbDown, markDbDown } from './dbState.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, '../../prisma/catalog-snapshot.json');

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const loadSnapshot = () => {
  try {
    if (fs.existsSync(snapshotPath)) {
      return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    }
  } catch {}
  return { campaigns: [], promotions: [] };
};

const saveSnapshot = (data) => {
  try {
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
};

export const getCampaigns = async (filters = {}) => {
  const { status, search } = filters;
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { headline: { contains: search, mode: 'insensitive' } },
      ];
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        promotions: {
          include: { targets: true },
        },
        coupons: true,
      },
    });

    const now = new Date();
    return campaigns.map((c) => ({
      ...c,
      effectiveStatus: getEffectiveCampaignStatus(c, now),
    }));
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    let list = snap.campaigns || [];
    const now = new Date();
    if (status && status !== 'ALL') {
      list = list.filter((c) => (c.status === status) || (getEffectiveCampaignStatus(c, now) === status));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.headline && c.headline.toLowerCase().includes(q)));
    }
    return list.map((c) => ({
      ...c,
      effectiveStatus: getEffectiveCampaignStatus(c, now),
    }));
  }
};

export const getCampaignById = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        promotions: {
          include: { targets: true },
        },
        coupons: true,
      },
    });
    if (!campaign) throw new Error('Campaña no encontrada');
    return {
      ...campaign,
      effectiveStatus: getEffectiveCampaignStatus(campaign, new Date()),
    };
  } catch (err) {
    if (err.message === 'Campaña no encontrada') throw err;
    markDbDown();
    const snap = loadSnapshot();
    const c = (snap.campaigns || []).find((item) => item.id === id);
    if (!c) throw new Error('Campaña no encontrada');
    const promos = (snap.promotions || []).filter((p) => p.campaignId === id);
    return {
      ...c,
      promotions: promos,
      effectiveStatus: getEffectiveCampaignStatus(c, new Date()),
    };
  }
};

export const createCampaign = async (data) => {
  const { promotions = [], ...campaignData } = data;
  const slug = campaignData.slug ? slugify(campaignData.slug) : slugify(campaignData.name) + '-' + Date.now().toString().slice(-4);
  const startsAt = campaignData.startsAt || campaignData.startDate || null;
  const endsAt = campaignData.endsAt || campaignData.endDate || null;

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.$transaction(async (tx) => {
      const created = await tx.campaign.create({
        data: {
          name: campaignData.name,
          slug,
          status: campaignData.status || 'DRAFT',
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
          priority: Number(campaignData.priority || 0),
          active: campaignData.active !== false,
          headline: campaignData.headline || null,
          subheadline: campaignData.subheadline || null,
          description: campaignData.description || null,
          bannerUrl: campaignData.bannerUrl || null,
          bannerImage: campaignData.bannerImage || campaignData.bannerUrl || null,
          theme: campaignData.theme || 'neutro',
          themeConfig: campaignData.themeConfig || null,
          announcementText: campaignData.announcementText || null,
          announcementLink: campaignData.announcementLink || null,
          conditionsText: campaignData.conditionsText || null,
          showCountdown: Boolean(campaignData.showCountdown),
          landingEnabled: campaignData.landingEnabled !== false,
          seoTitle: campaignData.seoTitle || null,
          seoDescription: campaignData.seoDescription || null,
        },
      });

      if (Array.isArray(promotions) && promotions.length > 0) {
        for (const p of promotions) {
          const promo = await tx.promotion.create({
            data: {
              campaignId: created.id,
              name: p.name,
              kind: p.kind || p.type || 'PERCENTAGE',
              value: p.value != null ? p.value : null,
              minQuantity: p.minQuantity != null ? p.minQuantity : null,
              minOrderAmount: p.minOrderAmount != null ? p.minOrderAmount : null,
              maxDiscountAmount: p.maxDiscountAmount != null ? p.maxDiscountAmount : null,
              tiers: p.tiers ? (typeof p.tiers === 'string' ? p.tiers : JSON.stringify(p.tiers)) : null,
              buyQuantity: p.buyQuantity != null ? p.buyQuantity : null,
              payQuantity: p.payQuantity != null ? p.payQuantity : null,
              bundleSkus: p.bundleSkus ? (typeof p.bundleSkus === 'string' ? p.bundleSkus : JSON.stringify(p.bundleSkus)) : null,
              paymentMethod: p.paymentMethod || null,
              stackable: Boolean(p.stackable),
              startsAt: created.startsAt,
              endsAt: created.endsAt,
              active: true,
            },
          });

          if (Array.isArray(p.targets) && p.targets.length > 0) {
            await tx.promotionTarget.createMany({
              data: p.targets.map((t) => ({
                promotionId: promo.id,
                targetType: t.targetType,
                targetId: t.targetId || null,
                excluded: Boolean(t.excluded),
              })),
            });
          }
        }
      }

      const createdWithPromos = await tx.campaign.findUnique({
        where: { id: created.id },
        include: {
          promotions: { include: { targets: true } },
        },
      });
      return {
        ...createdWithPromos,
        effectiveStatus: getEffectiveCampaignStatus(createdWithPromos, new Date()),
      };
    });
  } catch (err) {
    markDbDown();
    console.error('[CAMPAIGN WRITE] Base de datos no disponible para crear campaña:', err.message);
    const dbErr = new Error('Base de datos no disponible para crear campañas.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const updateCampaign = async (id, data) => {
  const updateData = { ...data };
  delete updateData.promotions;
  if (updateData.slug) updateData.slug = slugify(updateData.slug);
  if (updateData.startsAt !== undefined) updateData.startsAt = updateData.startsAt ? new Date(updateData.startsAt) : null;
  if (updateData.endsAt !== undefined) updateData.endsAt = updateData.endsAt ? new Date(updateData.endsAt) : null;

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const updated = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        promotions: { include: { targets: true } },
      },
    });
    return {
      ...updated,
      effectiveStatus: getEffectiveCampaignStatus(updated, new Date()),
    };
  } catch (err) {
    if (err.message === 'Campaña no encontrada') throw err;
    markDbDown();
    console.error('[CAMPAIGN WRITE] Base de datos no disponible para actualizar campaña:', err.message);
    const dbErr = new Error('Base de datos no disponible para actualizar campañas.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const deleteCampaign = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.campaign.delete({ where: { id } });
  } catch (err) {
    markDbDown();
    console.error('[CAMPAIGN WRITE] Base de datos no disponible para eliminar campaña:', err.message);
    const dbErr = new Error('Base de datos no disponible para eliminar campañas.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const duplicateCampaign = async (id) => {
  const original = await getCampaignById(id);
  const copyName = `${original.name} (Copia)`;
  const copySlug = `${original.slug}-copia-${Date.now().toString().slice(-4)}`;

  const payload = {
    name: copyName,
    slug: copySlug,
    status: 'DRAFT',
    startsAt: original.startsAt,
    endsAt: original.endsAt,
    priority: original.priority,
    headline: original.headline,
    description: original.description,
    bannerUrl: original.bannerUrl,
    themeConfig: original.themeConfig,
    active: false,
    promotions: (original.promotions || []).map((p) => ({
      name: `${p.name} (Copia)`,
      kind: p.kind,
      value: p.value ? Number(p.value) : null,
      minQuantity: p.minQuantity,
      minOrderAmount: p.minOrderAmount ? Number(p.minOrderAmount) : null,
      maxDiscountAmount: p.maxDiscountAmount ? Number(p.maxDiscountAmount) : null,
      tiers: p.tiers,
      buyQuantity: p.buyQuantity,
      payQuantity: p.payQuantity,
      bundleSkus: p.bundleSkus,
      paymentMethod: p.paymentMethod,
      stackable: p.stackable,
      targets: (p.targets || []).map((t) => ({
        targetType: t.targetType,
        targetId: t.targetId,
        excluded: t.excluded,
      })),
    })),
  };

  return createCampaign(payload);
};

export const updateCampaignStatus = async (id, status) => {
  return updateCampaign(id, { status });
};

export const endCampaign = async (id) => {
  return updateCampaign(id, {
    status: 'ENDED',
    endsAt: new Date().toISOString(),
  });
};

export const finalizeCampaign = endCampaign;

export const archiveCampaign = async (id) => {
  return updateCampaign(id, {
    status: 'ARCHIVED',
    active: false,
  });
};

export const getActiveCampaign = async (previewId = null) => {
  const campaigns = await getCampaigns();
  const now = new Date();

  if (previewId) {
    const previewCamp = campaigns.find(
      (c) => c.id === previewId || c.slug === previewId
    );
    if (previewCamp) return previewCamp;
  }

  const active = campaigns
    .filter((c) => {
      const eff = c.effectiveStatus || getEffectiveCampaignStatus(c, now);
      return eff === 'ACTIVE' && c.active !== false;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return active[0] || null;
};

export const getCampaignBySlug = async (slug, previewId = null) => {
  const campaigns = await getCampaigns();
  const now = new Date();
  const camp = campaigns.find((c) => c.slug === slug || c.id === slug);
  if (!camp) return null;

  const isPreview = previewId && (previewId === camp.id || previewId === camp.slug || previewId === 'true');
  const eff = camp.effectiveStatus || getEffectiveCampaignStatus(camp, now);

  if (!isPreview && eff !== 'ACTIVE') {
    return { ...camp, inactive: true };
  }

  return { ...camp, isPreview: Boolean(isPreview) };
};

export const incrementCampaignViews = async (idOrSlug) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const existing = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: { id: true, views: true },
    });
    if (!existing) return null;
    const updated = await prisma.campaign.update({
      where: { id: existing.id },
      data: { views: { increment: 1 } },
      select: { id: true, slug: true, views: true },
    });
    return updated;
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const camp = (snap.campaigns || []).find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (camp) {
      camp.views = (camp.views || 0) + 1;
      return { id: camp.id, slug: camp.slug, views: camp.views };
    }
    return null;
  }
};
