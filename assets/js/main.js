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

/* ── Home Page Voyage Logs Timeline Renderer ── */
(function () {
  function init() {
    const dropdown = document.getElementById('home-event-select-dropdown');
    const container = document.getElementById('home-voyage-timeline-container');
    if (!dropdown || !container) return;

    const eventsData = [
      { id: 'coding', title: 'CODING (CODEVOYAGE)', icon: '💻', category: 'EVENT • TECHNICAL', desc: 'Test your algorithmic supremacy and problem-solving velocity in high-intensity coding challenges.' },
      { id: 'comm', title: 'COMMUNICATION (COMMUNICATION EVENT)', icon: '🎙️', category: 'EVENT • SOFT SKILLS', desc: 'Master the art of persuasive speaking, debate, and strategic articulation under pressure.' },
      { id: 'content', title: 'CONTENT CREATION (CONTENT CREATION EVENT)', icon: '📹', category: 'EVENT • CREATIVE MEDIA', desc: 'Craft compelling digital media, narrative reels, and visual stories that captivate the audience.' },
      { id: 'cyber', title: 'CYBER SECURITY (BLACK PEARL)', icon: '🛡️', category: 'EVENT • TECHNICAL', desc: 'Penetrate defenses, uncover vulnerabilities, and conquer Capture The Flag (CTF) security grids.' },
      { id: 'data', title: 'DATA ANALYTICS (DATA CHRONICLES)', icon: '📊', category: 'EVENT • TECHNICAL', desc: 'Extract actionable intelligence, build predictive models, and decode complex datasets.' },
      { id: 'design', title: 'DESIGNING (CAPTAIN\'S CANVAS)', icon: '🎨', category: 'EVENT • CREATIVE MEDIA', desc: 'Engineers of visual beauty — craft intuitive UI/UX, brand identity, and graphics.' },
      { id: 'gaming', title: 'E-GAMING (PIRATES OF ARENA)', icon: '🎮', category: 'EVENT • ESPORTS', desc: 'Clash in tactical multiplayer battles and prove team coordination in the high-octane gaming arena.' },
      { id: 'quiz', title: 'QUIZ (VOYAGE OF WISDOM)', icon: '❓', category: 'EVENT • INTELLECTUAL', desc: 'Buzzer rounds, rapid-fire trivia, and deep technology knowledge showdowns.' },
      { id: 'prompt', title: 'PROMPT ENGINEERING (PROMPT MARINERS)', icon: '⚡', category: 'EVENT • TECHNICAL', desc: 'Harness generative AI models with precision prompts to synthesize solutions, code, and media.' },
      { id: 'cultural', title: 'GROUP EVENT (RHYTHM RAIDERS)', icon: '🎭', category: 'EVENT • CULTURAL', desc: 'Celebrate artistry, choreography, and group cultural performances on the grand stage.' }
    ];

    const eventSchedules = {
      coding: {
        venue: "Lab 2",
        round1: "10:00 AM – 12:00 PM",
        round2: "2:00 PM – 4:30 PM",
        round3: "9:00 AM – 12:00 PM",
      },
      comm: {
        round1: "10:00 AM – 12:00 PM",
        round2: "2:00 PM – 4:00 PM",
        round3: "9:00 AM – 11:00 AM",
      },
      content: {
        round1: "10:00 AM – 1:00 PM",
        round2: "2:00 PM – 4:00 PM",
        round3: "8:30 AM – 11:30 AM",
      },
      cyber: {
        round1: "10:00 AM – 12:30 PM",
        round2: "1:30 PM – 4:30 PM",
        round3: "9:00 AM – 12:00 PM",
      },
      data: {
        round1: "10:00 AM – 12:30 PM",
        round2: "2:00 PM – 4:30 PM",
        round3: "9:00 AM – 12:00 PM",
      },
      design: {
        round1: "10:00 AM – 12:00 PM",
        round2: "2:00 PM – 5:00 PM",
        round3: "9:00 AM – 12:00 PM",
      },
      gaming: {
        round1: "10:00 AM – 11:00 AM",
        round2: "2:00 PM – 3:00 PM",
        round3: "Team 3A: 9:00 AM – 10:00 AM\nTeam 3B: 11:00 AM – 12:30 PM",
        round3Desc: "Championship showdown — Team 3A: 9:00 AM – 10:00 AM | Team 3B: 11:00 AM – 12:30 PM. Top qualified finalist teams battle for top ranks, awards, and glory.",
      },
      quiz: {
        round1: "10:00 AM – 11:00 AM",
        round2: "2:00 PM – 4:00 PM",
        round3: "9:00 AM – 11:00 AM",
      },
      prompt: {
        round1: "10:00 AM – 12:00 PM",
        round2: "2:00 PM – 4:00 PM",
        round3: "8:30 AM – 12:00 PM",
        round3Venue: "Seminar Hall",
      },
      cultural: {
        round1: "Schedule to be announced",
        round2: "Schedule to be announced",
        round3: "Schedule to be announced",
      }
    };

    function getSchedule(ev) {
      const id = (ev?.id || "").toLowerCase();
      const title = (ev?.title || "").toLowerCase();

      if (id.includes('coding') || title.includes('coding') || title.includes('codevoyage')) return eventSchedules.coding;
      if (id.includes('communication') || id === 'comm' || title.includes('communication')) return eventSchedules.comm;
      if (id.includes('content') || title.includes('content')) return eventSchedules.content;
      if (id.includes('cyber') || title.includes('cyber') || title.includes('black pearl')) return eventSchedules.cyber;
      if (id.includes('data') || title.includes('data')) return eventSchedules.data;
      if (id.includes('design') || title.includes('design')) return eventSchedules.design;
      if (id.includes('gaming') || title.includes('gaming')) return eventSchedules.gaming;
      if (id.includes('quiz') || title.includes('quiz')) return eventSchedules.quiz;
      if (id.includes('prompt') || title.includes('prompt')) return eventSchedules.prompt;
      if (id.includes('cultural') || id.includes('group') || title.includes('cultural')) return eventSchedules.cultural;

      return eventSchedules.coding;
    }

    function renderTimeline(eventIdx) {
      const ev = eventsData[eventIdx] || eventsData[0];
      const sched = getSchedule(ev);
      const round1Venue = sched.venue || sched.round1Venue || null;
      const round2Venue = sched.venue || sched.round2Venue || null;
      const round3Venue = sched.round3Venue || sched.venue || null;

      const steps = [
        {
          badge: "OPENING CEREMONY",
          date: "8 SEPTEMBER",
          time: "9:00 AM – 10:00 AM",
          roundName: "INAUGURATION",
          title: "INAUGURATION",
          desc: "Grand inauguration ceremony and official commencement of MAGNUM 2026.",
          icon: "🏛️",
          isBreak: false,
          isFinal: false,
          venue: null
        },
        {
          badge: ev.category || 'EVENT COMPETITION',
          date: "8 SEPTEMBER",
          time: sched.round1,
          roundName: "ROUND 1",
          title: `${ev.title} — ROUND 1`,
          desc: `${ev.desc || 'Event activities begin for Round 1 preliminary challenges and qualification tasks.'}`,
          icon: ev.icon || "⚡",
          isBreak: false,
          isFinal: false,
          venue: round1Venue
        },
        {
          badge: "MIDDAY RECHARGE",
          date: "8 SEPTEMBER",
          time: "1:00 PM – 2:00 PM",
          roundName: "LUNCH",
          title: "LUNCH BREAK",
          desc: "Recharge, interact with mentors and fellow participants, and prepare strategy for Round 2.",
          icon: "🍽️",
          isBreak: true,
          isFinal: false,
          venue: null
        },
        {
          badge: ev.category || 'EVENT COMPETITION',
          date: "8 SEPTEMBER",
          time: sched.round2,
          roundName: "ROUND 2",
          title: `${ev.title} — ROUND 2`,
          desc: "High-intensity second competition round. Teams push their skills to qualify for Day 2 finals.",
          icon: ev.icon || "🔥",
          isBreak: false,
          isFinal: false,
          venue: round2Venue
        },
        {
          badge: "CHAMPIONSHIP FINALS",
          date: "9 SEPTEMBER",
          time: sched.round3,
          roundName: "ROUND 3 — FINAL ROUND",
          title: `${ev.title} — FINAL ROUND`,
          desc: sched.round3Desc || "Championship showdown — Top qualified finalist teams battle for top ranks, awards, and glory.",
          icon: "⚔️",
          isBreak: false,
          isFinal: false,
          venue: round3Venue
        },
        {
          badge: "MIDDAY RECHARGE",
          date: "9 SEPTEMBER",
          time: "1:00 PM – 2:00 PM",
          roundName: "LUNCH",
          title: "LUNCH BREAK",
          desc: "Midday break and networking session before the final valedictory ceremony.",
          icon: "🍽️",
          isBreak: true,
          isFinal: false,
          venue: null
        },
        {
          badge: "GRAND CLOSING",
          date: "9 SEPTEMBER",
          time: "2:00 PM – 5:00 PM",
          roundName: "VALEDICTORY / CLOSING CEREMONY",
          title: "VALEDICTORY / CLOSING CEREMONY + PRIZE DISTRIBUTION",
          desc: "All event participants gather for the final closing ceremony and prize distribution.",
          icon: "🏆",
          isBreak: false,
          isFinal: true,
          venue: "AUDITORIUM"
        }
      ];

      let html = '<div class="tl-center-line"></div>';

      if (steps.length > 0 && steps[0].date) {
        html += `
          <div class="tl-date-divider" style="margin-top: 10px;">
            <div class="tl-date-badge">📅 ${steps[0].date}</div>
          </div>
        `;
      }

      steps.forEach((st, idx) => {
        const isRight = idx % 2 === 0;
        const isDateBreak = idx > 0 && steps[idx - 1].date !== st.date;

        if (isDateBreak) {
          html += `
            <div class="tl-date-divider">
              <div class="tl-date-badge">📅 ${st.date}</div>
            </div>
          `;
        }

        html += `
          <div class="tl-row ${isRight ? 'tl-row-right' : 'tl-row-left'}">
            <div class="tl-spacer-slot"></div>
            <div class="tl-node-slot">
              <div class="tl-node-dot" title="${st.roundName}"></div>
              <div class="${isRight ? 'tl-connector-right' : 'tl-connector-left'}"></div>
            </div>
            <div class="tl-card-slot">
              <div class="tl-voyage-card">
                <div class="tl-card-glow"></div>
                <div class="tl-card-header">
                  <div class="tl-badge-pill">
                    <span>${st.icon}</span>
                    <span>${st.badge}</span>
                  </div>
                  <div class="tl-date-text">📅 ${st.date}</div>
                </div>
                <h2 class="tl-card-event-title">${ev.title}</h2>
                <div class="tl-card-time-banner ${st.isFinal ? 'is-final' : st.isBreak ? 'is-break' : ''}">
                  <div class="tl-time-pill">🕒 ${st.time}</div>
                  <h3 class="tl-round-title">${st.roundName}</h3>
                  <p class="tl-round-desc">${st.desc}</p>
                  ${st.venue ? `<div class="tl-venue-text">📍 VENUE: ${st.venue}</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      setTimeout(() => {
        const dots = container.querySelectorAll('.tl-node-dot');
        const centerLine = container.querySelector('.tl-center-line');
        if (dots.length > 0 && centerLine) {
          const lastDot = dots[dots.length - 1].getBoundingClientRect();
          const cRect = container.getBoundingClientRect();
          const bottomPx = cRect.bottom - (lastDot.top + lastDot.height / 2);
          centerLine.style.bottom = `${Math.max(0, bottomPx)}px`;
        }
      }, 30);
    }

    dropdown.addEventListener('change', (e) => {
      renderTimeline(parseInt(e.target.value, 10));
    });

    renderTimeline(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

