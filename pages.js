// Single list of pages, shared by server.js (local Express dev) and
// build.js (static build for Cloudflare). To add a page: add an entry here
// and create the matching views/<view>.ejs file.

module.exports = [
  {
    path: '/',
    view: 'homepage',
    pageTitle: 'Business ICT Australia | Connectivity, Security & Managed IT',
    metaDescription: 'Mobility, unified comms, managed IT, managed print and hardware procurement for Australian businesses. Book an obligation-free chat with Business ICT Australia.'
  },
  {
    path: '/mobility',
    view: 'mobility',
    pageTitle: 'Mobility | Business ICT Australia',
    metaDescription: 'Business mobile plans and hardware for Australian teams — complete fleet visibility, cost optimisation, and hands-on local support.'
  },
  {
    path: '/unified-comms',
    view: 'unifiedcoms',
    pageTitle: 'Unified Comms | Business ICT Australia',
    metaDescription: 'Integrated voice and collaboration solutions that keep your people connected in the office, on the road, or working remotely.'
  },
  {
    path: '/connectivity',
    view: 'connectivity',
    pageTitle: 'Connectivity | Business ICT Australia',
    metaDescription: 'Enterprise internet, SD-WAN and network security on Australia\'s most connected network — unlimited NBN, threat protection, and real-time insights.'
  },
  {
    path: '/managed-it',
    view: 'managed-it',
    pageTitle: 'Managed IT Services | Business ICT Australia',
    metaDescription: 'Proactive, full-stack Managed IT Services from Business ICT Australia — monitoring, helpdesk, cybersecurity, backups and strategic IT support.'
  },
  {
    path: '/managed-print',
    view: 'managed-print',
    pageTitle: 'Managed Print | Business ICT Australia',
    metaDescription: 'Kyocera managed print solutions for Australian businesses — tiered colour printing, lower total cost of ownership, and reliable performance.'
  },
  {
    path: '/hardware',
    view: 'hardware',
    pageTitle: 'Hardware Procurement | Business ICT Australia',
    metaDescription: 'Hardware as a Service and Device as a Service from Business ICT Australia — predictable monthly costs and fully managed device lifecycles.'
  },
  {
    path: '/about',
    view: 'aboutus',
    pageTitle: 'About Us | Business ICT Australia',
    metaDescription: 'Learn about Business ICT Australia — strong, secure, and quietly confident IT and telecommunications partners for Australian business.'
  },
  {
    path: '/contact',
    view: 'contactus',
    pageTitle: 'Contact Us | Business ICT Australia',
    metaDescription: 'Get in touch with Business ICT Australia. Request a call back or send us a message.'
  },
  {
    path: '/thank-you',
    view: 'thankyou',
    pageTitle: 'Thank You | Business ICT Australia',
    metaDescription: 'Thanks for getting in touch with Business ICT Australia.'
  }
];
