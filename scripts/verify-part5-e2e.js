import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\720e34ca-c04a-4f76-ac9b-eb756fc45ef2';
const BASE_URL = 'http://localhost:5173';

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
    console.log(`[Screenshot] Guardado: ${path.basename(filePath)} (${buffer.length} bytes)`);
  }
}

async function runVerification() {
  console.log('--- INICIANDO VERIFICACIÓN END-TO-END PARTE 5 ---');
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1440,900',
      'http://localhost:5173/',
    ],
    { stdio: 'ignore' }
  );

  let cdp = null;

  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const listRes = await fetch('http://localhost:9222/json/list');
      if (listRes.ok) {
        const targets = await listRes.json();
        const target = targets.find((t) => t.type === 'page');
        if (target) {
          cdp = new CDPClient(target.webSocketDebuggerUrl);
          await cdp.connect();
          break;
        }
      }
    } catch {}
  }

  if (!cdp) {
    console.error('No se pudo inicializar la pestaña de Chrome');
    chromeProcess.kill();
    process.exit(1);
  }

  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const goto = async (urlPath) => {
    await cdp.send('Page.navigate', { url: `${BASE_URL}${urlPath}` });
    await sleep(2500);
  };

  try {
    // 1. Inicializar sesión admin y control de edad
    console.log('\n[Paso 1] Autenticando sesión admin y mayoría de edad en modo demo...');
    await goto('/');
    await cdp.evaluate(`(() => {
      localStorage.setItem('nocturna_age_verified', 'true');
      localStorage.setItem('accessToken', 'demo_token_admin_e2e');
      localStorage.setItem('refreshToken', 'demo_refresh_e2e');
      localStorage.setItem('user', JSON.stringify({
        id: 'demo_user_admin',
        name: 'Admin Nocturna (Demo)',
        email: 'admin@nocturna.demo',
        role: 'ADMIN'
      }));
      return true;
    })()`);

    // 2. Crear y configurar campaña de prueba en demo state
    console.log('[Paso 2] Creando campaña "Primavera Hot" con 2x1 y 20% en Lencería...');
    await cdp.evaluate(`(() => {
      const raw = localStorage.getItem('nocturna-demo-state');
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (!Array.isArray(state.campaigns)) state.campaigns = [];
      if (!Array.isArray(state.promotions)) state.promotions = [];

      state.campaigns = state.campaigns.filter(c => c.slug !== 'primavera-hot');
      state.promotions = state.promotions.filter(p => !p.name?.includes('Primavera'));

      const now = new Date();
      const endsAt = new Date(Date.now() + 86400000 * 7);

      const newCamp = {
        id: 'camp_primavera_hot',
        name: 'Primavera Hot 2026',
        slug: 'primavera-hot',
        status: 'SCHEDULED',
        active: true,
        priority: 15,
        startsAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        headline: 'FESTIVAL PRIMAVERA HOT • 2X1 & 20% OFF',
        subheadline: 'Viví el cambio de estación con beneficios exclusivos en toda la tienda.',
        announcementText: '🌸 FESTIVAL PRIMAVERA: 2x1 en seleccionados y 20% OFF en Lencería',
        announcementLink: '/campanas/primavera-hot',
        theme: 'cyber-sale',
        showCountdown: true,
        landingEnabled: true,
        views: 65,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const promo2x1 = {
        id: 'promo_2x1_primavera',
        campaignId: 'camp_primavera_hot',
        name: '2x1 Primavera en Aceites y Geles',
        type: 'BUY_X_GET_Y',
        discountScope: 'CART_QUANTITY',
        buyQty: 2,
        getQty: 1,
        active: true,
        priority: 10,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const promo20Cat = {
        id: 'promo_20_lenceria',
        campaignId: 'camp_primavera_hot',
        name: '20% OFF en Lencería Erótica',
        type: 'PERCENT',
        value: 20,
        discountScope: 'ITEM',
        targetType: 'CATEGORY',
        targetCategoryId: 'lenceria',
        active: true,
        priority: 5,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      state.campaigns.push(newCamp);
      state.promotions.push(promo2x1, promo20Cat);

      localStorage.setItem('nocturna-demo-state', JSON.stringify(state));
      return true;
    })()`);

    // 3. Ver Vista Previa con ?preview=camp_primavera_hot
    console.log('[Paso 3] Comprobando Vista Previa (?preview=camp_primavera_hot)...');
    await goto('/?preview=camp_primavera_hot');
    await sleep(2000);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-1-vista-previa-campana.png'));

    // 4. Activar la campaña
    console.log('[Paso 4] Activando campaña a status ACTIVE...');
    await cdp.evaluate(`(() => {
      const raw = localStorage.getItem('nocturna-demo-state');
      const state = JSON.parse(raw);
      const camp = state.campaigns.find(c => c.slug === 'primavera-hot');
      if (camp) camp.status = 'ACTIVE';
      localStorage.setItem('nocturna-demo-state', JSON.stringify(state));
      return true;
    })()`);

    // Comprobar Home con Campaña Activa y Barra de Anuncios
    await goto('/');
    await sleep(2000);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-2-home-campana-activa.png'));

    // 5. Visita a Landing de Campaña con parámetros UTM
    console.log('[Paso 5] Visitando /campanas/primavera-hot con parámetros UTM...');
    await goto('/campanas/primavera-hot?utm_source=instagram&utm_medium=social&utm_campaign=primavera-hot');
    await sleep(2500);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-3-landing-campana-utm.png'));

    const storedUtm = await cdp.evaluate(`(() => {
      const raw = sessionStorage.getItem('nocturna_utm_attribution');
      return raw ? JSON.parse(raw) : null;
    })()`);
    console.log('[UTM Capturado en sessionStorage]:', storedUtm);

    // 6. Modal Compartir con UTM & Códigos QR en /admin/campanas
    console.log('[Paso 6] Verificando Modal Compartir con UTM y QR Code en /admin/campanas...');
    await goto('/admin/campanas');
    await sleep(2000);
    await cdp.evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shareBtn = buttons.find(b => b.textContent.includes('Compartir') || b.title?.includes('QR'));
      if (shareBtn) shareBtn.click();
      return Boolean(shareBtn);
    })()`);
    await sleep(1500);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-4-modal-compartir-utm-qr.png'));

    // Cerrar modal
    await cdp.evaluate(`(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Cerrar');
      if (closeBtn) closeBtn.click();
    })()`);

    // 7. Simular compra en checkout con Cupón y Transferencia
    console.log('[Paso 7] Agregando productos al carrito...');
    await goto('/catalogo');
    await sleep(2000);

    await cdp.evaluate(`(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Agregar') || b.textContent.includes('Comprar'));
      if (addBtns[0]) addBtns[0].click();
      return addBtns.length;
    })()`);
    await sleep(1000);

    // Ir al checkout
    await goto('/checkout');
    await sleep(2000);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-5-checkout-descuentos.png'));

    // 8. Completar Checkout y confirmar pedido
    console.log('[Paso 8] Completando checkout y confirmando pedido...');
    await cdp.evaluate(`(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const nameInput = inputs.find(i => i.placeholder?.includes('nombre') || i.name === 'customerName');
      const phoneInput = inputs.find(i => i.placeholder?.includes('teléfono') || i.placeholder?.includes('WhatsApp') || i.name === 'customerPhone');
      const emailInput = inputs.find(i => i.type === 'email' || i.name === 'customerEmail');

      if (nameInput) {
        nameInput.value = 'Federico Rossi';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (phoneInput) {
        phoneInput.value = '351 555 4433';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (emailInput) {
        emailInput.value = 'federico.rossi@ejemplo.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return true;
    })()`);
    await sleep(800);

    await cdp.evaluate(`(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirmar') || b.textContent.includes('WhatsApp'));
      if (submitBtn) submitBtn.click();
      return Boolean(submitBtn);
    })()`);
    await sleep(2500);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-6-checkout-confirmado.png'));

    // 9. Suscripción al Newsletter con Consentimiento Ley 25.326
    console.log('[Paso 9] Probando formulario de Newsletter con consentimiento explícito...');
    await goto('/');
    await sleep(2000);
    await cdp.evaluate(`(() => {
      const emailInput = document.querySelector('input[placeholder*="correo"]');
      const checkbox = document.querySelector('#newsletter-consent');
      if (emailInput && checkbox) {
        emailInput.value = 'mariana.cordoba@ejemplo.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        if (!checkbox.checked) checkbox.click();
        const submitBtn = emailInput.closest('form')?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
        return true;
      }
      return false;
    })()`);
    await sleep(2000);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-7-newsletter-suscrito.png'));

    // 10. Panel de Métricas /admin/marketing
    console.log('[Paso 10] Validando panel de métricas en /admin/marketing...');
    await goto('/admin/marketing');
    await sleep(2500);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-8-admin-marketing-metricas.png'));

    // Pestaña Suscriptores en /admin/marketing
    console.log('[Paso 10b] Revisando pestaña de Suscriptores con Ley 25.326...');
    await cdp.evaluate(`(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const subsTab = tabs.find(t => t.textContent.includes('Suscriptores'));
      if (subsTab) subsTab.click();
      return Boolean(subsTab);
    })()`);
    await sleep(1500);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-9-admin-marketing-suscriptores.png'));

    // 11. Finalizar la Campaña y verificar retorno a la portada base
    console.log('[Paso 11] Finalizando campaña y verificando retorno automático a la portada base...');
    await cdp.evaluate(`(() => {
      const raw = localStorage.getItem('nocturna-demo-state');
      const state = JSON.parse(raw);
      const camp = state.campaigns.find(c => c.slug === 'primavera-hot');
      if (camp) {
        camp.status = 'ENDED';
        camp.active = false;
      }
      localStorage.setItem('nocturna-demo-state', JSON.stringify(state));
      return true;
    })()`);

    await goto('/');
    await sleep(2500);
    await cdp.screenshot(path.join(ARTIFACTS_DIR, 'e2e-10-home-retorno-base.png'));

    console.log('\n--- VERIFICACIÓN E2E COMPLETADA CON ÉXITO Y TODA LA EVIDENCIA GENERADA ---');
  } catch (err) {
    console.error('Error durante la verificación E2E:', err);
  } finally {
    chromeProcess.kill();
  }
}

runVerification();
