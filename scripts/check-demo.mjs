import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const server = await createServer({configFile:false, root:'docs', server:{host:'127.0.0.1',port:4173,strictPort:true}});
await server.listen();
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1440,height:1440}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173');
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  assert.equal(await page.locator('#compare-panel').isVisible(),true);
  await page.getByRole('button',{name:'Technical diff',exact:true}).click();
  assert.equal(await page.locator('#diff-panel').isVisible(),true);
  assert.equal(await page.locator('#compare-panel').isVisible(),false);
  await page.getByRole('button',{name:'Approved baseline',exact:true}).click();
  assert.equal(await page.locator('#baseline-panel').isVisible(),true);
  await page.getByRole('button',{name:'Before & after',exact:true}).click();
  await page.screenshot({path:'docs/assets/portfolio-preview.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'../../work/portfolio-mobile.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false,'Mobile horizontal overflow');
  assert.deepEqual(errors,[]);
  console.log('Demo verified: comparison views, images, JavaScript, and mobile overflow. Preview exported.');
} finally { await browser?.close(); await server.close(); }

