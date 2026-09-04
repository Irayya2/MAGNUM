const GOLD_ACCENT = "#facc15";
const GOLD_GLOW = "#ca8a04";

export const MASTER_SCHEDULE = [
  { stageIndex: 0, name: "INAUGURATION", date: "8 SEPTEMBER", time: "9:00 AM – 10:00 AM", schedule: "The inauguration begins the MAGNUM event journey." },
  { stageIndex: 1, name: "ROUND 1", date: "8 SEPTEMBER", time: "10:00 AM – 1:00 PM", schedule: "Event activities begin for Round 1 preliminary challenges and qualification tasks." },
  { stageIndex: 2, name: "LUNCH", date: "8 SEPTEMBER", time: "1:00 PM – 2:00 PM", schedule: "Recharge, interact with mentors and fellow participants, and prepare strategy for Round 2." },
  { stageIndex: 3, name: "ROUND 2", date: "8 SEPTEMBER", time: "2:00 PM – 5:00 PM", schedule: "High-intensity second competition round. Teams push their skills to qualify for Day 2 finals." },
  { stageIndex: 4, name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 1:00 PM", schedule: "Ultimate championship round — top qualified finalist teams battle for top ranks, awards, and glory." },
  { stageIndex: 5, name: "LUNCH", date: "9 SEPTEMBER", time: "1:00 PM – 2:00 PM", schedule: "Midday break and networking session before the final valedictory ceremony." },
  { stageIndex: 6, name: "VALEDICTORY / CLOSING CEREMONY + PRIZE DISTRIBUTION", date: "9 SEPTEMBER", time: "2:00 PM – 5:00 PM", schedule: "All participants from the events gather for the final ceremony and prize distribution." }
];

export function getEventStageSchedule(event) {
  const eventTitle = event?.title || "MAGNUM EVENT";
  const categoryStr = event?.category ? `EVENT • ${event.category.toUpperCase()}` : 'COMPETITION';
  const icon = event?.icon || "⚡";

  return [
    {
      stageIndex: 0,
      stageId: "stage-1",
      date: "8 SEPTEMBER",
      time: "9:00 AM – 10:00 AM",
      title: "INAUGURATION",
      shortTitle: "INAUGURATION",
      badge: "OPENING CEREMONY",
      desc: "The inauguration begins the MAGNUM event journey.",
      icon: "🏛️",
      isFinal: false,
      isBreak: false,
      venue: null
    },
    {
      stageIndex: 1,
      stageId: "stage-2",
      date: "8 SEPTEMBER",
      time: "10:00 AM – 1:00 PM",
      title: `${eventTitle} — ROUND 1`,
      shortTitle: "ROUND 1",
      badge: categoryStr,
      desc: `${event?.desc || 'Event activities begin for Round 1 preliminary challenges and qualification tasks.'}`,
      icon: icon,
      isFinal: false,
      isBreak: false,
      venue: null
    },
    {
      stageIndex: 2,
      stageId: "stage-3",
      date: "8 SEPTEMBER",
      time: "1:00 PM – 2:00 PM",
      title: "LUNCH",
      shortTitle: "LUNCH",
      badge: "MIDDAY RECHARGE",
      desc: "Recharge, interact with mentors and fellow participants, and prepare strategy for Round 2.",
      icon: "🍽️",
      isFinal: false,
      isBreak: true,
      venue: null
    },
    {
      stageIndex: 3,
      stageId: "stage-4",
      date: "8 SEPTEMBER",
      time: "2:00 PM – 5:00 PM",
      title: `${eventTitle} — ROUND 2`,
      shortTitle: "ROUND 2",
      badge: categoryStr,
      desc: "High-intensity second competition round. Teams push their skills to qualify for Day 2 finals.",
      icon: icon,
      isFinal: false,
      isBreak: false,
      venue: null
    },
    {
      stageIndex: 4,
      stageId: "stage-5",
      date: "9 SEPTEMBER",
      time: "9:00 AM – 1:00 PM",
      title: `${eventTitle} — ROUND 3 — FINAL ROUND`,
      shortTitle: "ROUND 3 — FINAL ROUND",
      badge: "CHAMPIONSHIP FINALS",
      desc: "Championship showdown — Top qualified finalist teams battle for top ranks, awards, and glory.",
      icon: "⚔️",
      isFinal: false,
      isBreak: false,
      venue: null
    },
    {
      stageIndex: 5,
      stageId: "stage-6",
      date: "9 SEPTEMBER",
      time: "1:00 PM – 2:00 PM",
      title: "LUNCH",
      shortTitle: "LUNCH",
      badge: "MIDDAY RECHARGE",
      desc: "Midday break and networking session before the final valedictory ceremony.",
      icon: "🍽️",
      isFinal: false,
      isBreak: true,
      venue: null
    },
    {
      stageIndex: 6,
      stageId: "stage-7",
      date: "9 SEPTEMBER",
      time: "2:00 PM – 5:00 PM",
      title: "VALEDICTORY / CLOSING CEREMONY + PRIZE DISTRIBUTION",
      shortTitle: "VALEDICTORY",
      badge: "GRAND CLOSING",
      desc: "All participants from the events gather for the final ceremony and prize distribution.",
      icon: "🏆",
      isFinal: true,
      isBreak: false,
      venue: "AUDITORIUM"
    }
  ];
}

export const MAGNUM_EVENTS = [
  {
    id: "coding-event",
    title: "CODEVOYAGE",
    shortName: "CodeVoyage",
    logo: "/assets/images/Events/CodeVoyage.png",
    icon: "💻",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Test your algorithmic supremacy and problem-solving velocity in high-intensity coding challenges.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "communication-event",
    title: "COMMUNICATION EVENT",
    shortName: "Communication Event",
    logo: "/assets/images/Events/communication.jpg",
    icon: "🎙️",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Soft Skills",
    desc: "Master the art of persuasive speaking, debate, and strategic articulation under pressure.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "content-creation-event",
    title: "CONTENT CREATION EVENT",
    shortName: "Content Creation Event",
    logo: "/assets/images/Events/content creation.png",
    icon: "📹",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Creative Media",
    desc: "Craft compelling digital media, narrative reels, and visual stories that captivate the audience.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "cybersecurity-event",
    title: "BLACK PEARL (CYBER SECURITY)",
    shortName: "Black Pearl",
    logo: "/assets/images/Events/Black Pearl (Cyber Security).jpeg",
    icon: "🛡️",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Penetrate defenses, uncover vulnerabilities, and conquer Capture The Flag (CTF) security grids.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "data-analytics-event",
    title: "DATA CHRONICLES",
    shortName: "Data Chronicles",
    logo: "/assets/images/Events/Data Chronicles.jpg",
    icon: "📊",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Extract actionable intelligence, build predictive models, and decode complex datasets.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "designing-event",
    title: "CAPTAIN'S CANVAS (DESIGNING)",
    shortName: "Captain's Canvas",
    logo: "/assets/images/Events/Captain's Canvas (Designing).png",
    icon: "🎨",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Creative Media",
    desc: "Engineers of visual beauty — craft intuitive UI/UX, brand identity, and graphics.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "gaming-event",
    title: "PIRATES OF ARENA (GAMING)",
    shortName: "Pirates of Arena",
    logo: "/assets/images/Events/Pirates of Arena (Gaming).png",
    icon: "🎮",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Esports",
    desc: "Clash in tactical multiplayer battles and prove team coordination in the high-octane gaming arena.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "quiz-event",
    title: "VOYAGE OF WISDOM",
    shortName: "Voyage Of Wisdom",
    logo: "/assets/images/Events/Voyage Of Wisdom.png",
    icon: "❓",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Intellectual",
    desc: "Buzzer rounds, rapid-fire trivia, and deep technology knowledge showdowns.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "prompt-engineering-event",
    title: "PROMPT MARINERS",
    shortName: "Prompt Mariners",
    logo: "/assets/images/Events/Prompt Mariners.jpg",
    icon: "⚡",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Harness generative AI models with precision prompts to synthesize solutions, code, and media.",
    rounds: MASTER_SCHEDULE
  },
  {
    id: "cultural-event-group",
    title: "RHYTHM RAIDERS",
    shortName: "Rhythm Raiders",
    logo: "/assets/images/Events/RHYTHM RAIDERS.png",
    icon: "🎭",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Cultural",
    desc: "Celebrate artistry, choreography, and group cultural performances on the grand stage.",
    rounds: MASTER_SCHEDULE
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
