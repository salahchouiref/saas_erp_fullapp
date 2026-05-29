const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const OUT = path.join(__dirname, 'captures', new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-'));
const SCREENSHOTS = path.join(OUT, 'screenshots');

const PAGES = [
  { path: '/',          name: '01-accueil',     label: "Page d'accueil" },
  { path: '/login',     name: '02-connexion',   label: 'Connexion' },
  { path: '/admin',     name: '03-dashboard',   label: 'Tableau de bord' },
  { path: '/admin/hr',       name: '04-rh',         label: 'RH - Employés' },
  { path: '/admin/clients',  name: '05-crm',        label: 'CRM - Clients' },
  { path: '/admin/projects', name: '06-projets',    label: 'Projets' },
  { path: '/admin/ai',       name: '07-ia',         label: 'Assistant IA' },
  { path: '/admin/stock',    name: '08-stock',      label: 'Stock' },
  { path: '/admin/orders',   name: '09-commandes',  label: 'Commandes' },
  { path: '/admin/delivery', name: '10-livraisons', label: 'Livraisons' },
  { path: '/admin/services', name: '11-services',   label: 'Services' },
  { path: '/admin/settings', name: '12-parametres', label: 'Paramètres' },
  { path: '/admin/audit',    name: '13-audit',      label: 'Audit' },
  { path: '/admin/payslips', name: '14-paie',       label: 'Paie' },
  { path: '/admin/roles',    name: '15-roles',      label: 'Rôles' },
];

async function main() {
  console.log('SaaS AI - Capture HD');
  console.log('════════════════════\n');
  fs.mkdirSync(SCREENSHOTS, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });
  const page = await ctx.newPage();

  // Login
  console.log('Connexion...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('  Connecté à:', await page.url(), '\n');

  // Screenshots
  console.log('Capture des pages :');
  for (const p of PAGES) {
    process.stdout.write(`  ${p.label.padEnd(22)} `);
    try {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS, `${p.name}.png`), fullPage: true });
      console.log('OK');
    } catch (err) {
      console.log('ERREUR');
      try { await page.screenshot({ path: path.join(SCREENSHOTS, `${p.name}-error.png`), fullPage: true }); } catch {}
    }
  }

  await browser.close();
  const files = fs.readdirSync(SCREENSHOTS);
  console.log(`\nTerminé — ${files.length} fichiers dans ${OUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
