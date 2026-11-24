const fs = require('fs');
let code = fs.readFileSync('frontend/src/api/demo/demoAdapter.js', 'utf8');

// 1. In resetDemoState, clear UTM
if (!code.includes("sessionStorage.removeItem('nocturna_utm_attribution')")) {
  code = code.replace(
    "localStorage.removeItem('refreshToken');",
    "localStorage.removeItem('refreshToken');\n    sessionStorage.removeItem('nocturna_utm_attribution');"
  );
}

// 2. In createInitialState, add subscribers
if (!code.includes("subscribers = clone(demoSeedData.subscribers || [])")) {
  code = code.replace(
    "const priceHistory = clone(demoSeedData.priceHistory || []);",
    "const priceHistory = clone(demoSeedData.priceHistory || []);\n  const subscribers = clone(demoSeedData.subscribers || []);"
  );
  code = code.replace(
    "couponRedemptions: [],",
    "couponRedemptions: [],\n    subscribers,"
  );
}

// 3. In loadDemoState, verify subscribers
if (!code.includes("if (!Array.isArray(parsed.subscribers))")) {
  code = code.replace(
    "if (!Array.isArray(parsed.cart)) parsed.cart = [];",
    `if (!Array.isArray(parsed.cart)) parsed.cart = [];
        if (!Array.isArray(parsed.subscribers)) {
          parsed.subscribers = clone(demoSeedData.subscribers || []);
          needsSave = true;
        }`
  );
}

// 4. In buildSampleOrders, ensure UTM and coupon data on sample orders
if (!code.includes("utm_campaign: 'black-friday'")) {
  code = code.replace(
    "total: Number(p1.price || 32000),\n      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // Hoy (hace 2 horas)",
    `total: Math.round(Number(p1.price || 32000) * 0.8),
      couponCode: 'BLACKFRIDAY',
      couponDiscount: Math.round(Number(p1.price || 32000) * 0.1),
      paymentMethodDiscount: Math.round(Number(p1.price || 32000) * 0.1),
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'black-friday',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),`
  );

  code = code.replace(
    "total: Number(p2.price || 28000) * 2,\n      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // Esta semana (hace 3 días)",
    `total: Number(p2.price || 28000) * 2,
      utm_source: 'whatsapp',
      utm_medium: 'chat',
      utm_campaign: 'black-friday',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),`
  );

  code = code.replace(
    "createdAt: new Date(Date.now() - 86400000 * 16).toISOString(), // Este mes (hace 16 días)",
    `utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: 'dia-de-la-madre',
      createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),`
  );
}

// 5. Add computeMarketingMetrics helper before handleDemoRequest
const computeMetricsCode = `
export function computeMarketingMetrics({ orders = [], campaigns = [], coupons = [], range = '30d', start = null, end = null }) {
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
      if (it.promoDiscount) {
        totalDiscounts += Number(it.promoDiscount) * (Number(it.quantity) || 1);
      }
    }

    const src = (ord.utm_source || 'directo').toLowerCase();
    if (!utmSourceCounts[src]) utmSourceCounts[src] = { orders: 0, revenue: 0 };
    utmSourceCounts[src].orders += 1;
    utmSourceCounts[src].revenue += rev;

    const camp = (ord.utm_campaign || 'sin_campana').toLowerCase();
    if (!utmCampaignCounts[camp]) utmCampaignCounts[camp] = { orders: 0, revenue: 0 };
    utmCampaignCounts[camp].orders += 1;
    utmCampaignCounts[camp].revenue += rev;

    const med = (ord.utm_medium || 'ninguno').toLowerCase();
    if (!utmMediumCounts[med]) utmMediumCounts[med] = { orders: 0, revenue: 0 };
    utmMediumCounts[med].orders += 1;
    utmMediumCounts[med].revenue += rev;
  }

  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const campaignMetrics = campaigns.map((c) => {
    const matchingOrders = orders.filter((o) => {
      if (o.utm_campaign && o.utm_campaign.toLowerCase() === (c.slug || '').toLowerCase()) {
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
}
`;

if (!code.includes('export function computeMarketingMetrics')) {
  code = code.replace(
    'export const handleDemoRequest = async (config) => {',
    computeMetricsCode + '\nexport const handleDemoRequest = async (config) => {'
  );
}

// 6. Add view increment endpoint in Section 7 (Campaigns)
const viewEndpoint = `
  if ((pathname.match(/^\\/campaigns\\/[^/]+\\/view$/) || pathname.match(/^\\/campaigns\\/view\\/[^/]+$/)) && method === 'post') {
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    const parts = pathname.split('/');
    const idOrSlug = parts[2] === 'view' ? decodeURIComponent(parts[3]) : decodeURIComponent(parts[2]);
    const camp = state.campaigns.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (camp) {
      camp.views = (Number(camp.views) || 0) + 1;
      saveDemoState(state);
      return makeResponse(config, 200, { success: true, views: camp.views });
    }
    return makeResponse(config, 200, { success: false, views: 0 });
  }
`;

if (!code.includes("pathname.match(/^\\/campaigns\\/[^/]+\\/view$/)")) {
  code = code.replace(
    "if (pathname === '/campaigns/active' && method === 'get') {",
    viewEndpoint + "\n  if (pathname === '/campaigns/active' && method === 'get') {"
  );
}

