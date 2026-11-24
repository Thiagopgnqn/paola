import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\720e34ca-c04a-4f76-ac9b-eb756fc45ef2';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.exceptions = [];
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
          } else if (data.method === 'Runtime.consoleAPICalled') {
            const text = data.params.args.map((a) => a.value || a.description || '').join(' ');
            this.consoleLogs.push({ type: data.params.type, text });
          } else if (data.method === 'Runtime.exceptionThrown') {
            const text = data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text;
            this.exceptions.push(text);
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

  clearLogs() {
    this.consoleLogs = [];
    this.exceptions = [];
  }
}

async function verifyRoutes() {
  console.log('=== VERIFICANDO CONSOLA EN TODAS LAS RUTAS DE LA APP ===\n');

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
    console.error('No se pudo conectar a Chrome');
    chrome.kill();
    process.exit(1);
  }

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Autenticar sesión admin, mayoría de edad y cargar carrito de ejemplo
  await cdp.send('Page.navigate', { url: `${BASE_URL}/` });
  await sleep(1500);
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('nocturna_age_verified', 'true');
      localStorage.setItem('accessToken', 'demo_admin_access_token');
      localStorage.setItem('refreshToken', 'demo_refresh');
      localStorage.setItem('user', JSON.stringify({
        id: 'demo_user_admin',
        name: 'Admin Nocturna',
        email: 'admin@nocturna.demo',
        role: 'ADMIN'
      }));
      localStorage.setItem('nocturna_cart', JSON.stringify([
        {
          key: 'demo_prod_004_body-marley__var_marley_negro_s',
          product: {
            id: 'demo_prod_004_body-marley',
            name: 'Body Marley Encaje',
            slug: 'body-marley-encaje',
            price: 19500,
            category: { id: 'demo_cat_001_lenceria', name: 'Lencería', slug: 'lenceria' },
            images: ['/uploads/demo/body-marley-1.webp']
          },
          variant: {
            id: 'var_marley_negro_s',
            sku: 'BOD-MAR-NEG-S',
            color: 'Negro',
            size: 'S',
            price: 19500,
            stock: 8
          },
          quantity: 1
        }
      ]));
      return true;
    })()`,
  });

  const routesToTest = [
    { name: 'Portada Pública (Home)', path: '/', screenshot: 'home-campana-activa-blackfriday.png' },
    { name: 'Catálogo de Productos', path: '/catalogo' },
    { name: 'Ficha de Producto con Variantes', path: '/producto/demo_prod_004_body-marley' },
    { name: 'Carrito de Compras', path: '/carrito', screenshot: 'carrito-transferencia-bancaria.png' },
    { name: 'Checkout Confidencial', path: '/checkout', screenshot: 'checkout-transferencia-bancaria.png' },
    { name: 'Login de Usuario', path: '/login' },
    { name: 'Página de Ofertas', path: '/ofertas' },
    { name: 'Landing de Campaña', path: '/campanas/black-friday' },
    { name: 'Admin: Dashboard', path: '/admin' },
    { name: 'Admin: Productos', path: '/admin/productos' },
    { name: 'Admin: Categorías', path: '/admin/categorias' },
    { name: 'Admin: Pedidos', path: '/admin/pedidos' },
    { name: 'Admin: Campañas y Promociones', path: '/admin/campanas' },
    { name: 'Admin: Cupones de Descuento', path: '/admin/cupones' },
    { name: 'Admin: Colecciones y Tags', path: '/admin/colecciones' },
    { name: 'Admin: Constructor de Portada', path: '/admin/portada' },
    { name: 'Admin: Métricas y Atribución', path: '/admin/marketing' },
    { name: 'Admin: Usuarios y Cuentas', path: '/admin/usuarios' },
    { name: 'Admin: Configuración Tienda', path: '/admin/configuracion', screenshot: 'admin-configuracion-tienda.png' },
  ];

  let totalErrors = 0;
  const results = [];

  for (const r of routesToTest) {
    cdp.clearLogs();
    await cdp.send('Page.navigate', { url: `${BASE_URL}${r.path}` });
    await sleep(1800);

    // Filtrar logs de consola
    const errorLogs = cdp.consoleLogs.filter((l) => l.type === 'error');
    const uncaughtExceptions = cdp.exceptions;
    const errorsCount = errorLogs.length + uncaughtExceptions.length;

    if (errorsCount > 0) totalErrors += errorsCount;

    results.push({
      route: r.name,
      path: r.path,
      ok: errorsCount === 0,
      errorsCount,
      exceptions: uncaughtExceptions,
      errorLogs: errorLogs.map((l) => l.text),
      allLogs: cdp.consoleLogs.map((l) => `[${l.type}] ${l.text}`).slice(0, 3),
    });

    const statusBadge = errorsCount === 0 ? '✅ SIN ERRORES' : `❌ ${errorsCount} ERROR(ES)`;
    console.log(`[Ruta: ${r.path}] -> ${statusBadge}`);
    if (errorsCount > 0) {
      if (uncaughtExceptions.length > 0) {
        console.log('   Excepciones no capturadas:', uncaughtExceptions);
      }
      if (errorLogs.length > 0) {
        console.log('   Logs de error:', errorLogs.map((l) => l.text));
      }
    }

    if (r.screenshot) {
      try {
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        if (shot && shot.data) {
          const outPath = path.join(ARTIFACT_DIR, r.screenshot);
          fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
          console.log(`   📸 Captura guardada: ${r.screenshot}`);
        }
      } catch (err) {
        console.warn(`   ⚠️ No se pudo tomar captura: ${err.message}`);
      }
    }
  }

  console.log('\n======================================================');
  console.log(`TOTAL RUTAS TESTEADAS: ${routesToTest.length}`);
  console.log(`RUTAS LIMPIAS: ${results.filter((r) => r.ok).length}/${routesToTest.length}`);
  console.log(`TOTAL ERRORES EN CONSOLA: ${totalErrors}`);
  console.log('======================================================\n');

  chrome.kill();
  process.exit(totalErrors === 0 ? 0 : 1);
}

verifyRoutes();
