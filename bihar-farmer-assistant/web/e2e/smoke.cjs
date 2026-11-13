// Mobile smoke test. Start the API (:8080) and `npm run preview` (:4173), then: node e2e/smoke.cjs
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['Pixel 5'] });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(process.env.BASE_URL || 'http://localhost:4173/');
  await p.waitForSelector('text=बिहार किसान सहायक');
  await p.screenshot({ path: 'home.png', fullPage: true });
  // Profile
  await p.click('text=आपन जिला आ फसल बताईं');
  await p.selectOption('select >> nth=1', 'muzaffarpur');
  await p.click('button:has-text("धान")');
  await p.click('button:has-text("सहेजीं")');
  await p.waitForSelector('text=सहेज लिहल गइल');
  await p.click('[aria-label="वापस"]');
  // Ask flow via text
  await p.click('text=खेती के सवाल पूछीं');
  await p.fill('input[aria-label="सवाल लिखें"]', 'हमरा खेत में धान के फसल में पत्ता पीयर हो रहल बा।');
  await p.click('button:has-text("भेजीं")');
  await p.waitForSelector('text=केतना दिन');
  await p.fill('input[aria-label="सवाल लिखें"]', 'लगभग 30 दिन के बा आ खेत में पानी बा।');
  await p.click('button:has-text("भेजीं")');
  await p.waitForSelector('text=समझ गइनी');
  await p.screenshot({ path: 'ask.png', fullPage: true });
  await p.fill('input[aria-label="सवाल लिखें"]', 'आज मुजफ्फरपुर में मक्का का भाव का बा?');
  await p.click('button:has-text("भेजीं")');
  await p.waitForSelector('text=मंडी भाव ना मिल पावत');
  await p.click('[aria-label="वापस"]');
  await p.click('text=मौसम');
  await p.waitForTimeout(12000);
  await p.screenshot({ path: 'weather.png', fullPage: true });
  await p.click('[aria-label="वापस"]');
  await p.click('text=सरकारी योजना');
  await p.waitForSelector('text=PM-KISAN');
  await p.click('text=प्रधानमंत्री किसान सम्मान निधि');
  await p.screenshot({ path: 'schemes.png', fullPage: false });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('horizontal overflow:', overflow);
  console.log('errors:', JSON.stringify(errors));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
