import React from 'react';
import { MAGNUM_EVENTS } from '../../data/timelineEvents';

export function DaySelector({ selectedDestination, onSelect, inline = false }) {
  const containerStyle = inline ? {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: 220,
    margin: '0 auto',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
  } : {
    position: 'absolute',
    top: 85,
    right: 20,
    left: 'auto',
    transform: 'none',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: 220,
    boxSizing: 'border-box',
    pointerEvents: 'auto',
  };

  return (
    <div style={containerStyle}>
      <label htmlFor="event-select-dropdown" style={{
        fontSize: 9,
        fontWeight: 800,
        color: '#facc15',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 4,
        textShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
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
            padding: '7px 30px 7px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fef08a',
            background: 'rgba(10, 20, 38, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(250, 204, 21, 0.5)',
            borderRadius: 10,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            boxShadow: '0 6px 18px rgba(0,0,0,0.5), 0 0 12px rgba(250, 204, 21, 0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          <option value="" style={{ background: '#0a1426', color: '#94a3b8' }}>
            ⚓ CHOOSE AN EVENT...
          </option>
          {MAGNUM_EVENTS.map((ev, idx) => (
            <option key={ev.id} value={idx} style={{ background: '#0a1426', color: '#fef08a' }}>
              {ev.icon ? `${ev.icon} ` : ''}{ev.title}
            </option>
          ))}
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
