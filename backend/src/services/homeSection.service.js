import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { isDbDown, markDbDown } from './dbState.js';
import { getActiveCampaign } from './campaign.service.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, '../../prisma/catalog-snapshot.json');

const loadSnapshot = () => {
  try {
    if (fs.existsSync(snapshotPath)) {
      return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    }
  } catch {}
  return { homeSections: [] };
};

const saveSnapshot = (data) => {
  try {
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
};

export const getSuggestedTemplate = (templateKey, campaign = null) => {
  const campName = campaign?.name || 'Campaña Especial';
  const campEnd = campaign?.endsAt || null;

  switch (templateKey) {
    case 'black-friday':
      return [
        {
          type: 'HERO',
          order: 0,
          enabled: true,
          config: {
            headline: 'BLACK FRIDAY NOCTURNA',
            subheadline: 'Precios récord y descuentos salvajes en bienestar íntimo y lencería. Envíos 100% discretos en Córdoba.',
            ctaText: 'Ver Ofertas Exclusivas',
            ctaLink: '/ofertas',
          },
        },
        {
          type: 'COUNTDOWN',
          order: 1,
          enabled: true,
          config: {
            title: 'Cuenta Regresiva Black Friday',
            message: 'Ofertas por tiempo limitado hasta agotar stock físico.',
            targetDate: campEnd,
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Ofertas Relámpago',
            subtitle: 'Precios Exclusivos',
            filter: 'campaign',
            limit: 8,
          },
        },
        {
          type: 'BENEFITS',
          order: 3,
          enabled: true,
          config: {},
        },
        {
          type: 'FAQ',
          order: 4,
          enabled: true,
          config: {},
        },
      ];

    case 'dia-de-la-madre':
      return [
        {
          type: 'CAMPAIGN_BANNER',
          order: 0,
          enabled: true,
          config: {
            title: 'Especial Día de la Madre',
            subtitle: '15% OFF en Lencería Fina y 2x1 en Cosmética Sensorial',
            badge: 'Edición Limitada',
            ctaText: 'Ver Colección Completa',
            ctaLink: campaign?.slug ? `/campanas/${campaign.slug}` : '/ofertas',
          },
        },
        {
          type: 'COUNTDOWN',
          order: 1,
          enabled: true,
          config: {
            title: 'La campaña finaliza en:',
            message: 'Aprovechá los descuentos antes de que terminen.',
            targetDate: campEnd,
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Destacados Día de la Madre',
            subtitle: 'Selección con descuento',
            filter: 'campaign',
            limit: 6,
          },
        },
        {
          type: 'CATEGORY_GRID',
          order: 3,
          enabled: true,
          config: {
            title: 'Categorías de la Colección',
          },
        },
        {
          type: 'BENEFITS',
          order: 4,
          enabled: true,
          config: {},
        },
        {
          type: 'FAQ',
          order: 5,
          enabled: true,
          config: {},
        },
      ];

    case 'cyber-sale':
    case 'hot-sale':
      return [
        {
          type: 'HERO',
          order: 0,
          enabled: true,
          config: {
            headline: 'CYBER SALE NOCTURNA',
            subheadline: 'Hasta 35% OFF en productos seleccionados y 10% adicional por Transferencia.',
            ctaText: 'Aprovechar Descuentos',
            ctaLink: '/ofertas',
          },
        },
        {
          type: 'COUNTDOWN',
          order: 1,
          enabled: true,
          config: {
            title: 'Termina en pocas horas:',
            message: 'Descuentos válidos únicamente durante el Cyber Sale.',
            targetDate: campEnd,
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Más Vendidos con Descuento',
            subtitle: 'Cyber Sale',
            limit: 6,
          },
        },
        {
          type: 'BENEFITS',
          order: 3,
          enabled: true,
          config: {},
        },
      ];

    case 'san-valentin':
      return [
        {
          type: 'CAMPAIGN_BANNER',
          order: 0,
          enabled: true,
          config: {
            title: 'Especial San Valentín',
            subtitle: 'Juegos de pareja, lencería y aceites comestibles para encender la noche.',
            badge: 'San Valentín',
            ctaText: 'Descubrir Colección',
            ctaLink: campaign?.slug ? `/campanas/${campaign.slug}` : '/catalogo',
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 1,
          enabled: true,
          config: {
            title: 'Inspiración para Parejas',
            subtitle: 'Selección Especial',
            limit: 6,
          },
        },
        {
          type: 'CATEGORY_GRID',
          order: 2,
          enabled: true,
          config: {},
        },
        {
          type: 'BENEFITS',
          order: 3,
          enabled: true,
          config: {},
        },
      ];

    case 'navidad':
      return [
        {
          type: 'CAMPAIGN_BANNER',
          order: 0,
          enabled: true,
          config: {
            title: 'Regalos Íntimos para Estas Fiestas',
            subtitle: 'Sorprendé con detalles elegantes y empaque confidencial.',
            badge: 'Fiestas 2026',
            ctaText: 'Ver Catálogo Navideño',
            ctaLink: campaign?.slug ? `/campanas/${campaign.slug}` : '/catalogo',
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 1,
          enabled: true,
          config: {
            title: 'Ideas para Regalar',
            subtitle: 'Boutique Navideña',
            limit: 6,
          },
        },
        {
          type: 'BENEFITS',
          order: 2,
          enabled: true,
          config: {},
        },
      ];

    case 'base':
    default:
      return [
        {
          type: 'HERO',
          order: 0,
          enabled: true,
          config: {
            headline: 'Intimidad, diseño y placer sin tabúes.',
            subheadline: 'Una selección curada de bienestar íntimo, cosmética sensorial y lencería. Comprá con total reserva desde tu casa: envíos 100% discretos en Córdoba y atención personalizada por WhatsApp.',
            ctaText: 'Explorar Colección',
            ctaLink: '/catalogo',
          },
        },
        {
          type: 'CATEGORY_GRID',
          order: 1,
          enabled: true,
          config: {
            title: 'Categorías de la Colección',
            subtitle: 'Universo Nocturna',
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Seleccionados para Vos',
            subtitle: 'Curaduría',
            limit: 6,
          },
        },
        {
          type: 'TEXT_BLOCK',
          order: 3,
          enabled: true,
          config: {
            title: 'Una experiencia íntima pensada desde el respeto, la estética y la confidencialidad.',
            id: 'nosotros',
          },
        },
        {
          type: 'BENEFITS',
          order: 4,
          enabled: true,
          config: {},
        },
        {
          type: 'FAQ',
          order: 5,
          enabled: true,
          config: {
            id: 'faq',
          },
        },
      ];
  }
};

export const getHomeSections = async (options = {}) => {
  const { campaignId, previewId, activeOnly = false } = options;

  try {
    if (isDbDown()) throw new Error('DB_DOWN');

    // Escenario 1: Solicitud explícita de campaña (desde Admin / Portada)
    if (campaignId !== undefined) {
      const targetCampId = (campaignId === 'base' || campaignId === '' || campaignId === null) ? null : campaignId;
      const where = { campaignId: targetCampId };
      if (activeOnly) where.enabled = true;

      const sections = await prisma.homeSection.findMany({
        where,
        orderBy: { order: 'asc' },
      });

      return {
        sections: sections.map(s => ({
          ...s,
          config: typeof s.config === 'string' ? JSON.parse(s.config || '{}') : (s.config || {}),
        })),
        activeCampaign: null,
      };
    }

    // Escenario 2: Solicitud pública o con vista previa (?preview=<id>)
    const activeCamp = await getActiveCampaign(previewId);

    if (activeCamp) {
      // Buscar secciones de la campaña activa
      const campSections = await prisma.homeSection.findMany({
        where: {
          campaignId: activeCamp.id,
          ...(activeOnly ? { enabled: true } : {}),
        },
        orderBy: { order: 'asc' },
      });

      if (campSections.length > 0) {
        return {
          sections: campSections.map(s => ({
            ...s,
            config: typeof s.config === 'string' ? JSON.parse(s.config || '{}') : (s.config || {}),
          })),
          activeCampaign: activeCamp,
          isPreview: Boolean(previewId),
        };
      }
    }

    // Escenario 3: Portada base (sin campaña o campaña sin secciones)
    const baseSections = await prisma.homeSection.findMany({
      where: {
        campaignId: null,
        ...(activeOnly ? { enabled: true } : {}),
      },
      orderBy: { order: 'asc' },
    });

    return {
      sections: baseSections.map(s => ({
        ...s,
        config: typeof s.config === 'string' ? JSON.parse(s.config || '{}') : (s.config || {}),
      })),
      activeCampaign: activeCamp || null,
      isPreview: Boolean(previewId),
    };
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const all = snap.homeSections || [];

    // Fallback Snapshot
    if (campaignId !== undefined) {
      const targetCampId = (campaignId === 'base' || campaignId === '' || campaignId === null) ? null : campaignId;
      const filtered = all
        .filter(s => (s.campaignId || null) === targetCampId && (!activeOnly || s.enabled !== false))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        sections: filtered.map(s => ({
          ...s,
          config: typeof s.config === 'string' ? JSON.parse(s.config || '{}') : (s.config || {}),
        })),
        activeCampaign: null,
      };
    }

    const activeCamp = await getActiveCampaign(previewId);
    if (activeCamp) {
      const campSections = all
        .filter(s => s.campaignId === activeCamp.id && (!activeOnly || s.enabled !== false))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      if (campSections.length > 0) {
        return {
          sections: campSections.map(s => ({
            ...s,
            config: typeof s.config === 'string' ? JSON.parse(s.config || '{}') : (s.config || {}),
          })),
          activeCampaign: activeCamp,
          isPreview: Boolean(previewId),
        };
      }
    }

    const baseSections = all
      .filter(s => (s.campaignId === null || !s.campaignId) && (!activeOnly || s.enabled !== false))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      sections: (baseSections.length > 0 ? baseSections : getSuggestedTemplate('base')).map(s => ({
        ...s,
        config: typeof s.config === 'string' ? JSON.parse(s.config || '{}') : (s.config || {}),
      })),
      activeCampaign: activeCamp || null,
      isPreview: Boolean(previewId),
    };
  }
};

export const createHomeSection = async (data) => {
  const targetCampId = (data.campaignId === 'base' || !data.campaignId) ? null : data.campaignId;
  const configStr = typeof data.config === 'object' ? JSON.stringify(data.config) : (data.config || '{}');

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const created = await prisma.homeSection.create({
      data: {
        campaignId: targetCampId,
        type: data.type,
        order: Number(data.order || 0),
        enabled: data.enabled !== false,
        config: configStr,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });

    return {
      ...created,
      config: JSON.parse(created.config || '{}'),
    };
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    if (!Array.isArray(snap.homeSections)) snap.homeSections = [];

    const newSection = {
      id: `sec_${Date.now()}`,
      campaignId: targetCampId,
      type: data.type,
      order: Number(data.order || 0),
      enabled: data.enabled !== false,
      config: configStr,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    snap.homeSections.push(newSection);
    saveSnapshot(snap);
    return {
      ...newSection,
      config: JSON.parse(configStr),
    };
  }
};

export const updateHomeSection = async (id, data) => {
  const updateData = { ...data };
  if (updateData.config !== undefined && typeof updateData.config === 'object') {
    updateData.config = JSON.stringify(updateData.config);
  }
  if (updateData.startsAt !== undefined) {
    updateData.startsAt = updateData.startsAt ? new Date(updateData.startsAt) : null;
  }
  if (updateData.endsAt !== undefined) {
    updateData.endsAt = updateData.endsAt ? new Date(updateData.endsAt) : null;
  }

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const updated = await prisma.homeSection.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updated,
      config: typeof updated.config === 'string' ? JSON.parse(updated.config || '{}') : (updated.config || {}),
    };
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const idx = (snap.homeSections || []).findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Sección no encontrada');

    snap.homeSections[idx] = {
      ...snap.homeSections[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    saveSnapshot(snap);
    return {
      ...snap.homeSections[idx],
      config: typeof snap.homeSections[idx].config === 'string'
        ? JSON.parse(snap.homeSections[idx].config || '{}')
        : (snap.homeSections[idx].config || {}),
    };
  }
};

export const deleteHomeSection = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    await prisma.homeSection.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    snap.homeSections = (snap.homeSections || []).filter(s => s.id !== id);
    saveSnapshot(snap);
    return { success: true };
  }
};

