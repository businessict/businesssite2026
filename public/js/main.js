/* =========================================================
   BUSINESS ICT AUSTRALIA — site interactions
   Vanilla JS, no dependencies, so nothing blocks first paint.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.hidden = isOpen;
      navToggle.classList.toggle('is-open', !isOpen);
    });
  }

    /* ---------- Dropdown toggle (desktop) ---------- */
  var dropdownToggle = document.querySelector('.dropdown-toggle');
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function () {
      var expanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
      dropdownToggle.setAttribute('aria-expanded', String(!expanded));
      dropdownToggle.parentElement.classList.toggle('is-open', !expanded);
    });
  }

  /* ---------- Dropdown toggle (mobile) ---------- */
  var mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
  var mobileDropdownMenu = document.getElementById('mobile-services-menu');
  if (mobileDropdownToggle && mobileDropdownMenu) {
    mobileDropdownMenu.hidden = true;
    mobileDropdownToggle.setAttribute('aria-expanded', 'false');

    mobileDropdownToggle.addEventListener('click', function () {
      var expanded = mobileDropdownToggle.getAttribute('aria-expanded') === 'true';
      mobileDropdownToggle.setAttribute('aria-expanded', String(!expanded));
      mobileDropdownMenu.hidden = expanded;
    });
  }

  /* ---------- Carousels: arrows + dots + progress bar ---------- */
  function initCarousel(root) {
    var viewport = root.querySelector('.carousel__viewport');
    if (!viewport) return;

    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');
    var progressBar = root.querySelector('.carousel__progress-bar');
    var dotsWrap = root.querySelector('.carousel__dots');
    var cards = Array.prototype.slice.call(viewport.children);

    // Build dots (one per card, capped so it stays a helpful indicator not noise)
    var maxDots = Math.min(cards.length, 8);
    var dots = [];
    if (dotsWrap && cards.length > 1) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < maxDots; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to card ' + (i + 1));
        (function (index) {
          dot.addEventListener('click', function () {
            var card = cards[Math.round((index / (maxDots - 1 || 1)) * (cards.length - 1))];
            if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
          });
        })(i);
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
    }

    function update() {
      var maxScroll = viewport.scrollWidth - viewport.clientWidth;
      var progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;

      if (progressBar) {
        progressBar.style.width = Math.max(8, progress * 100) + '%';
      }
      if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 4;
      if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= maxScroll - 4;

      if (dots.length) {
        var activeIndex = Math.round(progress * (dots.length - 1));
        dots.forEach(function (d, idx) { d.classList.toggle('is-active', idx === activeIndex); });
      }
    }

    function scrollByCard(direction) {
      var card = cards[0];
      var cardWidth = card ? card.getBoundingClientRect().width + 22 : 260;
      viewport.scrollBy({ left: direction * cardWidth * 1.4, behavior: 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { scrollByCard(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollByCard(1); });

    viewport.addEventListener('scroll', debounce(update, 40), { passive: true });
    window.addEventListener('resize', debounce(update, 150));
    update();
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments, ctx = this;
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* ---------- Lazy-load hero/background video only once it's near view ---------- */
  var lazyVideos = document.querySelectorAll('video[data-src]');
  if ('IntersectionObserver' in window && lazyVideos.length) {
    var videoObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var video = entry.target;
          video.src = video.getAttribute('data-src');
          video.load();
          video.play().catch(function () {});
          obs.unobserve(video);
        }
      });
    }, { rootMargin: '200px' });
    lazyVideos.forEach(function (v) { videoObserver.observe(v); });
  } else {
    lazyVideos.forEach(function (v) { v.src = v.getAttribute('data-src'); });
  }

  /* ---------- Single, deliberate hero reveal on load (no scattered fades) ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function () { hero.classList.add('is-visible'); });
  }

  /* ---------- Same reveal-on-load treatment for simple inner-page heroes ---------- */
  var pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    requestAnimationFrame(function () { pageHero.classList.add('is-visible'); });
  }

  /* ---------- Reveal-on-scroll for any element marked data-reveal ----------
     Used for content below the fold (e.g. an image next to a section) that
     should animate in the same way as the hero, but only once it's in view. */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }
})();

// ── Coverflow Carousel ──
(function () {
  const track = document.getElementById('coverflowTrack');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.cf-card'));
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Position offsets for up to 5 visible slots: -2, -1, 0, +1, +2
  const slots = [
    { x: -440, scale: 0.62, opacity: 0.35, z: 1 },
    { x: -230, scale: 0.78, opacity: 0.60, z: 2 },
    { x: 0,    scale: 1.00, opacity: 1.00, z: 5 },
    { x: 230,  scale: 0.78, opacity: 0.60, z: 2 },
    { x: 440,  scale: 0.62, opacity: 0.35, z: 1 },
  ];

  function render() {
    cards.forEach((card, i) => {
      // distance from current, wrapped
      let offset = i - current;
      if (offset > total / 2)  offset -= total;
      if (offset < -total / 2) offset += total;

      const slotIndex = offset + 2; // map -2..+2 → 0..4

      if (slotIndex < 0 || slotIndex > 4) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.zIndex = '0';
        return;
      }

      const s = slots[slotIndex];
      card.style.opacity = s.opacity;
      card.style.zIndex  = s.z;
      card.style.pointerEvents = slotIndex === 2 ? 'auto' : 'none';
      card.style.transform = `translate(-50%, -50%) translateX(${s.x}px) scale(${s.scale})`;
    });
  }

  function next() { current = (current + 1) % total; render(); }
  function prev() { current = (current - 1 + total) % total; render(); }

  function startAuto() { autoTimer = setInterval(next, 3200); }
  function stopAuto()  { clearInterval(autoTimer); }

  document.getElementById('cfNext').addEventListener('click', () => { stopAuto(); next(); startAuto(); });
  document.getElementById('cfPrev').addEventListener('click', () => { stopAuto(); prev(); startAuto(); });

  // Pause on hover
  track.closest('.coverflow-carousel').addEventListener('mouseenter', stopAuto);
  track.closest('.coverflow-carousel').addEventListener('mouseleave', startAuto);

  render();
  startAuto();
})();

