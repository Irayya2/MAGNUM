import React, { useState, useRef, useEffect } from 'react';
import { timelineEvents } from '../../data/timelineEvents';
import { ViewToggle } from './ViewToggle';

const DAY_COLORS = {
  1: { accent: '#38bdf8', glow: '#0ea5e9', label: 'Day 1' },
  2: { accent: '#a78bfa', glow: '#7c3aed', label: 'Day 2' },
  3: { accent: '#fb923c', glow: '#ea580c', label: 'Day 3' },
};

const DAY_ICONS = { 1: '⚓', 2: '🌊', 3: '🏆' };

const EVENT_ICONS = {
  'Check-in': '🪪', 'Lunch': '🍱', 'Inaugural': '🎉', 'Snacks': '🍿',
  'Hackathon\nStarts': '💻', 'Dinner': '🍛', 'Engagement\nactivities': '🎯',
  'Breakfast': '☕', 'Cool Off\nTime': '😎', 'Snack\nBreak': '🧃',
  'Engagement\nActivities': '🎯', 'Hackathon\nends': '🔔',
  'Top 15\nFinal Pitch': '🎤', 'Winners\nSelection': '🥇',
  'Closing\nceremony': '🎊', 'Checkout': '🚢',
};

function getIcon(title) { return EVENT_ICONS[title] || '📌'; }

const eventsByDay = timelineEvents.reduce((acc, ev, idx) => {
  if (!acc[ev.day]) acc[ev.day] = [];
  acc[ev.day].push({ ...ev, globalIndex: idx });
  return acc;
}, {});
const days = Object.keys(eventsByDay).map(Number);

