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

/* ── Navbar hamburger ────────────────────────────────────── */
(function () {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
})();

/* ── FAQ Accordion ───────────────────────────────────────── */
(function () {
  const buttons = document.querySelectorAll('.faq-toggle');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const icon  = btn.querySelector('.faq-icon');
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
  const trackDesc = document.getElementById('track-description');
  if (!trackBtns.length || !trackDesc) return;

  const descriptions = {
    fintech:      'Pioneering the future of finance by enhancing security, ensuring transparency, and fostering trust through cutting-edge decentralized technologies.',
    healthcare:   'Revolutionizing patient care and medical systems through technology — from AI diagnostics to accessible health platforms for all.',
    logistics:    'Reimagining supply chains and transportation with smart, data-driven solutions to make the world more efficiently connected.',
    innovation:   'Freedom to innovate! Build solutions for any domain that could make a meaningful impact on people and communities.',
    sustainable:  'Engineering for a greener future — creating solutions that balance technological progress with environmental sustainability.',
  };

  trackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      trackBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.track;
      if (trackDesc && descriptions[key]) {
        trackDesc.textContent = descriptions[key];
      }
    });
  });

  // Default active
  if (trackBtns[0]) trackBtns[0].click();
})();
