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
      desc: '<p>The Core Committee serves as the central governing body and driving force behind MAGNUM 2026-27. Responsible for overarching strategy, event vision, budgeting, resource allocation, and high-level decision-making, the core team steers the entire fest toward spectacular execution.</p><p>From orchestrating seamless cross-committee coordination to establishing partnerships, sponsorships, and institutional administration, the Core Committee ensures every event under the MAGNUM banner delivers an unforgettable pirate-themed experience for all participants.</p>'
    },
    printing: {
      title: 'PRINTING AND DESIGNING COMMITTEE',
      desc: '<p>The Printing & Designing Committee is the creative studio behind the vibrant visual identity of MAGNUM 2026-27. They bring the festival\'s oceanic theme to life through captivating artwork, official banners, posters, brochures, ID cards, and promotional merchandise.</p><p>Combining artistic flair with precision design workflows, the team ensures consistent visual aesthetics across all physical and digital touchpoints, captivating attendees from first glance to final award.</p>'
    },
    stage: {
      title: 'STAGE COMMITTEE',
      desc: '<p>The Stage Committee commands the epicenter of excitement at MAGNUM 2026-27. Responsible for main stage management, sound and lighting cues, artist hospitality, and flawless event scheduling, they keep the crowd engaged and the show running seamlessly.</p><p>Working dynamically behind the scenes, this team handles stage setups, anchoring transitions, and real-time audio-visual coordination to give every performer the spotlight they deserve.</p>'
    },
    decoration: {
      title: 'DECORATION COMMITTEE',
      desc: '<p>The Decoration Committee transforms the campus into an immersive, high-seas oceanic battleground. From intricate entrance arches and stage backdrops to thematic lighting installations and creative props, they craft an unforgettable aesthetic universe.</p><p>Blending craftsmanship, artistic innovation, and atmospheric elements, the team crafts a venue experience that immerses every visitor into the legendary voyage of MAGNUM.</p>'
    },
    website: {
      title: 'WEBSITE COMMITTEE',
      desc: '<p>The Website Committee designs, builds, and maintains the digital gateway of MAGNUM 2026-27. Powering online registrations, live updates, interactive schedules, and responsive user experiences, they keep participants informed and connected worldwide.</p><p>Leveraging modern web technologies, fluid canvas animations, and sleek design systems, the team ensures effortless navigation and an engaging digital experience across all mobile and desktop devices.</p>'
    },
    technical: {
      title: 'TECHNICAL COMMITTEE',
      desc: '<p>The Technical Committee forms the robust technical engine of MAGNUM 2026-27. They oversee IT infrastructure, network stability, live streaming, digital scoring systems, and technical event execution with speed and precision.</p><p>Handling everything from equipment setup to real-time troubleshooting, the technical crew ensures every coding contest, gaming tournament, and digital showcase operates flawlessly.</p>'
    },
    discipline: {
      title: 'DISCIPLINE COMMITTEE',
      desc: '<p>The Discipline Committee is dedicated to preserving safety, order, and sportsmanship throughout MAGNUM 2026-27. They manage crowd control, security protocols, venue access, and smooth traffic flow across all campus zones.</p><p>Ensuring a welcoming, fair, and secure environment for all participants, guests, and organizers, the discipline team keeps the fest running harmoniously from start to finish.</p>'
    },
    catering: {
      title: 'CATERING COMMITTEE',
      desc: '<p>The Catering Committee manages food operations, hospitality, and refreshment management for MAGNUM 2026-27. They ensure guests, judges, participants, and crew members remain well-nourished and refreshed throughout the festival.</p><p>Coordinating with vendors, managing dietary preferences, and organizing prompt meal distribution schedules, the catering team delivers top-tier hospitality with care and efficiency.</p>'
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
        if (trackDesc) trackDesc.innerHTML = committeeData[key].desc;
      }
    });
  });

  // Default active
  if (trackBtns[0]) trackBtns[0].click();
})();
