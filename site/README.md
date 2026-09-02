# Hackfest '26 — Reorganized Web Project

A clean, modular, and responsive vanilla HTML/CSS/JavaScript recreation of the **Hackfest '26** (National Level Hackathon by Finite Loop Club, NMAMIT) portal.

---

## 📁 Directory Structure

```text
E:\Website\simp3\Hackfest\
│
├── site/                           # ✨ Clean, Reorganized Project Root
│   ├── index.html                  # Home page (Hero, Sponsor, Brochure, Tracks, Timeline, Prize, FAQ)
│   ├── about.html                  # About page with Bento Grid metrics and info
│   ├── events.html                 # Side Quests & Events (CTF, Treasure Hunt, Tech Banter)
│   ├── timeline.html               # Voyage Milestones Timeline
│   ├── contact.html                # Contact the Crew (Faculty Coordinators & Student Organizers)
│   ├── login.html                  # Registration / Captain's Deck Portal Login
│   ├── favicon.ico                 # Site Favicon
│   ├── favicon-96x96.png           # 96x96 Favicon
│   ├── apple-touch-icon.png        # Touch icon
│   │
│   └── assets/
│       ├── css/
│       │   ├── style.css           # Global Design System (Tokens, Navbar, Footer, Loader, Floating Compass)
│       │   └── home.css            # Home-page specific layout and timeline styling
│       │
│       ├── js/
│       │   └── main.js             # Shared interactions (Loader, Mobile Menu, FAQ Accordion, Scroll InView, Tracks)
│       │
│       └── images/
│           ├── logos/              # All organized logos (HF Banner, Glow Icon, Footer Logo, NMAMIT, NITTE, FLC)
│           ├── backgrounds/        # Background assets (Coral Reef, Leather Texture, Shipwreck, Steering Wheel)
│           └── brochure/           # Downloadable PDF brochure
│
├── hackfest.dev/                   # 📦 Original HTTrack Mirror (kept as reference)
└── index.html                      # 📦 Mirror Entry Point (redirects to hackfest.dev)
```

---

## 🎨 Features & Design System
- **Pirate / Nautical Aesthetic**: Rich cyan/gold palette, dark backgrounds, glassmorphism cards, glowing text.
- **Typography**: `Pirata One` (display/titles), `Crimson Text` (serif subheadings), `Plus Jakarta Sans` (clean modern body).
- **Responsive Layout**: Fluid grids and flexbox adapted for mobile, tablet, and widescreen desktop.
- **Interactive Elements**:
  - Full-screen nautical asset loader overlay.
  - Floating compass menu button.
  - Interactive FAQ accordions.
  - Interactive tracks explorer with dynamic description switching.
  - Scroll-triggered smooth animations.
