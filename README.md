# Business ICT Australia — website boilerplate

Node.js + Express + EJS. Plain CSS/JS (no build step), so it runs immediately
and stays fast.

## Folder structure

```
BusinessICT-site/
├── server.js                 Express app + routes
├── package.json
├── views/
│   ├── homepage.ejs           "/"
│   ├── aboutus.ejs            "/about"
│   ├── contactus.ejs          "/contact"
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
└── public/
    ├── css/style.css          all styling, brand tokens at the top
    ├── js/main.js             mobile nav, carousels, lazy-load video
    ├── images/                drop logos/photos here (see below)
    └── videos/                drop mp4/webm here
```

## 1. Set up (Windows Command Prompt)

You already have an empty folder. From `C:\Users\MichaelPatane>`:

```
cd Desktop\BusinessICT-site
```

Copy all the files from this delivery into that folder (keeping the folder
structure above), then run:

```
npm install
```

This reads `package.json` and installs Express, EJS and compression into a
new `node_modules` folder (already excluded via `.gitignore`).

## 2. Run it

```
npm start
```

You should see:

```
Business ICT Australia site running: http://localhost:3000
```

Open that URL in your browser. Leave the Command Prompt window open — closing
it stops the server. Press `Ctrl + C` in that window to stop it manually.

### Optional: auto-restart while you edit
```
npm install --save-dev nodemon
npm run dev
```
`nodemon` restarts the server automatically whenever you save a file, which
is handy while you're wiring up new pages.

## 3. Where things live / how to extend

- **New page**: add a route in `server.js` (`app.get('/new-page', ...)`)
  and a matching `views/new-page.ejs` file, copying the `<head>` block and
  `<%- include('partials/header') %>` / `<%- include('partials/footer') %>`
  pattern from `aboutus.ejs`.
- **Nav links**: edit `views/partials/header.ejs` (desktop + mobile menus
  are both in that one file).
- **Footer columns**: edit `views/partials/footer.ejs`.
- **Brand colours/fonts**: all defined once as CSS variables at the top of
  `public/css/style.css` (`:root { ... }`) — change them there and the whole
  site updates.

## 4. Adding real logos, photos and video later

Everything is wired to accept real assets without any code restructuring:

- Drop files into `public/images/` or `public/videos/`.
- Reference them from an EJS view as `/images/filename.jpg` or
  `/videos/filename.mp4` (the leading `/` matters — it maps to the `public`
  folder root).
- Every real `<img>` tag you add should include:
  ```html
  <img src="/images/example.jpg" alt="Descriptive text" loading="lazy" width="800" height="600">
  ```
  `loading="lazy"` defers off-screen images until the user scrolls near them.
  The `width`/`height` attributes stop the page jumping around while images
  load (this matters for page-speed scoring). The **hero** image is the one
  exception — keep it `loading="eager"` (or omit the attribute) since it's
  visible immediately.
- Commented-out `<img>` examples are already left in place inside
  `homepage.ejs` (hero art, hardware cards, resource cards) — just delete the
  placeholder `<svg>`/empty `<div>` next to each comment and uncomment the
  `<img>` line once you have the real file.
- For the logo marquee, replace the text placeholders in `homepage.ejs`
  (`Partner Logo 1`, `Partner Logo 2`, ...) with:
  ```html
  <img src="/images/partners/telstra.svg" alt="Telstra Wholesale" loading="lazy" width="120" height="34">
  ```
- For background/looping video, use the existing lazy-load pattern already
  wired up in `main.js`:
  ```html
  <video data-src="/videos/hero-loop.mp4" muted loop playsinline></video>
  ```
  The script only sets `src` and starts playback once the video scrolls
  near the viewport, so it never blocks the initial page load.

## 5. Performance notes already built in

- `compression` middleware gzips every response.
- Static assets are served with a 7-day cache header (`server.js`) — turn
  this down to `0` temporarily while you're actively swapping placeholder
  images so your browser doesn't cache stale versions.
- No external JS frameworks or build tooling — one small `main.js` file,
  loaded with `defer` so it never blocks rendering.
- Google Fonts are loaded with `preconnect` hints and `display=swap` so text
  renders immediately in a fallback font while Ubuntu/Ubuntu Condensed load.
- Carousels use native horizontal scroll + `scroll-snap`, not a JS slider
  library, so they stay lightweight and work with touch/trackpad gestures
  out of the box; the arrows/dots/progress bar are a thin JS layer on top.

## 6. Content already in place (from your brief)

- **Homepage**: hero, logo marquee, Mobility (plan cards + "Available now"
  hardware cards), Unified Comms (plan cards), "Did you know" stats using
  current published Australian figures (ASD Annual Cyber Threat Report
  2024–25 and ABS Working Arrangements, August 2025 — update these each
  year as new reports are published), and a resources grid mirroring your
  existing checklist / "power of one" content.
- **About**: brand-voice value cards, CTA.
- **Contact**: form + local-expert info card.
- **Footer**: replicates the structure of your supplied footer image
  (Quick Links / Services / Support / Terms of Use + social icons).

Logos and final photography/video were not supplied yet — every spot they'll
go is marked with an inline HTML comment in the `.ejs` files.
