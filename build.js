// Static build for Cloudflare Workers.
// Renders every page in pages.js to plain HTML in ./dist and copies ./public
// alongside it. Cloudflare serves ./dist directly; worker.js only handles the
// contact form. Run with: npm run build

require('dotenv').config({ quiet: true });
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const pages = require('./pages');

const DIST = path.join(__dirname, 'dist');
const VIEWS = path.join(__dirname, 'views');

// The Turnstile site key is public (it ends up in the page HTML either way).
// Taken from .env if present, otherwise from "vars" in wrangler.json.
const siteKey =
  process.env.TURNSTILE_SITE_KEY ||
  (require('./wrangler.json').vars || {}).TURNSTILE_SITE_KEY ||
  '';
if (!siteKey) {
  console.error('Build failed: TURNSTILE_SITE_KEY is not set (.env or "vars" in wrangler.json).');
  console.error('Without it the contact form captcha cannot load.');
  process.exit(1);
}

async function render(page, outFile, extra) {
  const html = await ejs.renderFile(path.join(VIEWS, page.view + '.ejs'), {
    pageTitle: page.pageTitle,
    metaDescription: page.metaDescription,
    currentPath: page.path,
    success: false,
    error: false,
    turnstileSiteKey: siteKey,
    ...extra
  });
  fs.writeFileSync(path.join(DIST, outFile), html);
  console.log('  ' + outFile);
}

(async () => {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.cpSync(path.join(__dirname, 'public'), DIST, { recursive: true });

  console.log('Rendering pages:');
  for (const page of pages) {
    // "/" -> index.html, "/about" -> about.html (Cloudflare serves it at /about)
    const outFile = page.path === '/' ? 'index.html' : page.path.slice(1) + '.html';
    await render(page, outFile);
  }

  // Contact page with the "something went wrong" banner showing.
  // worker.js serves this for /contact?error=true.
  const contact = pages.find((p) => p.path === '/contact');
  await render(contact, 'contact-error.html', { error: true });

  // Same response the Express server gives for unknown URLs
  fs.writeFileSync(path.join(DIST, '404.html'), 'Page not found');
  console.log('  404.html');

  console.log('Done -> dist/');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
