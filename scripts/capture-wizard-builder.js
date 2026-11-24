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
  console.log('Launching headless Chrome for Step 4 and Creation Verification...');
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9227',
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
      const res = await fetch('http://localhost:9227/json/version');
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

  // Open /login first to set localStorage
  const newTargetRes = await fetch('http://localhost:9227/json/new?http://localhost:5173/login', { method: 'PUT' });
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

  await sleep(1500);

  // Set tokens and age verification in localStorage
  await cdp.evaluate(`
    localStorage.setItem('accessToken', 'demo-access-token-admin');
    localStorage.setItem('nocturna_age_verified', 'true');
  `);

  console.log('Navigating to /admin/campanas...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/campanas' });
  await sleep(2000);

  // Click "Nueva Campaña"
  await cdp.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Nueva Campaña'));
    if (btn) btn.click();
  `);
  await sleep(800);

  // Select "Hot Sale" preset
  await cdp.evaluate(`
    const hotSaleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hot Sale'));
    if (hotSaleBtn) hotSaleBtn.click();
  `);
  await sleep(600);

  // Jump to Step 4 (Resumen y Confirmación)
  await cdp.evaluate(`
    const step4 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Resumen'));
    if (step4) step4.click();
  `);
  await sleep(1000);

  const wizardResumenPath = path.join(ARTIFACTS_DIR, 'admin-campana-wizard-resumen.png');
  await cdp.screenshot(wizardResumenPath);

  // Click "Guardar como Borrador"
  console.log('Saving campaign as Borrador...');
  await cdp.evaluate(`
    const draftBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Guardar como Borrador'));
    if (draftBtn) draftBtn.click();
  `);
  await sleep(2000);

  // Capture updated list with new campaign
  const campanasCreadaPath = path.join(ARTIFACTS_DIR, 'admin-campanas-creada.png');
  await cdp.screenshot(campanasCreadaPath);

  console.log('Complete!');
  cdp.close();
  chrome.kill();
}

main().catch(console.error);
