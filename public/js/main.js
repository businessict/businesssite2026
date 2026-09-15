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

  /* ---------- Dropdown toggle (touch/keyboard support) ---------- */
  var dropdownToggle = document.querySelector('.dropdown-toggle');
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function () {
      var expanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
      dropdownToggle.setAttribute('aria-expanded', String(!expanded));
      dropdownToggle.parentElement.classList.toggle('is-open', !expanded);
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
})();
