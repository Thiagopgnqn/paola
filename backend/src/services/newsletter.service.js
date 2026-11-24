import { PrismaClient } from '@prisma/client';
import { isDbDown, markDbDown } from './dbState.js';

const prisma = new PrismaClient();

// In-memory fallback if database is offline
const memorySubscribers = [];

export const subscribe = async ({ email, consentGiven }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date();

  try {
    if (isDbDown()) throw new Error('DB_DOWN');

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.active) {
        return {
          message: 'Ya estás suscripto al newsletter de Paola Calzados.',
          subscriber: existing,
          alreadySubscribed: true,
        };
      }

      // Reactivate subscriber
      const reactivated = await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          active: true,
          consentGiven: true,
          consentDate: now,
          unsubscribedAt: null,
        },
      });

      return {
        message: '¡Reactivamos tu suscripción al newsletter con éxito!',
        subscriber: reactivated,
        reactivated: true,
      };
    }

    const created = await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        consentGiven: true,
        consentDate: now,
        active: true,
      },
    });

    return {
      message: '¡Te suscribiste exitosamente al newsletter de Paola Calzados!',
      subscriber: created,
      created: true,
    };
  } catch (err) {
    markDbDown();
    // Memory fallback
    let sub = memorySubscribers.find((s) => s.email === normalizedEmail);
    if (sub) {
      if (sub.active) {
        return {
          message: 'Ya estás suscripto al newsletter de Paola Calzados.',
          subscriber: sub,
          alreadySubscribed: true,
        };
      }
      sub.active = true;
      sub.consentGiven = true;
      sub.consentDate = now;
      sub.unsubscribedAt = null;
      return {
        message: '¡Reactivamos tu suscripción al newsletter con éxito!',
        subscriber: sub,
        reactivated: true,
      };
    }

    sub = {
      id: `mem_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      consentGiven: true,
      consentDate: now,
      active: true,
      unsubscribedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    memorySubscribers.push(sub);

    return {
      message: '¡Te suscribiste exitosamente al newsletter de Paola Calzados!',
      subscriber: sub,
      created: true,
    };
  }
};

export const unsubscribe = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date();

  try {
    if (isDbDown()) throw new Error('DB_DOWN');

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      return {
        message: 'El correo electrónico no figuraba en la lista de suscriptores.',
        success: true,
      };
    }

    await prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: {
        active: false,
        unsubscribedAt: now,
      },
    });

    return {
      message: 'Te diste de baja del newsletter de Paola Calzados exitosamente.',
      success: true,
    };
  } catch (err) {
    markDbDown();
    const sub = memorySubscribers.find((s) => s.email === normalizedEmail);
    if (sub) {
      sub.active = false;
      sub.unsubscribedAt = now;
    }
    return {
      message: 'Te diste de baja del newsletter de Paola Calzados exitosamente.',
      success: true,
    };
  }
};

export const listSubscribers = async (filters = {}) => {
  const { status = 'active', limit = 100, page = 1 } = filters;
  const take = Math.min(Number(limit) || 100, 200);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  try {
    if (isDbDown()) throw new Error('DB_DOWN');

    const where = {};
    if (status === 'active') where.active = true;
    else if (status === 'unsubscribed') where.active = false;

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return { subscribers, total, page: Number(page), limit: take };
  } catch (err) {
    markDbDown();
    let list = [...memorySubscribers];
    if (status === 'active') list = list.filter((s) => s.active);
    else if (status === 'unsubscribed') list = list.filter((s) => !s.active);

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return {
      subscribers: list.slice(skip, skip + take),
      total: list.length,
      page: Number(page),
      limit: take,
    };
  }
};

export const generateCsv = async () => {
  try {
    let subscribers = [];
    if (!isDbDown()) {
      try {
        subscribers = await prisma.newsletterSubscriber.findMany({
          where: { active: true },
          orderBy: { createdAt: 'desc' },
        });
      } catch (err) {
        markDbDown();
      }
    }
    if (subscribers.length === 0 && memorySubscribers.length > 0) {
      subscribers = memorySubscribers.filter((s) => s.active);
    }

    // CSV with UTF-8 BOM for Argentine Excel compatibility
    const bom = '\uFEFF';
    const header = ['Email', 'Consentimiento Ley 25.326', 'Fecha Consentimiento', 'Estado', 'Fecha Suscripcion'].join(';');
    const rows = subscribers.map((s) => {
      const email = `"${s.email.replace(/"/g, '""')}"`;
      const consent = s.consentGiven ? 'SI (Explícito)' : 'NO';
      const consentDate = s.consentDate ? new Date(s.consentDate).toISOString() : '';
      const status = s.active ? 'Activo' : 'Baja';
      const createdAt = s.createdAt ? new Date(s.createdAt).toISOString() : '';
      return [email, consent, consentDate, status, createdAt].join(';');
    });

    return bom + [header, ...rows].join('\r\n');
  } catch (err) {
    console.error('Error generating newsletter CSV:', err);
    return '\uFEFFEmail;Consentimiento;Fecha Consentimiento;Estado;Fecha Suscripcion\r\n';
  }
};
