import React from 'react';
import { MAGNUM_EVENTS } from '../../data/timelineEvents';

export function DaySelector({ selectedDestination, onSelect }) {
  return (
    <div style={{
      position: 'absolute',
      top: 85,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 'calc(100vw - 32px)',
      maxWidth: 420,
      boxSizing: 'border-box',
      pointerEvents: 'auto',
    }}>
      <label htmlFor="event-select-dropdown" style={{
        fontSize: 11,
        fontWeight: 800,
        color: '#facc15',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: 6,
        textShadow: '0 0 12px rgba(250, 204, 21, 0.5)',
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        SELECT EVENT
      </label>

      <div style={{ position: 'relative', width: '100%' }}>
        <select
          id="event-select-dropdown"
          value={selectedDestination === null || selectedDestination === undefined ? '' : selectedDestination}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              onSelect(null);
            } else {
              onSelect(parseInt(val, 10));
            }
          }}
          style={{
            width: '100%',
            padding: '12px 42px 12px 18px',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            fontWeight: 800,
            color: '#fef08a',
            background: 'rgba(10, 20, 38, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(250, 204, 21, 0.5)',
            borderRadius: 14,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(250, 204, 21, 0.25)',
            transition: 'all 0.3s ease',
          }}
        >
          <option value="" style={{ background: '#0a1426', color: '#94a3b8' }}>
            ⚓ CHOOSE AN EVENT...
          </option>
          {MAGNUM_EVENTS.map((ev, idx) => (
            <option key={ev.id} value={idx} style={{ background: '#0a1426', color: '#fef08a' }}>
              {ev.title}
            </option>
          ))}
          <option value={10} style={{ background: '#0a1426', color: '#fde047', fontWeight: 'bold' }}>
            🏆 AUDITORIUM — WINNER ANNOUNCEMENT
          </option>
        </select>

        {/* Custom Arrow Indicator */}
        <div style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#facc15',
          fontSize: 12,
          fontWeight: 'bold',
        }}>
          ▼
        </div>
      </div>
    </div>
  );
}
