// Business ICT Australia - site server
// Run with: npm install   then   npm start
// (see README.md for full Windows command-prompt setup)

const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Gzip everything for faster loads
app.use(compression());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets (images/video/css/js) with long-lived caching.
// While you're actively swapping placeholder images, drop maxAge to 0.
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '0',
  etag: true
}));

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
    currentPath: '/contact'
  });
});

// 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Business ICT Australia site running: http://localhost:${PORT}`);
});

