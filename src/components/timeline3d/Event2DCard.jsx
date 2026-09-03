import React from 'react';

export function Event2DCard({ event, destinationIndex }) {
  if (!event) return null;

  const GOLD_ACCENT = "#facc15";
  const isFinal = event.isFinal;

  return (
    <div
      id="event-2d-card"
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        background: 'linear-gradient(150deg, rgba(10, 20, 38, 0.94) 0%, rgba(2, 6, 23, 0.96) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(250, 204, 21, 0.4)',
        borderRadius: 22,
        padding: '30px 24px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65), 0 0 25px rgba(250, 204, 21, 0.15)',
        boxSizing: 'border-box',
        color: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: 'tl-card-swap 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Background Subtle Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: 180,
          background: 'radial-gradient(ellipse, rgba(250, 204, 21, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 1. Event Category / Small Label */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 16px',
          borderRadius: 999,
          background: 'rgba(250, 204, 21, 0.1)',
          border: '1px solid rgba(250, 204, 21, 0.35)',
          color: GOLD_ACCENT,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        <span>⚓</span>
        <span>{isFinal ? 'COMMON FINAL DESTINATION' : `EVENT • ${event.category || 'COMPETITION'}`}</span>
      </div>

      {/* 2. Event Name */}
      <h2
        style={{
          fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)',
          fontWeight: 900,
          color: '#fef08a',
          margin: '0 0 12px 0',
          lineHeight: 1.25,
          letterSpacing: '0.04em',
          textShadow: '0 0 18px rgba(250, 204, 21, 0.35)',
          wordBreak: 'break-word',
        }}
      >
        {event.title}
      </h2>

      {/* 3. Short Description */}
      <p
        style={{
          fontSize: 'clamp(0.88rem, 2.5vw, 0.98rem)',
          color: '#cbd5e1',
          lineHeight: 1.6,
          margin: '0 0 24px 0',
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {event.desc}
      </p>

      {/* Gold Divider Line (Voyage Logs Style) */}
      <div
        style={{
          height: 1,
          width: '100%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(250, 204, 21, 0.35) 50%, transparent 100%)',
          margin: '0 0 24px 0',
        }}
      />

      {/* 4-7. Round Info, Dates, Times & Final Round Details */}
      {isFinal ? (
        <div
          style={{
            background: 'rgba(4, 12, 24, 0.75)',
            borderRadius: 16,
            padding: '20px 18px',
            border: '1px solid rgba(250, 204, 21, 0.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8, filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.5))' }}>🏆</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fde047', letterSpacing: '0.06em' }}>
            AUDITORIUM — WINNER ANNOUNCEMENT
          </div>
          <div style={{ fontSize: 13, color: '#fef08a', fontWeight: 700, marginTop: 6 }}>
            9 SEPTEMBER • 1:30 PM ONWARDS
          </div>
          <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 8, fontStyle: 'italic' }}>
            "{event.subtitle || 'All event journeys lead here.'}"
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(4, 12, 24, 0.75)',
            borderRadius: 16,
            padding: '18px 16px',
            border: '1px solid rgba(250, 204, 21, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {event.rounds && event.rounds.map((rd, i) => {
            const isLastRound = i === event.rounds.length - 1;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  paddingBottom: isLastRound ? 0 : 10,
                  borderBottom: isLastRound ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: isLastRound ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.07)',
                    color: isLastRound ? GOLD_ACCENT : '#e2e8f0',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rd.name}
                </div>

                <div style={{ textAlign: 'right', flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isLastRound ? '#fef08a' : '#cbd5e1' }}>
                    {rd.date}
                  </div>
                  <div style={{ fontSize: 11, color: isLastRound ? '#fef08a' : '#94a3b8', marginTop: 2, fontWeight: isLastRound ? 700 : 400 }}>
                    {rd.time || rd.schedule}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
