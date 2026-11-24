const fs = require('fs');
let code = fs.readFileSync('frontend/src/api/demo/demoAdapter.js', 'utf8');

// 1. Export CURRENT_DEMO_VERSION
if (!code.includes('export const CURRENT_DEMO_VERSION = 5;')) {
  code = code.replace(
    "export const DEMO_STATE_KEY = 'nocturna-demo-state';",
    "export const DEMO_STATE_KEY = 'nocturna-demo-state';\nexport const CURRENT_DEMO_VERSION = 5;"
  );
  code = code.replace('version: 3,', 'version: CURRENT_DEMO_VERSION,');
}

// 2. Replace loadDemoState with clean robust version
const startIdx = code.indexOf('export const loadDemoState = () => {');
const endIdx = code.indexOf('export const saveDemoState = (state) => {');

const newLoadDemoState = `export const loadDemoState = () => {
  try {
    const raw = localStorage.getItem(DEMO_STATE_KEY);
    if (!raw) {
      const initial = createInitialState();
      saveDemoState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      const initial = createInitialState();
      saveDemoState(initial);
      return initial;
    }

    let needsSave = false;

    // Migración automática si la versión es anterior
    if (!parsed.version || parsed.version < CURRENT_DEMO_VERSION) {
      parsed.version = CURRENT_DEMO_VERSION;
      needsSave = true;
    }

    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.categories)) {
      const initial = createInitialState();
      saveDemoState(initial);
      return initial;
    }

    if (!Array.isArray(parsed.cart)) {
      parsed.cart = [];
      needsSave = true;
    }
    if (!Array.isArray(parsed.subscribers)) {
      parsed.subscribers = clone(demoSeedData.subscribers || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.campaigns) || parsed.campaigns.length === 0) {
      parsed.campaigns = clone(demoSeedData.campaigns || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.promotions)) {
      parsed.promotions = clone(demoSeedData.promotions || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.coupons)) {
      parsed.coupons = clone(demoSeedData.coupons || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.tags)) {
      parsed.tags = clone(demoSeedData.tags || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.collections)) {
      parsed.collections = clone(demoSeedData.collections || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.homeSections) || parsed.homeSections.length === 0) {
      parsed.homeSections = clone(demoSeedData.homeSections || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.couponRedemptions)) {
      parsed.couponRedemptions = [];
      needsSave = true;
    }
    if (!Array.isArray(parsed.priceHistory) || parsed.priceHistory.length === 0) {
      parsed.priceHistory = clone(demoSeedData.priceHistory || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.orders)) {
      parsed.orders = buildSampleOrders(parsed.products);
      needsSave = true;
    }
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [
        {
          id: 'demo_user_admin',
          name: 'Admin Nocturna (Demo)',
          email: DEMO_ADMIN_EMAIL,
          phone: '+54 9 3517 57-2841',
          role: 'ADMIN',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ];
      needsSave = true;
    }

    if (needsSave) {
      saveDemoState(parsed);
    }
    return parsed;
  } catch (err) {
    console.warn('[DemoMode] Error parseando estado local, reiniciando a inicial:', err);
    const initial = createInitialState();
    saveDemoState(initial);
    return initial;
  }
};

`;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.slice(0, startIdx) + newLoadDemoState + code.slice(endIdx);
  fs.writeFileSync('frontend/src/api/demo/demoAdapter.js', code, 'utf8');
  console.log('Successfully updated loadDemoState in demoAdapter.js');
} else {
  console.log('Indices not found in demoAdapter.js');
}
