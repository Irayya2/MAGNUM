import React, { useState } from 'react';
import { dayEvents } from './DayPath';

/* ─── Per-day metadata ───────────────────────────────────────────────────── */
const DAY_META = {
  1: { icon: '⚓', label: 'Day 1', date: 'Feb 23', accent: '#38bdf8', glow: '#0ea5e9', desc: 'The Voyage Begins' },
  2: { icon: '🌊', label: 'Day 2', date: 'Feb 24', accent: '#a78bfa', glow: '#7c3aed', desc: 'Deep Waters' },
  3: { icon: '🏆', label: 'Day 3', date: 'Feb 25', accent: '#fb923c', glow: '#ea580c', desc: 'Final Shores' },
};

/* ─── Event list preview ─────────────────────────────────────────────────── */
function EventList({ day, accent }) {
  const events = dayEvents[day];
  return (
    <div style={{ marginTop: 12, textAlign: 'left', width: '100%' }}>
      {events.map((ev, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0, boxShadow: `0 0 6px ${accent}` }} />
          <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{ev.title.replace(/\n/g, ' ')}</span>
          <span style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>{ev.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Single day card ────────────────────────────────────────────────────── */
function DayCard({ day, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const meta = DAY_META[day];
  const count = dayEvents[day].length;

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 22px 22px', borderRadius: 22, minWidth: 210, maxWidth: 250,
        border: `1px solid ${hovered ? meta.accent + 'bb' : meta.accent + '28'}`,
        background: hovered
          ? `linear-gradient(145deg, ${meta.glow}22 0%, rgba(2,6,23,0.92) 100%)`
          : `linear-gradient(145deg, ${meta.glow}0a 0%, rgba(2,6,23,0.80) 100%)`,
        backdropFilter: 'blur(20px)',
        boxShadow: hovered
          ? `0 20px 60px ${meta.glow}35, 0 0 0 1px ${meta.accent}18`
          : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-10px) scale(1.02)' : 'none',
        transition: 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: 'default',
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div style={{
        fontSize: 52, lineHeight: 1, marginBottom: 10,
        filter: hovered ? `drop-shadow(0 0 18px ${meta.glow})` : 'none',
        transition: 'filter 0.3s',
      }}>
        {meta.icon}
      </div>

      {/* Label + date */}
      <div style={{ fontSize: 20, fontWeight: 800, color: meta.accent, letterSpacing: '0.04em' }}>
        {meta.label}
      </div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: 600 }}>{meta.date}</div>

      {/* Tagline */}
      <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', margin: '8px 0 10px', textAlign: 'center' }}>
        {meta.desc}
      </div>

      {/* Event count badge */}
      <div style={{
        fontSize: 12, color: meta.accent, background: meta.accent + '15',
        borderRadius: 999, padding: '3px 14px', fontWeight: 700, marginBottom: 12,
      }}>
        {count} Events
      </div>

      {/* Event list toggle */}
      <button
        style={{
          all: 'unset', cursor: 'pointer', fontSize: 12, color: '#64748b',
          marginBottom: 4, textDecoration: 'underline', textDecorationStyle: 'dotted',
        }}
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? 'Hide events ▲' : 'Preview events ▼'}
      </button>

      {expanded && <EventList day={day} accent={meta.accent} />}

      {/* Set Sail CTA */}
      <button
        style={{
          marginTop: 14, padding: '10px 28px', borderRadius: 999, border: 'none',
          background: `linear-gradient(135deg, ${meta.accent}, ${meta.glow})`,
          color: '#020617', fontWeight: 800, fontSize: 14, cursor: 'pointer',
          letterSpacing: '0.04em', fontFamily: "'Inter','Segoe UI',sans-serif",
          boxShadow: hovered ? `0 4px 20px ${meta.glow}60` : 'none',
          transition: 'box-shadow 0.3s',
          width: '100%',
        }}
        onClick={() => onSelect(day)}
      >
        ⛵ Set Sail
      </button>
    </div>
  );
}

/* ─── Exported DaySelector overlay ──────────────────────────────────────── */
export function DaySelector({ onSelect }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 15,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Gradient vignette so the harbor is still visible behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(2,6,23,0.55) 0%, rgba(2,6,23,0.82) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: '0 24px', fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block', background: 'rgba(56,189,248,0.12)',
          border: '1px solid rgba(56,189,248,0.30)', borderRadius: 999,
          color: '#38bdf8', padding: '5px 20px', fontSize: 13, fontWeight: 600,
          letterSpacing: '0.06em', marginBottom: 18,
        }}>
          ⛵ Choose Your Journey
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.6rem)', fontWeight: 800,
          color: '#e2e8f0', margin: '0 0 8px',
          textShadow: '0 2px 24px rgba(0,0,0,0.6)',
        }}>
          Which boat will you board?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 15, margin: '0 0 36px' }}>
          Each vessel charts a different course through Hackfest&apos;26
        </p>

        {/* Cards row */}
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center',
          flexWrap: 'wrap', alignItems: 'flex-start',
        }}>
          {[1, 2, 3].map(day => (
            <DayCard key={day} day={day} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}
