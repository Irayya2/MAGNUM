const GOLD_ACCENT = "#facc15";
const GOLD_GLOW = "#ca8a04";

export const MAGNUM_EVENTS = [
  {
    id: "coding-event",
    title: "CODING EVENT",
    shortName: "Coding Event",
    icon: "💻",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Test your algorithmic supremacy and problem-solving velocity in high-intensity coding challenges.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "communication-event",
    title: "COMMUNICATION EVENT",
    shortName: "Communication Event",
    icon: "🎙️",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Soft Skills",
    desc: "Master the art of persuasive speaking, debate, and strategic articulation under pressure.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "content-creation-event",
    title: "CONTENT CREATION EVENT",
    shortName: "Content Creation Event",
    icon: "📹",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Creative Media",
    desc: "Craft compelling digital media, narrative reels, and visual stories that captivate the audience.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "cybersecurity-event",
    title: "CYBERSECURITY EVENT",
    shortName: "Cybersecurity Event",
    icon: "🛡️",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Penetrate defenses, uncover vulnerabilities, and conquer Capture The Flag (CTF) security grids.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "data-analytics-event",
    title: "DATA ANALYTICS EVENT",
    shortName: "Data Analytics Event",
    icon: "📊",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Extract actionable intelligence, build predictive models, and decode complex datasets.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "designing-event",
    title: "DESIGNING EVENT",
    shortName: "Designing Event",
    icon: "🎨",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Creative Media",
    desc: "Engineers of visual beauty — craft intuitive UI/UX, brand identity, and graphics.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "gaming-event",
    title: "GAMING EVENT",
    shortName: "Gaming Event",
    icon: "🎮",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Esports",
    desc: "Clash in tactical multiplayer battles and prove team coordination in the high-octane gaming arena.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "quiz-event",
    title: "QUIZ EVENT",
    shortName: "Quiz Event",
    icon: "❓",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Intellectual",
    desc: "Buzzer rounds, rapid-fire trivia, and deep technology knowledge showdowns.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "prompt-engineering-event",
    title: "PROMPT ENGINEERING EVENT",
    shortName: "Prompt Engineering Event",
    icon: "⚡",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Harness generative AI models with precision prompts to synthesize solutions, code, and media.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  },
  {
    id: "cultural-event-group",
    title: "CULTURAL EVENT (GROUP)",
    shortName: "Cultural Event (Group)",
    icon: "🎭",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Cultural",
    desc: "Celebrate artistry, choreography, and group cultural performances on the grand stage.",
    rounds: [
      { name: "ROUND 1", date: "8 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "9:00 AM — Event Activities Begin" },
      { name: "ROUND 2", date: "8 SEPTEMBER", time: "1:30 PM – 5:00 PM", schedule: "Break: 1:00 PM – 1:30 PM | 5:00 PM Day 1 Ends" },
      { name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:30 PM", schedule: "Final Competition Round" }
    ]
  }
];

export const FINAL_DESTINATION = {
  id: "final-destination",
  title: "FINAL DESTINATION",
  venue: "AUDITORIUM",
  event: "WINNER ANNOUNCEMENT",
  subtitle: "All event journeys lead here.",
  accent: GOLD_ACCENT,
  glow: GOLD_GLOW,
  icon: "🏆"
};

// Backward compatibility alias for legacy imports
export const timelineEvents = MAGNUM_EVENTS.map(ev => ({
  day: 1,
  title: ev.title,
  time: "8-9 Sept"
}));
