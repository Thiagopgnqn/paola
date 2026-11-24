import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPriceHistory() {
  console.log('--- Sembrando historial de precios inicial para productos existentes ---');
  try {
    await prisma.$connect();
    const products = await prisma.product.findMany({
      include: { variants: true, priceHistories: true },
    });

    let productHistCount = 0;
    let variantHistCount = 0;

    for (const prod of products) {
      const hasBaseHistory = (prod.priceHistories || []).some((ph) => !ph.variantId);
      if (!hasBaseHistory) {
        await prisma.priceHistory.create({
          data: {
            productId: prod.id,
            oldPrice: prod.price,
            newPrice: prod.price,
            reason: 'INITIAL_SEED',
            changedBy: 'SYSTEM',
          },
        });
        productHistCount++;
      }

      for (const v of prod.variants || []) {
        const hasVarHistory = (prod.priceHistories || []).some((ph) => ph.variantId === v.id);
        if (!hasVarHistory) {
          await prisma.priceHistory.create({
            data: {
              productId: prod.id,
              variantId: v.id,
              oldPrice: v.price,
              newPrice: v.price,
              reason: 'INITIAL_SEED',
              changedBy: 'SYSTEM',
            },
          });
          variantHistCount++;
        }
      }
    }

    console.log(
      `✔ Registros de historial creados: ${productHistCount} productos base y ${variantHistCount} variantes.`
    );
  } catch (err) {
    console.warn(`[seed-price-history] Aviso: no se pudo conectar a la base de datos (${err.message.split('\n')[0]}). Se sembrará automáticamente cuando la base esté conectada.`);
  } finally {
    await prisma.$disconnect();
  }
}

seedPriceHistory();
