import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\720e34ca-c04a-4f76-ac9b-eb756fc45ef2';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.id && this.callbacks.has(data.id)) {
            const cb = this.callbacks.get(data.id);
            this.callbacks.delete(data.id);
            if (data.error) cb.reject(new Error(data.error.message));
            else cb.resolve(data.result);
          }
        } catch (e) {
          console.error(e);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log('Launching headless Chrome for Part 3 verification...');
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,900',
      'http://localhost:5173/',
    ],
    { stdio: 'ignore' }
  );

  let versionInfo = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://localhost:9222/json/version');
      if (res.ok) {
        versionInfo = await res.json();
        break;
      }
    } catch {}
  }

  if (!versionInfo) {
    console.error('Failed to connect to Chrome debugging port');
    chrome.kill();
    return;
  }

  // Find the browser tab target of type 'page'
  const targets = await (await fetch('http://localhost:9222/json/list')).json();
  const target = targets.find((t) => t.type === 'page');
  if (!target) {
    console.error('No page target found');
    chrome.kill();
    return;
  }

  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Setup localStorage: age verified, clean state with honesty test product
  await cdp.evaluate(`
    localStorage.setItem('nocturna_age_verified', 'true');
    localStorage.setItem('accessToken', 'demo-access-token-admin');
    localStorage.setItem('user', JSON.stringify({
      id: 'demo_user_admin_001',
      name: 'Admin Nocturna',
      email: 'admin@nocturna.demo',
      role: 'ADMIN'
    }));

    // Inject a special product WITHOUT price history into demo state to prove the honesty rule
    const stateStr = localStorage.getItem('nocturna-demo-state');
    if (stateStr) {
      try {
        const state = JSON.parse(stateStr);
        // Ensure honesty product exists
        if (!state.products.find(p => p.id === 'demo_prod_sin_historial')) {
          state.products.unshift({
            id: 'demo_prod_sin_historial',
            name: 'Boutique Corset Exclusivo (Sin Historial Previo)',
            description: 'Producto nuevo incorporado en promoción directa sin historial de 30 días.',
            sku: 'HONEST-001',
            price: 45000,
            stock: 4,
            soldCount: 0,
            createdAt: new Date().toISOString(),
            active: true,
            categoryId: 'cat_lenceria',
            category: { id: 'cat_lenceria', name: 'Lencería', slug: 'lenceria' },
            variants: [],
            imageUrl: '/brand/instagram-profile.jpg'
          });
          // Ensure NO priceHistory entry exists for this product
          state.priceHistory = (state.priceHistory || []).filter(ph => ph.productId !== 'demo_prod_sin_historial');
          localStorage.setItem('nocturna-demo-state', JSON.stringify(state));
        }
      } catch (e) {}
    }
  `);

  await sleep(1000);

  // =========================================================================
  // CAPTURA 1: Producto con promoción y precio tachado honesto (con PriceHistory)
  // =========================================================================
  console.log('Capturing: Producto con promoción honesta (Baby Doll Venecia)...');
  await cdp.send('Page.navigate', {
    url: 'http://localhost:5173/producto/demo_prod_001_baby-doll-venecia',
  });
  await sleep(2500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-producto-con-oferta.png'));

  // =========================================================================
  // CAPTURA 2: PRUEBA DE HONESTIDAD — Producto en promo SIN historial (NO muestra precio tachado)
  // =========================================================================
  console.log('Capturing: Prueba de honestidad (Producto sin historial previo)...');
  await cdp.send('Page.navigate', {
    url: 'http://localhost:5173/producto/demo_prod_sin_historial',
  });
  await sleep(2500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-honesta-sin-precio-tachado.png'));

  // =========================================================================
  // CAPTURA 3: Página /ofertas con productos en oferta y orden por mayor descuento
  // =========================================================================
  console.log('Capturing: Página dedicada /ofertas...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/ofertas' });
  await sleep(2500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-pagina-ofertas.png'));

  // =========================================================================
  // CAPTURA 4: Carrito con aviso 2x1 (1 cosmético en carrito)
  // =========================================================================
  console.log('Capturing: Carrito con aviso 2x1...');
  await cdp.evaluate(`
    // Cargar 1 unidad de cosmética para disparar aviso 2x1
    const state = JSON.parse(localStorage.getItem('nocturna-demo-state') || '{}');
    const cosProd = state.products.find(p => p.categoryId && p.categoryId.includes('cosmetica')) || state.products[11];
    const cart = [
      {
        key: cosProd.id,
        product: cosProd,
        variant: null,
        variantDescription: null,
        quantity: 1
      }
    ];
    state.cart = cart;
    localStorage.setItem('nocturna-demo-state', JSON.stringify(state));
    localStorage.setItem('nocturna_cart', JSON.stringify(cart));
    localStorage.removeItem('nocturna_coupon');
  `);
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/carrito' });
  await sleep(2500);
  await cdp.evaluate(`
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('mayor de 18'));
    if (btn) btn.click();
  `);
  await sleep(1000);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-carrito-aviso-2x1.png'));

  // =========================================================================
  // CAPTURA 5: Carrito con 2x1 aplicado + Envío gratis + Cupón aplicado
  // =========================================================================
  console.log('Capturing: Carrito con 2x1 aplicado, cupón BIENVENIDA y envío gratis...');
  await cdp.evaluate(`
    const state = JSON.parse(localStorage.getItem('nocturna-demo-state') || '{}');
    const cosProd = state.products.find(p => p.categoryId && p.categoryId.includes('cosmetica')) || state.products[11];
    const lencProd = state.products[0];
    const cart = [
      {
        key: cosProd.id,
        product: cosProd,
        variant: null,
        variantDescription: null,
        quantity: 2 // Aplica 2x1
      },
      {
        key: lencProd.id,
        product: lencProd,
        variant: null,
        variantDescription: null,
        quantity: 2 // Supera $50.000 para envío gratis
      }
    ];
    state.cart = cart;
    localStorage.setItem('nocturna-demo-state', JSON.stringify(state));
    localStorage.setItem('nocturna_cart', JSON.stringify(cart));
    localStorage.setItem('nocturna_coupon', 'BIENVENIDA');
  `);
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/carrito' });
  await sleep(2500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-carrito-con-promos-y-cupon.png'));

  // =========================================================================
  // CAPTURA 6: Cupón inválido — mensaje de error en vivo
  // =========================================================================
  console.log('Capturing: Cupón inválido con mensaje de error...');
  await cdp.evaluate(`
    localStorage.setItem('nocturna_coupon', 'CUPON_FALSO_123');
  `);
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/carrito' });
  await sleep(2500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-carrito-cupon-invalido.png'));

  // =========================================================================
  // CAPTURA 7: Checkout con selector de método de pago (Transferencia 10% OFF)
  // =========================================================================
  console.log('Capturing: Checkout con bonificación por transferencia...');
  await cdp.evaluate(`
    localStorage.setItem('nocturna_coupon', 'BIENVENIDA');
  `);
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/checkout' });
  await sleep(2500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-checkout-transferencia.png'));

  // =========================================================================
  // CAPTURA 8: Envío de pedido y confirmación con link de WhatsApp
  // =========================================================================
  console.log('Completing checkout order...');
  const whatsappUrlResult = await cdp.evaluate(`
    new Promise((resolve) => {
      // Completar campos del checkout
      const nameInput = document.querySelector('input[name="customerName"]');
      const emailInput = document.querySelector('input[name="customerEmail"]');
      const phoneInput = document.querySelector('input[name="customerPhone"]');
      const addressInput = document.querySelector('input[name="customerAddress"]');
      if (nameInput) nameInput.value = 'Carolina Rossi';
      if (emailInput) emailInput.value = 'carolina.rossi@ejemplo.com';
      if (phoneInput) phoneInput.value = '351 757 2841';
      if (addressInput) addressInput.value = 'Bv. Chacabuco 650, 5B';

      // Disparar input events
      [nameInput, emailInput, phoneInput, addressInput].forEach(el => {
        if (el) el.dispatchEvent(new Event('input', { bubbles: true }));
      });

      // Submit form
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
      }

      setTimeout(() => {
        const linkEl = document.querySelector('a[href*="wa.me"]');
        resolve(linkEl ? linkEl.href : null);
      }, 1500);
    })
  `);

  console.log('Generated WhatsApp link:', whatsappUrlResult);
  await sleep(1500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'tienda-checkout-confirmado-whatsapp.png'));

  // =========================================================================
  // CAPTURA 9: Admin Pedidos con detalle de descuentos, cupón y campaña aplicada
  // =========================================================================
  console.log('Capturing: Admin Pedidos con detalle de orden...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/pedidos' });
  await sleep(2500);

  // Click on the first order in the table to open modal
  await cdp.evaluate(`
    const firstOrderRow = document.querySelector('table tbody tr');
    if (firstOrderRow) {
      firstOrderRow.click();
    }
  `);
  await sleep(1500);
  await cdp.screenshot(path.join(ARTIFACTS_DIR, 'admin-pedido-detalle-descuentos.png'));

  cdp.close();
  chrome.kill();
  console.log('All Part 3 evidence captured successfully!');
}

main().catch(console.error);
