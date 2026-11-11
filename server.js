// Business ICT Australia - site server
// Run with: npm install   then   npm start
// (see README.md for full Windows command-prompt setup)

require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Gzip everything for faster loads
app.use(compression());

// Parse form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets (images/video/css/js) with long-lived caching.
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '0',
  etag: true
}));

// ---- Helpers ----
// Escape anything a visitor typed before putting it in the email HTML
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Remove line breaks so a visitor can't tamper with the email subject
function oneLine(value) {
  return String(value == null ? '' : value).replace(/[\r\n]+/g, ' ').trim();
}

// Ask Cloudflare whether the captcha was genuinely passed
async function verifyTurnstile(token) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not set - rejecting form submission.');
    return false;
  }
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token || ''
      })
    });
    const result = await response.json();
    return result.success === true;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

// ---- Routes ----
// Pages are listed in pages.js (shared with build.js, the Cloudflare build)
const pages = require('./pages');

pages.forEach((page) => {
  app.get(page.path, (req, res) => {
    res.render(page.view, {
      pageTitle: page.pageTitle,
      metaDescription: page.metaDescription,
      currentPath: page.path,
      // Only used by the contact page
      success: req.query.success || false,
      error: req.query.error || false,
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || ''
    });
  });
});

// ---- Contact form POST ----
app.post('/contact', async (req, res) => {
  const { name, company, email, phone, interest, message, website } = req.body;

  // Honeypot: real visitors never see this field, bots fill it in.
  // Pretend it worked so the bot moves on, but send nothing.
  if (website) {
    return res.redirect('/thank-you');
  }

  // Every field except the message is mandatory
  const requiredFields = [name, company, email, phone, interest];
  const allFilled = requiredFields.every(function (v) {
    return typeof v === 'string' && v.trim() !== '';
  });
  if (!allFilled) {
    return res.redirect('/contact?error=true');
  }

  // Captcha must have been passed
  const captchaOk = await verifyTurnstile(req.body['cf-turnstile-response']);
  if (!captchaOk) {
    return res.redirect('/contact?error=true');
  }

  try {
    await resend.emails.send({
      from: 'Business ICT Website <onboarding@resend.dev>',
      to: 'michael.patane@businessict.com.au',
      subject: `New enquiry from ${oneLine(name)} — ${oneLine(interest)}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Business:</strong> ${esc(company)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Phone:</strong> ${esc(phone)}</p>
        <p><strong>Interested in:</strong> ${esc(interest)}</p>
        <p><strong>Message:</strong><br>${esc(message || '(none)').replace(/\r?\n/g, '<br>')}</p>
      `
    });

    res.redirect('/thank-you');
  } catch (error) {
    console.error('Resend error:', error);
    res.redirect('/contact?error=true');
  }
});

// 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Business ICT Australia site running: http://localhost:${PORT}`);
});