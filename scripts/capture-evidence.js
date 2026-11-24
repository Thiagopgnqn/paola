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
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
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
  console.log('Launching headless Chrome for verification...');
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,900',
      'about:blank',
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

  // Create new target/tab
  const newTargetRes = await fetch('http://localhost:9222/json/new?http://localhost:5173/login', { method: 'PUT' });
  const target = await newTargetRes.json();
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

  console.log('Navigating to login page...');
  await sleep(1500);

  // Set login credentials in localStorage for demo mode
  await cdp.evaluate(`
    localStorage.setItem('accessToken', 'demo-access-token-admin');
    localStorage.setItem('nocturna-demo-state', localStorage.getItem('nocturna-demo-state') || '');
  `);

  console.log('Navigating to /admin/campanas...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/campanas' });
  await sleep(2500);

  // 1. Screenshot of Campaigns list
  const campanasPath = path.join(ARTIFACTS_DIR, 'admin-campanas.png');
  await cdp.screenshot(campanasPath);

  // 2. Open Campaign Wizard Modal
  console.log('Opening Campaign Wizard...');
  await cdp.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Nueva Campaña'));
    if (btn) btn.click();
  `);
  await sleep(1200);
  const wizardPaso1Path = path.join(ARTIFACTS_DIR, 'admin-campana-wizard-paso1.png');
  await cdp.screenshot(wizardPaso1Path);

  // Fill in Preset "Hot Sale" and proceed to step 2
  console.log('Selecting Preset and proceeding to Step 2...');
  await cdp.evaluate(`
    const hotSaleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hot Sale'));
    if (hotSaleBtn) hotSaleBtn.click();
    setTimeout(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Siguiente: Promociones'));
      if (nextBtn) nextBtn.click();
    }, 400);
  `);
  await sleep(1200);
  const wizardPaso2Path = path.join(ARTIFACTS_DIR, 'admin-campana-wizard-builder.png');
  await cdp.screenshot(wizardPaso2Path);

  // Close wizard and go to Cupones
  console.log('Navigating to /admin/cupones...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/cupones' });
  await sleep(2000);
  const cuponesPath = path.join(ARTIFACTS_DIR, 'admin-cupones.png');
  await cdp.screenshot(cuponesPath);

  // Open Coupon Modal
  console.log('Opening Coupon Modal...');
  await cdp.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Nuevo Cupón'));
    if (btn) btn.click();
  `);
  await sleep(1000);
  const cuponModalPath = path.join(ARTIFACTS_DIR, 'admin-cupon-modal.png');
  await cdp.screenshot(cuponModalPath);

  // Navigating to /admin/colecciones
  console.log('Navigating to /admin/colecciones...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/colecciones' });
  await sleep(2000);
  const coleccionesPath = path.join(ARTIFACTS_DIR, 'admin-colecciones.png');
  await cdp.screenshot(coleccionesPath);

  // Switch to Etiquetas tab
  console.log('Switching to Etiquetas tab...');
  await cdp.evaluate(`
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Etiquetas'));
    if (tab) tab.click();
  `);
  await sleep(1000);
  const etiquetasPath = path.join(ARTIFACTS_DIR, 'admin-etiquetas.png');
  await cdp.screenshot(etiquetasPath);

  console.log('Done capturing screenshots!');
  cdp.close();
  chrome.kill();
}

main().catch(console.error);