export const reorderHomeSections = async (items = []) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    await prisma.$transaction(
      items.map(it =>
        prisma.homeSection.update({
          where: { id: it.id },
          data: { order: Number(it.order) },
        })
      )
    );
    return { success: true, count: items.length };
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const map = new Map(items.map(it => [it.id, Number(it.order)]));
    (snap.homeSections || []).forEach(s => {
      if (map.has(s.id)) s.order = map.get(s.id);
    });
    saveSnapshot(snap);
    return { success: true, count: items.length };
  }
};

export const applyTemplate = async (campaignId, templateKey) => {
  const targetCampId = (campaignId === 'base' || !campaignId) ? null : campaignId;
  const suggested = getSuggestedTemplate(templateKey);

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    await prisma.$transaction(async tx => {
      // Eliminar secciones anteriores de esta campaña o base
      await tx.homeSection.deleteMany({
        where: { campaignId: targetCampId },
      });

      // Crear nuevas secciones
      for (const s of suggested) {
        await tx.homeSection.create({
          data: {
            campaignId: targetCampId,
            type: s.type,
            order: s.order,
            enabled: s.enabled,
            config: JSON.stringify(s.config || {}),
          },
        });
      }
    });

    return getHomeSections({ campaignId: targetCampId });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    if (!Array.isArray(snap.homeSections)) snap.homeSections = [];

    snap.homeSections = snap.homeSections.filter(s => (s.campaignId || null) !== targetCampId);

    suggested.forEach((s, idx) => {
      snap.homeSections.push({
        id: `sec_tmpl_${Date.now()}_${idx}`,
        campaignId: targetCampId,
        type: s.type,
        order: s.order,
        enabled: s.enabled,
        config: JSON.stringify(s.config || {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    saveSnapshot(snap);
    return getHomeSections({ campaignId: targetCampId });
  }
};
