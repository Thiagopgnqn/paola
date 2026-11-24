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
}

async function verifySubcategories() {
  console.log('=== VERIFICANDO SELECCIÓN DE SUBCATEGORÍA EN CAMPAÑAS ===\n');

  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9223',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,900',
      `${BASE_URL}/`,
    ],
    { stdio: 'ignore' }
  );

  let cdp = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const listRes = await fetch('http://localhost:9223/json/list');
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
    console.error('No se pudo conectar a Chrome en puerto 9223');
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

  // Autenticar sesión admin
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
      return true;
    })()`,
  });

  // Navegar a /admin/campanas
  console.log('1. Navegando a /admin/campanas...');
  await cdp.send('Page.navigate', { url: `${BASE_URL}/admin/campanas` });
  await sleep(2000);

  // Abrir el asistente de creación haciendo clic en "Crear Campaña"
  console.log('2. Abriendo el modal asistente de campaña...');
  const openModalRes = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createBtn = buttons.find((b) => b.textContent.includes('Crear Campaña') || b.textContent.includes('Nueva Campaña'));
      if (createBtn) {
        createBtn.click();
        return true;
      }
      return false;
    })()`,
  });
  console.log('   Botón clickeado:', openModalRes.result.value);
  await sleep(1200);

  // Avanzar a Paso 2 (Constructor de Promociones)
  console.log('3. Avanzando a Paso 2 (Constructor de Promociones)...');
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const step2Btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('2') && b.textContent.includes('Promociones y Descuentos'));
      if (step2Btn) {
        step2Btn.click();
        return true;
      }
      // O hacer clic en Siguiente
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Siguiente'));
      if (nextBtn) {
        nextBtn.click();
        return true;
      }
      return false;
    })()`,
  });
  await sleep(1200);

  // Cambiar el alcance a "SUBCATEGORY"
  console.log('4. Cambiando alcance objetivo a SUBCATEGORY...');
  const switchTargetRes = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      // Buscar el select que tiene la opción 'SUBCATEGORY'
      const targetScopeSelect = selects.find(s => Array.from(s.options).some(o => o.value === 'SUBCATEGORY'));
      if (targetScopeSelect) {
        targetScopeSelect.value = 'SUBCATEGORY';
        targetScopeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    })()`,
  });
  console.log('   Selector de alcance cambiado a SUBCATEGORY:', switchTargetRes.result.value);
  await sleep(1000);

  // Inspeccionar las opciones del select de subcategoría
  console.log('5. Inspeccionando opciones del select de subcategoría...');
  const inspectRes = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      // Buscar el select de subcategorías
      const subcatSelect = selects.find(s => {
        const parent = s.closest('div');
        return parent && parent.textContent.includes('Seleccionar Subcategoría');
      });

      if (!subcatSelect) return { found: false, error: 'Select de subcategoría no encontrado' };

      const optgroups = Array.from(subcatSelect.querySelectorAll('optgroup')).map(g => ({
        label: g.label,
        optionsCount: g.children.length,
        options: Array.from(g.children).map(o => ({ value: o.value, text: o.textContent.trim() }))
      }));

      const allOptions = Array.from(subcatSelect.querySelectorAll('option')).map(o => ({
        value: o.value,
        text: o.textContent.trim()
      }));

      // Seleccionar una subcategoría real (ej: Bodys)
      const bodysOpt = allOptions.find(o => o.text.toLowerCase().includes('bodys') || o.value.includes('bodys'));
      if (bodysOpt) {
        subcatSelect.value = bodysOpt.value;
        subcatSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }

      return {
        found: true,
        optgroupsCount: optgroups.length,
        optgroups,
        totalOptions: allOptions.length,
        firstFiveOptions: allOptions.slice(0, 8),
        selected: subcatSelect.value
      };
    })()`,
  });

  console.log('\n--- RESULTADO DE LA INSPECCIÓN ---');
  console.log(JSON.stringify(inspectRes.result.value, null, 2));

  // Tomar captura de pantalla como evidencia
  await sleep(1000);
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  if (shot && shot.data) {
    const outPath = path.join(ARTIFACT_DIR, 'admin-campana-subcategoria-seleccionada.png');
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`\n📸 Captura guardada con éxito en: ${outPath}`);
  }

  chrome.kill();
  const ok = inspectRes.result.value?.found && inspectRes.result.value?.totalOptions > 1;
  process.exit(ok ? 0 : 1);
}

verifySubcategories().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});

