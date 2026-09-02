import React, { useState, useRef, useEffect } from 'react';
import { MAGNUM_EVENTS, FINAL_DESTINATION } from '../../data/timelineEvents';
import { ViewToggle } from './ViewToggle';

export function Timeline2D({ view, setView }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);

  const filteredEvents = activeFilter === 'all'
    ? MAGNUM_EVENTS
    : MAGNUM_EVENTS.filter(e => e.id === activeFilter);

  return (
    <div style={s.wrapper}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.glow} />
        <div style={s.badge}>⚓ MAGNUM 2026-27 Event Voyage</div>
        <h1 style={s.title}>The Voyage Through <span style={s.accent}>MAGNUM</span> Events</h1>
        <p style={s.sub}>10 Competitive Event Islands · 3 Rounds Each · 1 Grand Auditorium Winner Destination</p>

        {/* View Toggle */}
        {view && setView && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <ViewToggle view={view} setView={setView} />
          </div>
        )}

        {/* Event filter pills */}
        <div style={s.filters}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              ...s.fBtn,
              ...(activeFilter === 'all' ? s.fBtnActive : {})
            }}
          >
            All 10 Events
          </button>

          {MAGNUM_EVENTS.map((ev) => {
            const active = activeFilter === ev.id;
            return (
              <button
                key={ev.id}
                onClick={() => setActiveFilter(active ? 'all' : ev.id)}
                style={{
                  ...s.fBtn,
                  ...(active ? {
                    background: ev.accent + '22',
                    borderColor: ev.accent,
                    color: ev.accent
                  } : {})
                }}
              >
                <span>{ev.icon}</span> {ev.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Timeline List */}
      <div style={s.body}>
        <div style={s.grid}>
          {filteredEvents.map((ev, idx) => {
            const isHovered = hoveredId === ev.id;
            return (
              <div
                key={ev.id}
                onMouseEnter={() => setHoveredId(ev.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  ...s.card,
                  borderColor: isHovered ? ev.accent : ev.accent + '35',
                  background: isHovered
                    ? `linear-gradient(135deg, ${ev.glow}18 0%, rgba(2,6,23,0.9) 100%)`
                    : `linear-gradient(135deg, ${ev.glow}08 0%, rgba(2,6,23,0.78) 100%)`,
                  boxShadow: isHovered ? `0 12px 36px ${ev.glow}30` : 'none',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                }}
              >
                {/* Event Top Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{ev.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ev.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      EVENT {idx + 1} • {ev.category}
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
                      {ev.title}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {ev.desc}
                </p>

                {/* 3 Rounds Structure */}
                <div style={s.roundsContainer}>
                  {/* Round 1 */}
                  <div style={s.roundRow}>
                    <div style={{ ...s.roundBadge, background: ev.accent + '20', color: ev.accent }}>
                      ROUND 1
                    </div>
                    <div style={s.roundInfo}>
                      <div style={s.roundDate}>8 SEPTEMBER</div>
                      <div style={s.roundSchedule}>9:00 AM — Event Activities Begin</div>
                    </div>
                  </div>

                  {/* Round 2 */}
                  <div style={s.roundRow}>
                    <div style={{ ...s.roundBadge, background: ev.accent + '20', color: ev.accent }}>
                      ROUND 2
                    </div>
                    <div style={s.roundInfo}>
                      <div style={s.roundDate}>8 SEPTEMBER</div>
                      <div style={s.roundSchedule}>Activities continue till 5:00 PM (Break 1:00 PM – 1:30 PM)</div>
                    </div>
                  </div>

                  {/* Round 3 */}
                  <div style={{ ...s.roundRow, borderBottom: 'none' }}>
                    <div style={{ ...s.roundBadge, background: 'rgba(250,204,21,0.2)', color: '#facc15' }}>
                      ROUND 3 — FINAL ROUND
                    </div>
                    <div style={s.roundInfo}>
                      <div style={{ ...s.roundDate, color: '#fef08a' }}>9 SEPTEMBER</div>
                      <div style={{ ...s.roundSchedule, color: '#f8fafc', fontWeight: 600 }}>9:00 AM – 1:30 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Common Island Destination Card */}
        <div style={s.finalCard}>
          <div style={{ fontSize: 48, filter: 'drop-shadow(0 0 16px rgba(234,179,8,0.6))' }}>🏆</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#fde047', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            COMMON FINAL DESTINATION
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#fef08a', margin: '4px 0' }}>
            AUDITORIUM — WINNER ANNOUNCEMENT
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: 14, margin: '4px 0 0', fontStyle: 'italic' }}>
            "{FINAL_DESTINATION.subtitle}"
          </p>
          <div style={{ marginTop: 14, fontSize: 13, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: 999 }}>
            All 10 event journeys converge here after Round 3 completion on 9 September.
          </div>
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
    width: '100%', boxSizing: 'border-box',
  },
  header: { position: 'relative', textAlign: 'center', padding: '100px 16px 36px', overflow: 'hidden', width: '100%', boxSizing: 'border-box' },
  glow: {
    position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
    width: '100%', maxWidth: 700, height: 400,
    background: 'radial-gradient(ellipse, rgba(56,189,248,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block', background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.4)',
    color: '#facc15', borderRadius: 999, padding: '6px 20px', fontSize: 13, fontWeight: 700,
    letterSpacing: '0.06em', marginBottom: 16, textTransform: 'uppercase'
  },
  title: {
    fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 900, margin: '0 0 10px',
    color: '#f8fafc', lineHeight: 1.15, wordBreak: 'break-word',
  },
  accent: {
    color: '#facc15', textShadow: '0 0 20px rgba(250,204,21,0.5)'
  },
  sub: { fontSize: '0.95rem', color: '#cbd5e1', margin: '0 0 28px' },
  filters: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' },
  fBtn: {
    padding: '7px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6
  },
  fBtnActive: {
    background: 'rgba(250,204,21,0.2)', borderColor: '#facc15', color: '#facc15'
  },
  body: { maxWidth: 1000, margin: '0 auto', padding: '0 16px 80px', boxSizing: 'border-box', width: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, width: '100%' },
  card: {
    borderRadius: 20, border: '1px solid', padding: 22,
    backdropFilter: 'blur(16px)', transition: 'all 0.3s ease',
    width: '100%', boxSizing: 'border-box',
  },
  roundsContainer: {
    background: 'rgba(15, 23, 42, 0.65)', borderRadius: 14, padding: 14,
    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10
  },
  roundRow: {
    display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8
  },
  roundBadge: {
    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap'
  },
  roundInfo: { flex: 1 },
  roundDate: { fontSize: 12, fontWeight: 700, color: '#cbd5e1' },
  roundSchedule: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  finalCard: {
    marginTop: 48, padding: '32px 24px', borderRadius: 24, textAlign: 'center',
    background: 'linear-gradient(145deg, rgba(234,179,8,0.16) 0%, rgba(2,6,23,0.92) 100%)',
    border: '1px solid rgba(234,179,8,0.5)',
    boxShadow: '0 16px 50px rgba(234,179,8,0.25)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
  }
};
