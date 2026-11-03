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
app.get('/', (req, res) => {
  res.render('homepage', {
    pageTitle: 'Business ICT Australia | Connectivity, Security & Managed IT',
    metaDescription: 'Mobility, unified comms, managed IT, managed print and hardware procurement for Australian businesses. Book an obligation-free chat with Business ICT Australia.',
    currentPath: '/'
  });
});

app.get('/mobility', (req, res) => {
  res.render('mobility', {
    pageTitle: 'Mobility | Business ICT Australia',
    metaDescription: 'Business mobile plans and hardware for Australian teams — complete fleet visibility, cost optimisation, and hands-on local support.',
    currentPath: '/mobility'
  });
});

app.get('/unified-comms', (req, res) => {
  res.render('unifiedcoms', {
    pageTitle: 'Unified Comms | Business ICT Australia',
    metaDescription: 'Integrated voice and collaboration solutions that keep your people connected in the office, on the road, or working remotely.',
    currentPath: '/unified-comms'
  });
});

app.get('/connectivity', (req, res) => {
  res.render('connectivity', {
    pageTitle: 'Connectivity | Business ICT Australia',
    metaDescription: 'Enterprise internet, SD-WAN and network security on Australia\'s most connected network — unlimited NBN, threat protection, and real-time insights.',
    currentPath: '/connectivity'
  });
});

app.get('/managed-it', (req, res) => {
  res.render('managed-it', {
    pageTitle: 'Managed IT Services | Business ICT Australia',
    metaDescription: 'Proactive, full-stack Managed IT Services from Business ICT Australia — monitoring, helpdesk, cybersecurity, backups and strategic IT support.',
    currentPath: '/managed-it'
  });
});

app.get('/managed-print', (req, res) => {
  res.render('managed-print', {
    pageTitle: 'Managed Print | Business ICT Australia',
    metaDescription: 'Kyocera managed print solutions for Australian businesses — tiered colour printing, lower total cost of ownership, and reliable performance.',
    currentPath: '/managed-print'
  });
});

app.get('/hardware', (req, res) => {
  res.render('hardware', {
    pageTitle: 'Hardware Procurement | Business ICT Australia',
    metaDescription: 'Hardware as a Service and Device as a Service from Business ICT Australia — predictable monthly costs and fully managed device lifecycles.',
    currentPath: '/hardware'
  });
});

app.get('/about', (req, res) => {
  res.render('aboutus', {
    pageTitle: 'About Us | Business ICT Australia',
    metaDescription: 'Learn about Business ICT Australia — strong, secure, and quietly confident IT and telecommunications partners for Australian business.',
    currentPath: '/about'
  });
});

app.get('/contact', (req, res) => {
  res.render('contactus', {
    pageTitle: 'Contact Us | Business ICT Australia',
    metaDescription: 'Get in touch with Business ICT Australia. Request a call back or send us a message.',
    currentPath: '/contact',
    success: req.query.success || false,
    error: req.query.error || false,
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || ''
  });
});

// ---- Thank-you page (after a successful form submission) ----
app.get('/thank-you', (req, res) => {
  res.render('thankyou', {
    pageTitle: 'Thank You | Business ICT Australia',
    metaDescription: 'Thanks for getting in touch with Business ICT Australia.',
    currentPath: '/thank-you'
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