export function Timeline2D({ view, setView }) {
  const [activeDay, setActiveDay] = useState(null);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [hoveredKey, setHoveredKey] = useState(null);
  const containerRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    // Use null root so IntersectionObserver uses the viewport (works for any scroll container)
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) setVisibleItems(p => new Set([...p, e.target.dataset.ikey]));
      }),
      { threshold: 0.1, root: null }
    );
    // Small delay so refs are populated after render
    const t = setTimeout(() => {
      Object.values(itemRefs.current).forEach(el => el && obs.observe(el));
    }, 50);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, [activeDay]);

  const filteredDays = activeDay ? [activeDay] : days;

  return (
    <div ref={containerRef} style={s.wrapper}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.glow} />
        <div style={s.badge}>📅 Event Schedule</div>
        <h1 style={s.title}>Hackfest <span style={s.accent}>'26</span> Timeline</h1>
        <p style={s.sub}>3 days · Innovation · Collaboration · Victory</p>

        {/* ── View Toggle ── */}
        {view && setView && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <ViewToggle view={view} setView={setView} />
          </div>
        )}

        {/* Day filter */}
        <div style={s.filters}>
          {[null, ...days].map((d) => {
            const c = d ? DAY_COLORS[d] : null;
            const active = activeDay === d;
            return (
              <button key={d ?? 'all'} onClick={() => setActiveDay(d === activeDay ? null : d)} style={{
                ...s.fBtn,
                ...(active ? { background: (c?.glow || '#38bdf8') + '22', borderColor: c?.accent || '#38bdf8', color: c?.accent || '#38bdf8' } : {}),
              }}>
                {d ? `${DAY_ICONS[d]} Day ${d}` : 'All Days'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={s.body}>
        {filteredDays.map((day) => {
          const c = DAY_COLORS[day];
          const events = eventsByDay[day];
          return (
            <div key={day} style={s.daySection}>
              {/* Day label row */}
              <div style={s.dayRow}>
                <div style={{ ...s.line, background: c.accent }} />
                <div style={{ ...s.dayChip, background: c.glow + '1a', borderColor: c.accent + '50', color: c.accent }}>
                  <span>{DAY_ICONS[day]}</span>
                  <span style={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 13 }}>Day {day}</span>
                </div>
                <div style={{ ...s.line, background: c.accent }} />
              </div>

              {/* Cards */}
              <div style={s.grid}>
                {events.map((ev, i) => {
                  const key = `d${day}e${i}`;
                  const vis = visibleItems.has(key);
                  const isHovered = hoveredKey === key;
                  return (
                    <div
                      key={key}
                      data-ikey={key}
                      ref={el => { itemRefs.current[key] = el; }}
                      style={{
                        ...s.card,
                        borderColor: isHovered ? c.accent + '70' : c.accent + '28',
                        background: `linear-gradient(135deg, ${c.glow}0c 0%, rgba(2,6,23,0.72) 100%)`,
                        boxShadow: isHovered ? `0 8px 28px ${c.glow}25` : 'none',
                        opacity: vis ? 1 : 0,
                        // Only apply hover lift when card is already visible
                        transform: !vis
                          ? 'translateY(22px) scale(0.97)'
                          : isHovered ? 'translateY(-4px)' : 'none',
                        transition: `opacity 0.4s ${i * 70}ms ease, transform 0.4s ${i * 70}ms ease, border-color 0.25s, box-shadow 0.25s`,
                      }}
                      onMouseEnter={() => setHoveredKey(key)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      {/* Dot + line */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.accent, boxShadow: `0 0 10px ${c.glow}`, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 1, background: c.accent + '30' }} />
                      </div>

                      {/* Time badge */}
                      <div style={{ ...s.timeBadge, background: c.accent + '18', color: c.accent }}>
                        🕐 {ev.time}
                      </div>

                      {/* Content */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                        <span style={{ fontSize: 28, lineHeight: 1 }}>{getIcon(ev.title)}</span>
                        <div>
                          <div style={s.evTitle}>{ev.title.replace(/\n/g, ' ')}</div>
                          <div style={{ fontSize: 12, color: c.accent + 'aa', marginTop: 3 }}>Day {ev.day}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* End */}
        <div style={s.end}>
          <div style={{ fontSize: 34, filter: 'drop-shadow(0 0 14px rgba(56,189,248,0.5))' }}>⚓</div>
          <div style={{ color: '#334155', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 8 }}>End of Journey</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden',
    background: 'linear-gradient(160deg, #020617 0%, #0a1628 45%, #020c1f 100%)',
    fontFamily: "'Inter','Segoe UI',sans-serif", color: '#e2e8f0',
    scrollbarWidth: 'thin', scrollbarColor: '#1e3a5f #020617',
  },
  header: { position: 'relative', textAlign: 'center', padding: '110px 24px 44px', overflow: 'hidden' },
  glow: {
    position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
    width: 600, height: 400,
    background: 'radial-gradient(ellipse, rgba(56,189,248,0.13) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
    color: '#38bdf8', borderRadius: 999, padding: '5px 18px', fontSize: 13, fontWeight: 600,
    letterSpacing: '0.05em', marginBottom: 18,
  },
  title: {
    fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 800, margin: '0 0 10px',
    background: 'linear-gradient(135deg,#e2e8f0 30%,#94a3b8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.15,
  },
  accent: {
    background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  sub: { fontSize: '0.95rem', color: '#64748b', margin: '0 0 32px' },
  filters: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  fBtn: {
    padding: '7px 20px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
  },
  body: { maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' },
  daySection: { marginBottom: 52 },
  dayRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 },
  line: { flex: 1, height: 1, opacity: 0.35 },
  dayChip: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 20px',
    borderRadius: 999, border: '1px solid', whiteSpace: 'nowrap',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 16 },
  card: {
    borderRadius: 14, border: '1px solid', padding: 16,
    backdropFilter: 'blur(10px)', transition: 'border-color 0.25s,box-shadow 0.25s,transform 0.25s',
    cursor: 'default',
  },
  timeBadge: {
    display: 'inline-block', borderRadius: 6, padding: '3px 10px',
    fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
  },
  evTitle: { fontSize: 15, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3 },
  end: { textAlign: 'center', padding: '44px 0 20px' },
};
