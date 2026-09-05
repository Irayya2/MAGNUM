const GOLD_ACCENT = "#facc15";
const GOLD_GLOW = "#ca8a04";

export const EVENT_SCHEDULES = {
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

export function getScheduleForEvent(event) {
  const id = (event?.id || "").toLowerCase();
  const title = (event?.title || "").toLowerCase();
  const shortName = (event?.shortName || "").toLowerCase();

  if (id.includes('coding') || title.includes('coding') || title.includes('codevoyage') || shortName.includes('codevoyage')) {
    return EVENT_SCHEDULES.coding;
  }
  if (id.includes('communication') || id === 'comm' || title.includes('communication') || shortName.includes('communication')) {
    return EVENT_SCHEDULES.comm;
  }
  if (id.includes('content') || title.includes('content') || shortName.includes('content')) {
    return EVENT_SCHEDULES.content;
  }
  if (id.includes('cyber') || title.includes('cyber') || title.includes('black pearl') || shortName.includes('black pearl')) {
    return EVENT_SCHEDULES.cyber;
  }
  if (id.includes('data') || title.includes('data') || shortName.includes('data chronicles')) {
    return EVENT_SCHEDULES.data;
  }
  if (id.includes('design') || title.includes('design') || title.includes("captain's canvas") || shortName.includes("captain's canvas")) {
    return EVENT_SCHEDULES.design;
  }
  if (id.includes('gaming') || title.includes('gaming') || title.includes('e-gaming') || title.includes('pirates of arena') || shortName.includes('pirates of arena')) {
    return EVENT_SCHEDULES.gaming;
  }
  if (id.includes('quiz') || title.includes('quiz') || title.includes('voyage of wisdom') || shortName.includes('voyage of wisdom')) {
    return EVENT_SCHEDULES.quiz;
  }
  if (id.includes('prompt') || title.includes('prompt') || shortName.includes('prompt mariners')) {
    return EVENT_SCHEDULES.prompt;
  }
  if (id.includes('cultural') || id.includes('group') || title.includes('cultural') || title.includes('rhythm raiders') || title.includes('group')) {
    return EVENT_SCHEDULES.cultural;
  }

  return EVENT_SCHEDULES.coding;
}

export const MASTER_SCHEDULE = [
  { stageIndex: 0, name: "INAUGURATION", date: "8 SEPTEMBER", time: "9:00 AM – 10:00 AM", schedule: "The inauguration begins the MAGNUM event journey." },
  { stageIndex: 1, name: "ROUND 1", date: "8 SEPTEMBER", time: "10:00 AM – 12:00 PM", schedule: "Event activities begin for Round 1 preliminary challenges and qualification tasks." },
  { stageIndex: 2, name: "LUNCH", date: "8 SEPTEMBER", time: "1:00 PM – 2:00 PM", schedule: "Recharge, interact with mentors and fellow participants, and prepare strategy for Round 2." },
  { stageIndex: 3, name: "ROUND 2", date: "8 SEPTEMBER", time: "2:00 PM – 4:30 PM", schedule: "High-intensity second competition round. Teams push their skills to qualify for Day 2 finals." },
  { stageIndex: 4, name: "ROUND 3 — FINAL ROUND", date: "9 SEPTEMBER", time: "9:00 AM – 12:00 PM", schedule: "Ultimate championship round — top qualified finalist teams battle for top ranks, awards, and glory." },
  { stageIndex: 5, name: "LUNCH", date: "9 SEPTEMBER", time: "1:00 PM – 2:00 PM", schedule: "Midday break and networking session before the final valedictory ceremony." },
  { stageIndex: 6, name: "VALEDICTORY / CLOSING CEREMONY + PRIZE DISTRIBUTION", date: "9 SEPTEMBER", time: "2:00 PM – 5:00 PM", schedule: "All participants from the events gather for the final ceremony and prize distribution." }
];

export function getEventStageSchedule(event) {
  const eventTitle = event?.title || "MAGNUM EVENT";
  const categoryStr = event?.category ? `EVENT • ${event.category.toUpperCase()}` : 'COMPETITION';
  const icon = event?.icon || "⚡";
  const sched = getScheduleForEvent(event);

  const round1Venue = sched.venue || sched.round1Venue || null;
  const round2Venue = sched.venue || sched.round2Venue || null;
  const round3Venue = sched.round3Venue || sched.venue || null;

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
      time: sched.round1,
      title: `${eventTitle} — ROUND 1`,
      shortTitle: "ROUND 1",
      badge: categoryStr,
      desc: `${event?.desc || 'Event activities begin for Round 1 preliminary challenges and qualification tasks.'}`,
      icon: icon,
      isFinal: false,
      isBreak: false,
      venue: round1Venue
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
      time: sched.round2,
      title: `${eventTitle} — ROUND 2`,
      shortTitle: "ROUND 2",
      badge: categoryStr,
      desc: "High-intensity second competition round. Teams push their skills to qualify for Day 2 finals.",
      icon: icon,
      isFinal: false,
      isBreak: false,
      venue: round2Venue
    },
    {
      stageIndex: 4,
      stageId: "stage-5",
      date: "9 SEPTEMBER",
      time: sched.round3,
      title: `${eventTitle} — ROUND 3 — FINAL ROUND`,
      shortTitle: "ROUND 3 — FINAL ROUND",
      badge: "CHAMPIONSHIP FINALS",
      desc: sched.round3Desc || "Championship showdown — Top qualified finalist teams battle for top ranks, awards, and glory.",
      icon: "⚔️",
      isFinal: false,
      isBreak: false,
      venue: round3Venue
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

const RAW_EVENTS = [
  {
    id: "coding-event",
    title: "CODING (CODEVOYAGE)",
    shortName: "CodeVoyage",
    logo: "/assets/images/Events/CodeVoyage.png",
    icon: "💻",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Test your algorithmic supremacy and problem-solving velocity in high-intensity coding challenges.",
  },
  {
    id: "communication-event",
    title: "COMMUNICATION (COMMUNICATION EVENT)",
    shortName: "Communication Event",
    logo: "/assets/images/Events/communication.jpg",
    icon: "🎙️",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Soft Skills",
    desc: "Master the art of persuasive speaking, debate, and strategic articulation under pressure.",
  },
  {
    id: "content-creation-event",
    title: "CONTENT CREATION (CONTENT CREATION EVENT)",
    shortName: "Content Creation Event",
    logo: "/assets/images/Events/content creation.png",
    icon: "📹",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Creative Media",
    desc: "Craft compelling digital media, narrative reels, and visual stories that captivate the audience.",
  },
  {
    id: "cybersecurity-event",
    title: "CYBER SECURITY (BLACK PEARL)",
    shortName: "Black Pearl",
    logo: "/assets/images/Events/Black Pearl (Cyber Security).jpeg",
    icon: "🛡️",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Penetrate defenses, uncover vulnerabilities, and conquer Capture The Flag (CTF) security grids.",
  },
  {
    id: "data-analytics-event",
    title: "DATA ANALYTICS (DATA CHRONICLES)",
    shortName: "Data Chronicles",
    logo: "/assets/images/Events/Data Chronicles.jpg",
    icon: "📊",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Extract actionable intelligence, build predictive models, and decode complex datasets.",
  },
  {
    id: "designing-event",
    title: "DESIGNING (CAPTAIN'S CANVAS)",
    shortName: "Captain's Canvas",
    logo: "/assets/images/Events/Captain's Canvas (Designing).png",
    icon: "🎨",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Creative Media",
    desc: "Engineers of visual beauty — craft intuitive UI/UX, brand identity, and graphics.",
  },
  {
    id: "gaming-event",
    title: "E-GAMING (PIRATES OF ARENA)",
    shortName: "Pirates of Arena",
    logo: "/assets/images/Events/Pirates of Arena (Gaming).png",
    icon: "🎮",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Esports",
    desc: "Clash in tactical multiplayer battles and prove team coordination in the high-octane gaming arena.",
  },
  {
    id: "quiz-event",
    title: "QUIZ (VOYAGE OF WISDOM)",
    shortName: "Voyage Of Wisdom",
    logo: "/assets/images/Events/Voyage Of Wisdom.png",
    icon: "❓",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Intellectual",
    desc: "Buzzer rounds, rapid-fire trivia, and deep technology knowledge showdowns.",
  },
  {
    id: "prompt-engineering-event",
    title: "PROMPT ENGINEERING (PROMPT MARINERS)",
    shortName: "Prompt Mariners",
    logo: "/assets/images/Events/Prompt Mariners.jpg",
    icon: "⚡",
    accent: GOLD_ACCENT,
    glow: GOLD_GLOW,
    category: "Technical",
    desc: "Harness generative AI models with precision prompts to synthesize solutions, code, and media.",
  }
];

export const MAGNUM_EVENTS = RAW_EVENTS.map(ev => ({
  ...ev,
  rounds: getEventStageSchedule(ev)
}));

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

