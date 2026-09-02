/* ========================================================
   HACKFEST '26 — Shared JavaScript
   ======================================================== */

/* ── Loader ──────────────────────────────────────────────── */
(function () {
  const loader = document.getElementById('loader');
  const logoEl = document.getElementById('loader-logo');
  const progressEl = document.getElementById('loader-progress');

  if (!loader) return;

  // Show logo
  setTimeout(() => logoEl && logoEl.classList.add('visible'), 100);

  // Animate progress 0 → 100
  let progress = 0;
  const step = () => {
    if (progress < 100) {
      progress += Math.random() * 4 + 1;
      if (progress > 100) progress = 100;
      if (progressEl) progressEl.textContent = Math.floor(progress) + '%';
      setTimeout(step, 40 + Math.random() * 60);
    } else {
      // Fade out loader
      setTimeout(() => {
        loader.classList.add('hide');
      }, 300);
    }
  };
  step();
})();

/* ── Navbar Scroll Reveal & Hamburger ────────────────────── */
(function () {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!navbar) return;

  const isHeroPage = !!document.getElementById('hero');

  function checkScroll() {
    if (!isHeroPage || window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      if (isOpen) {
        navbar.classList.add('menu-open');
      } else {
        navbar.classList.remove('menu-open');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        navbar.classList.remove('menu-open');
      }
    });
  }
})();

/* ── FAQ Accordion ───────────────────────────────────────── */
(function () {
  const buttons = document.querySelectorAll('.faq-toggle');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      const isOpen = panel.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-panel').forEach(p => p.classList.remove('open'));
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotated'));

      // Toggle clicked
      if (!isOpen) {
        panel.classList.add('open');
        icon && icon.classList.add('rotated');
      }
    });
  });
})();

/* ── Scroll fade-in (IntersectionObserver) ───────────────── */
(function () {
  const targets = document.querySelectorAll('.fade-up, .scale-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

/* ── Tracks selector (Home page) ────────────────────────── */
(function () {
  const trackBtns = document.querySelectorAll('.track-btn');
  const trackTitle = document.getElementById('track-title');
  const trackDesc = document.getElementById('track-description');
  if (!trackBtns.length || (!trackDesc && !trackTitle)) return;

  const committeeData = {
    core: {
      title: 'CORE COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    },
    printing: {
      title: 'PRINTING AND DESIGNING COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    },
    stage: {
      title: 'STAGE COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    },
    decoration: {
      title: 'DECORATION COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    },
    website: {
      title: 'WEBSITE COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    },
    technical: {
      title: 'TECHNICAL COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    },
    discipline: {
      title: 'DISCIPLINE COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    },
    catering: {
      title: 'CATERING COMMITTEE',
      desc: 'Supporting committee of MAGNUM 2026-27.'
    }
  };

  trackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      trackBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const key = btn.dataset.track;
      if (committeeData[key]) {
        if (trackTitle) trackTitle.textContent = committeeData[key].title;
        if (trackDesc) trackDesc.textContent = committeeData[key].desc;
      }
    });
  });

  // Default active
  if (trackBtns[0]) trackBtns[0].click();
})();
