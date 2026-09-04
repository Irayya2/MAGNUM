import React from 'react';
import { allDestinations } from './DayPath';
import { DaySelector } from './DaySelector';
import { Event2DCard } from './Event2DCard';

export function Timeline2D({ view, setView, selectedDestination, setSelectedDestination }) {
  // Ensure selectedDestination maps to a valid index (default to 0: CODING EVENT)
  const currentIdx = (typeof selectedDestination === 'number' && selectedDestination >= 0 && selectedDestination < allDestinations.length)
    ? selectedDestination
    : 0;

  const currentEvent = allDestinations[currentIdx];

  const handleSelect = (index) => {
    // If index is null or invalid, fallback to 0 (Coding Event)
    setSelectedDestination(index !== null && index !== undefined ? index : 0);
  };

  return (
    <div style={s.wrapper}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.glow} />
        <div style={s.badge}>⚓ MAGNUM 2026-27 Voyage Logs</div>
        <h1 style={s.title}>
          The Voyage Through <span style={s.accent}>MAGNUM</span> Events
        </h1>
        <p style={s.sub}>Select an event to view its schedule and voyage information</p>

        {/* Event Dropdown - Single Source of Selection */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <DaySelector
            selectedDestination={currentIdx}
            onSelect={handleSelect}
            inline={true}
          />
        </div>
      </div>

      {/* Main Content Area - Displaying ONLY the Selected Event's Voyage Log Card */}
      <div style={s.body}>
        <Event2DCard
          key={currentIdx}
          event={currentEvent}
          destinationIndex={currentIdx}
        />
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    position: 'absolute',
    inset: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: 'linear-gradient(160deg, #020617 0%, #0a1628 45%, #020c1f 100%)',
    fontFamily: "'Inter','Segoe UI',sans-serif",
    color: '#e2e8f0',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    position: 'relative',
    textAlign: 'center',
    padding: '90px 16px 20px',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
  },
  glow: {
    position: 'absolute',
    top: -80,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 700,
    height: 400,
    background: 'radial-gradient(ellipse, rgba(250,204,21,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(250,204,21,0.12)',
    border: '1px solid rgba(250,204,21,0.4)',
    color: '#facc15',
    borderRadius: 999,
    padding: '6px 20px',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: 900,
    margin: '0 0 8px',
    color: '#f8fafc',
    lineHeight: 1.15,
    wordBreak: 'break-word',
  },
  accent: {
    color: '#facc15',
    textShadow: '0 0 20px rgba(250,204,21,0.5)',
  },
  sub: {
    fontSize: '0.92rem',
    color: '#cbd5e1',
    margin: '0 0 20px',
  },
  body: {
    maxWidth: 1050,
    margin: '0 auto',
    padding: '0 16px 60px',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
};