// 7. Add GET /audit/marketing in Section 12
const marketingAuditEndpoint = `
  if (pathname === '/audit/marketing' && method === 'get') {
    if (!Array.isArray(state.orders)) state.orders = [];
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    if (!Array.isArray(state.coupons)) state.coupons = [];

    const params = new URL(config.url, 'http://localhost').searchParams;
    const range = params.get('range') || '30d';
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    const now = new Date();
    let start = null;
    let end = endDate ? new Date(endDate) : null;

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
    }

    const filteredOrders = state.orders.filter((ord) => {
      if (ord.status === 'CANCELLED') return false;
      const d = new Date(ord.createdAt);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    const metrics = computeMarketingMetrics({
      orders: filteredOrders,
      campaigns: state.campaigns,
      coupons: state.coupons,
      range,
      start,
      end,
    });

    return makeResponse(config, 200, metrics);
  }
`;

if (!code.includes("pathname === '/audit/marketing'")) {
  code = code.replace(
    "if (pathname === '/audit/price-history' && method === 'get') {",
    marketingAuditEndpoint + "\n  if (pathname === '/audit/price-history' && method === 'get') {"
  );
}

// 8. Add Section 14 (Newsletter)
const newsletterSection = `
  // =========================================================================
  // 14. NEWSLETTER (/newsletter/*)
  // =========================================================================
  if (pathname === '/newsletter/subscribe' && method === 'post') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    const email = String(body.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      throw makeError(config, 400, { error: 'Ingresá un correo electrónico válido' });
    }
    if (body.consentGiven !== true) {
      throw makeError(config, 400, { error: 'Debés aceptar el consentimiento explícito (Ley 25.326)' });
    }

    const existing = state.subscribers.find((s) => s.email === email);
    const nowIso = new Date().toISOString();

    if (existing) {
      if (existing.active) {
        return makeResponse(config, 200, {
          message: 'Ya estás suscripto al newsletter de Tienda Nocturna.',
          subscriber: existing,
          alreadySubscribed: true,
        });
      }
      existing.active = true;
      existing.consentGiven = true;
      existing.consentDate = nowIso;
      existing.unsubscribedAt = null;
      saveDemoState(state);
      return makeResponse(config, 200, {
        message: '¡Reactivamos tu suscripción al newsletter con éxito!',
        subscriber: existing,
        reactivated: true,
      });
    }

    const newSub = {
      id: \`demo_sub_\${Date.now()}_\${Math.random().toString(36).slice(2, 6)}\`,
      email,
      consentGiven: true,
      consentDate: nowIso,
      active: true,
      unsubscribedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    state.subscribers.push(newSub);
    saveDemoState(state);

    return makeResponse(config, 201, {
      message: '¡Te suscribiste exitosamente al newsletter de Tienda Nocturna!',
      subscriber: newSub,
      created: true,
    });
  }

  if (pathname === '/newsletter/unsubscribe' && method === 'post') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    const email = String(body.email || '').toLowerCase().trim();
    const existing = state.subscribers.find((s) => s.email === email);
    if (existing) {
      existing.active = false;
      existing.unsubscribedAt = new Date().toISOString();
      saveDemoState(state);
    }
    return makeResponse(config, 200, {
      message: 'Te diste de baja del newsletter de Tienda Nocturna exitosamente.',
      success: true,
    });
  }

  if ((pathname === '/newsletter/admin/subscribers' || pathname === '/newsletter/subscribers') && method === 'get') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    return makeResponse(config, 200, {
      subscribers: state.subscribers,
      total: state.subscribers.length,
    });
  }

  if ((pathname === '/newsletter/admin/export' || pathname === '/newsletter/export') && method === 'get') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    const activeSubs = state.subscribers.filter((s) => s.active !== false);
    const bom = '\\uFEFF';
    const header = ['Email', 'Consentimiento Ley 25.326', 'Fecha Consentimiento', 'Estado', 'Fecha Suscripcion'].join(';');
    const rows = activeSubs.map((s) => {
      const email = \`"\${s.email.replace(/"/g, '""')}"\`;
      const consent = s.consentGiven ? 'SI (Explícito)' : 'NO';
      const consentDate = s.consentDate || '';
      const status = s.active ? 'Activo' : 'Baja';
      const createdAt = s.createdAt || '';
      return [email, consent, consentDate, status, createdAt].join(';');
    });
    const csvContent = bom + [header, ...rows].join('\\r\\n');
    return makeResponse(config, 200, csvContent, {
      'content-type': 'text/csv; charset=utf-8',
    });
  }
`;

if (!code.includes('// 14. NEWSLETTER')) {
  code = code.replace(
    "throw makeError(config, 404, { error: `Endpoint no soportado en modo demo: ${method.toUpperCase()} ${pathname}` });",
    newsletterSection + "\n  throw makeError(config, 404, { error: `Endpoint no soportado en modo demo: ${method.toUpperCase()} ${pathname}` });"
  );
}

fs.writeFileSync('frontend/src/api/demo/demoAdapter.js', code, 'utf8');
console.log('Successfully updated demoAdapter.js for Part 5');
