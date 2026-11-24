const fs = require('fs');

const auditServiceAdditions = `
export const getMarketingMetrics = async (filters = {}) => {
  const { range = '30d', startDate, endDate } = filters;

  // Calculate Date bounds
  let start = null;
  let end = null;
  const now = new Date();

  if (startDate) {
    start = new Date(startDate);
  } else if (range === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  } else if (range === '7d') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === '30d') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  } else if (range === 'all') {
    start = null;
  }

  if (endDate) {
    end = new Date(endDate);
  }

  const orderDateFilter = {};
  if (start && end) orderDateFilter.createdAt = { gte: start, lte: end };
  else if (start) orderDateFilter.createdAt = { gte: start };
  else if (end) orderDateFilter.createdAt = { lte: end };

  try {
    if (isDbDown()) throw new Error('DB_DOWN');

    const [orders, campaigns, coupons] = await Promise.all([
      prisma.order.findMany({
        where: {
          ...orderDateFilter,
          status: { not: 'CANCELLED' },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
              variant: { select: { id: true, sku: true, size: true, color: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaign.findMany({
        orderBy: [{ active: 'desc' }, { startsAt: 'desc' }],
        include: { promotions: true, coupons: true },
      }),
      prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return computeMetricsFromData({ orders, campaigns, coupons, range, start, end });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const rawOrders = snap.orders || [];
    const campaigns = snap.campaigns || [];
    const coupons = snap.coupons || [];

    const orders = rawOrders.filter((ord) => {
      if (ord.status === 'CANCELLED') return false;
      const d = new Date(ord.createdAt);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    return computeMetricsFromData({ orders, campaigns, coupons, range, start, end });
  }
};

export const computeMetricsFromData = ({ orders = [], campaigns = [], coupons = [], range, start, end }) => {
  let totalRevenue = 0;
  let totalDiscounts = 0;
  let totalUnits = 0;
  const utmSourceCounts = {};
  const utmCampaignCounts = {};
  const utmMediumCounts = {};

  for (const ord of orders) {
    const rev = Number(ord.total) || 0;
    totalRevenue += rev;

    const coupDisc = Number(ord.couponDiscount) || 0;
    const payDisc = Number(ord.paymentMethodDiscount) || 0;
    const shipDisc = Number(ord.shippingDiscount) || 0;
    totalDiscounts += coupDisc + payDisc + shipDisc;

    const items = ord.items || [];
    for (const it of items) {
      totalUnits += Number(it.quantity) || 0;
      // If item had promo discount, add it
      if (it.promoDiscount) {
        totalDiscounts += Number(it.promoDiscount) * (Number(it.quantity) || 1);
      }
    }

    // Source breakdown
    const src = (ord.utm_source || 'directo').toLowerCase();
    if (!utmSourceCounts[src]) utmSourceCounts[src] = { orders: 0, revenue: 0 };
    utmSourceCounts[src].orders += 1;
    utmSourceCounts[src].revenue += rev;

    // Campaign breakdown
    const camp = (ord.utm_campaign || 'sin_campana').toLowerCase();
    if (!utmCampaignCounts[camp]) utmCampaignCounts[camp] = { orders: 0, revenue: 0 };
    utmCampaignCounts[camp].orders += 1;
    utmCampaignCounts[camp].revenue += rev;

    // Medium breakdown
    const med = (ord.utm_medium || 'ninguno').toLowerCase();
    if (!utmMediumCounts[med]) utmMediumCounts[med] = { orders: 0, revenue: 0 };
    utmMediumCounts[med].orders += 1;
    utmMediumCounts[med].revenue += rev;
  }

  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Process Campaigns
  const campaignMetrics = campaigns.map((c) => {
    const matchingOrders = orders.filter((o) => {
      if (o.utm_campaign && o.utm_campaign.toLowerCase() === c.slug.toLowerCase()) {
        return true;
      }
      return false;
    });

    let campRevenue = 0;
    let campDiscounts = 0;
    let campUnits = 0;
    const productSoldMap = {};
    const sourcesMap = {};

    for (const mo of matchingOrders) {
      const rev = Number(mo.total) || 0;
      campRevenue += rev;
      campDiscounts += (Number(mo.couponDiscount) || 0) + (Number(mo.paymentMethodDiscount) || 0) + (Number(mo.shippingDiscount) || 0);

      const src = (mo.utm_source || 'directo').toLowerCase();
      sourcesMap[src] = (sourcesMap[src] || 0) + 1;

      for (const item of mo.items || []) {
        const q = Number(item.quantity) || 0;
        campUnits += q;
        const pId = item.productId || item.product?.id || 'prod';
        const pName = item.product?.name || item.name || 'Producto';
        const pSku = item.product?.sku || item.sku || '';

        if (!productSoldMap[pId]) {
          productSoldMap[pId] = { id: pId, name: pName, sku: pSku, quantity: 0, revenue: 0 };
        }
        productSoldMap[pId].quantity += q;
        productSoldMap[pId].revenue += (Number(item.price) || 0) * q;
      }
    }

    const views = Number(c.views) || 0;
    const cOrders = matchingOrders.length;
    const conversionRate = views > 0 ? Number(((cOrders / views) * 100).toFixed(2)) : 0;
    const campAvgTicket = cOrders > 0 ? Math.round(campRevenue / cOrders) : 0;
    const topProducts = Object.values(productSoldMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      status: c.status,
      views,
      ordersCount: cOrders,
      unitsSold: campUnits,
      revenue: Math.round(campRevenue),
      discountsGranted: Math.round(campDiscounts),
      averageTicket: campAvgTicket,
      conversionRate,
      topProducts,
      sourcesBreakdown: sourcesMap,
    };
  });

  // Process Coupons
  const couponMetrics = coupons.map((cp) => {
    const matchingOrders = orders.filter((o) => {
      if (!o.couponCode) return false;
      return o.couponCode.trim().toUpperCase() === cp.code.trim().toUpperCase();
    });

    let coupRevenue = 0;
    let coupDiscounts = 0;

    for (const mo of matchingOrders) {
      coupRevenue += Number(mo.total) || 0;
      coupDiscounts += Number(mo.couponDiscount) || 0;
    }

    const redemptions = matchingOrders.length;
    const avgTicket = redemptions > 0 ? Math.round(coupRevenue / redemptions) : 0;

    return {
      id: cp.id,
      code: cp.code,
      type: cp.type,
      value: Number(cp.value) || 0,
      active: cp.active,
      redemptionsCount: redemptions,
      totalDiscountGranted: Math.round(coupDiscounts),
      totalRevenueGenerated: Math.round(coupRevenue),
      averageTicket: avgTicket,
    };
  });

  return {
    period: {
      range,
      startDate: start ? start.toISOString() : null,
      endDate: end ? end.toISOString() : null,
    },
    overview: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      totalDiscounts: Math.round(totalDiscounts),
      averageTicket,
      totalUnits,
    },
    campaigns: campaignMetrics,
    coupons: couponMetrics,
    utmAttribution: {
      bySource: Object.entries(utmSourceCounts).map(([source, data]) => ({
        source,
        orders: data.orders,
        revenue: Math.round(data.revenue),
        averageTicket: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
      })),
      byCampaign: Object.entries(utmCampaignCounts).map(([campaign, data]) => ({
        campaign,
        orders: data.orders,
        revenue: Math.round(data.revenue),
      })),
      byMedium: Object.entries(utmMediumCounts).map(([medium, data]) => ({
        medium,
        orders: data.orders,
        revenue: Math.round(data.revenue),
      })),
    },
  };
};
`;

let content = fs.readFileSync('backend/src/services/audit.service.js', 'utf8');
if (!content.includes('getMarketingMetrics')) {
  content = content.trim() + '\n' + auditServiceAdditions;
  fs.writeFileSync('backend/src/services/audit.service.js', content, 'utf8');
  console.log('Successfully updated audit.service.js');
} else {
  console.log('Already updated');
}
