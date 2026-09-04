import React from 'react';
import { getEventStageSchedule } from '../../data/timelineEvents';

export function Event2DCard({ event, destinationIndex }) {
  if (!event) return null;

  const GOLD_ACCENT = "#facc15";
  const GOLD_LIGHT  = "#fef08a";

  const steps = buildEventTimeSteps(event);

  const containerRef = React.useRef(null);
  const lastDotRef = React.useRef(null);
  const [lineBottom, setLineBottom] = React.useState(40);

  React.useLayoutEffect(() => {
    function updateLine() {
      if (containerRef.current && lastDotRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const lastDotRect = lastDotRef.current.getBoundingClientRect();
        const bottomPx = containerRect.bottom - (lastDotRect.top + lastDotRect.height / 2);
        setLineBottom(Math.max(0, bottomPx));
      }
    }

    updateLine();
    window.addEventListener('resize', updateLine);
    return () => window.removeEventListener('resize', updateLine);
  }, [event, destinationIndex]);

  return (
    <div
      ref={containerRef}
      className="tl-alternating-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
        padding: '20px 10px 80px',
        boxSizing: 'border-box',
      }}
    >
      {/* Dynamic CSS styles for alternating layout & responsive design */}
      <style>{`
        .tl-alternating-container {
          position: relative;
        }

        /* Central Straight Dotted Timeline Line */
        .tl-center-line {
          position: absolute;
          top: 30px;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          border-left: 2px dashed rgba(250, 204, 21, 0.65);
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
          z-index: 1;
          pointer-events: none;
        }

        /* Timeline Item Row */
        .tl-row {
          display: flex;
          width: 100%;
          align-items: center;
          position: relative;
          margin: 36px 0;
          z-index: 2;
        }

        .tl-row-right {
          flex-direction: row;
        }

        .tl-row-left {
          flex-direction: row-reverse;
        }

        /* Card Slot & Spacer */
        .tl-card-slot {
          width: 45%;
          box-sizing: border-box;
        }

        .tl-spacer-slot {
          width: 45%;
        }

        /* Center Node & Connector Line */
        .tl-node-slot {
          width: 10%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 5;
        }

        .tl-node-dot {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #facc15;
          border: 3px solid #020617;
          box-shadow: 0 0 14px rgba(250, 204, 21, 0.9);
          z-index: 6;
          flex-shrink: 0;
        }

        /* Horizontal Connectors */
        .tl-connector-right {
          position: absolute;
          left: 50%;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #facc15 0%, rgba(250, 204, 21, 0.25) 100%);
          box-shadow: 0 0 8px rgba(250, 204, 21, 0.4);
          z-index: 4;
        }

        .tl-connector-left {
          position: absolute;
          right: 50%;
          left: 0;
          height: 2px;
          background: linear-gradient(270deg, #facc15 0%, rgba(250, 204, 21, 0.25) 100%);
          box-shadow: 0 0 8px rgba(250, 204, 21, 0.4);
          z-index: 4;
        }

        /* Date Divider Badge */
        .tl-date-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 44px 0 28px 0;
          position: relative;
          z-index: 10;
        }

        .tl-date-badge {
          background: rgba(10, 20, 38, 0.95);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(250, 204, 21, 0.6);
          color: #facc15;
          padding: 7px 22px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          box-shadow: 0 0 18px rgba(250, 204, 21, 0.3);
        }

        /* Voyage Logs Card Styling */
        .tl-voyage-card {
          background: linear-gradient(150deg, rgba(10, 20, 38, 0.94) 0%, rgba(2, 6, 23, 0.96) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(250, 204, 21, 0.4);
          border-radius: 22px;
          padding: 24px 20px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65), 0 0 25px rgba(250, 204, 21, 0.15);
          color: #f8fafc;
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .tl-voyage-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(0, 0, 0, 0.75), 0 0 30px rgba(250, 204, 21, 0.25);
        }

        /* Responsive Mobile Adjustments (≤ 768px) */
        @media (max-width: 768px) {
          .tl-center-line {
            left: 20px;
            transform: none;
          }

          .tl-row, .tl-row-left, .tl-row-right {
            flex-direction: row !important;
            margin: 24px 0;
          }

          .tl-spacer-slot {
            display: none !important;
          }

          .tl-node-slot {
            width: 40px !important;
            justify-content: flex-start !important;
          }

          .tl-node-dot {
            margin-left: 11px;
          }

          .tl-connector-right, .tl-connector-left {
            display: none !important;
          }

          .tl-card-slot {
            width: calc(100% - 40px) !important;
          }

          .tl-voyage-card {
            padding: 20px 16px;
          }
        }
      `}</style>

      {/* ONE Continuous Straight Vertical Dotted Line */}
      <div className="tl-center-line" style={{ bottom: lineBottom }} />

      {/* Date Transition Divider for Day 1 */}
      {steps.length > 0 && steps[0].date && (
        <div className="tl-date-divider" style={{ marginTop: 10 }}>
          <div className="tl-date-badge">
            📅 {steps[0].date}
          </div>
        </div>
      )}

      {/* Loop through timeline steps */}
      {steps.map((stepData, idx) => {
        const isRight = idx % 2 === 0;
        const isDateBreak = idx > 0 && steps[idx - 1].date !== stepData.date;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={`${event.id}-${idx}`}>
            {/* Date Transition Divider when switching dates */}
            {isDateBreak && (
              <div className="tl-date-divider">
                <div className="tl-date-badge">
                  📅 {stepData.date}
                </div>
              </div>
            )}

            {/* Alternating Row */}
            <div className={`tl-row ${isRight ? 'tl-row-right' : 'tl-row-left'}`}>
              {/* Spacer Slot */}
              <div className="tl-spacer-slot" />

              {/* Central Node & Connector */}
              <div className="tl-node-slot">
                <div
                  ref={isLast ? lastDotRef : null}
                  className="tl-node-dot"
                  title={stepData.roundName}
                />
                <div className={isRight ? 'tl-connector-right' : 'tl-connector-left'} />
              </div>

              {/* Card Slot (Voyage Logs Card) */}
              <div className="tl-card-slot">
                <div className="tl-voyage-card">
                  {/* Top Ambient Radial Glow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -45,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 280,
                      height: 140,
                      background: 'radial-gradient(ellipse, rgba(250, 204, 21, 0.15) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* 1. Header Category / Status Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 14px',
                        borderRadius: 999,
                        background: 'rgba(250, 204, 21, 0.12)',
                        border: '1px solid rgba(250, 204, 21, 0.4)',
                        color: GOLD_ACCENT,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <span>{stepData.icon}</span>
                      <span>{stepData.badge}</span>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: GOLD_LIGHT,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginTop: 2,
                      }}
                    >
                      📅 {stepData.date}
                    </div>
                  </div>

                  {/* 2. Selected Event Logo & Name */}
                  {event.logo && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                      <img
                        src={event.logo}
                        alt={event.title}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(250, 204, 21, 0.7)',
                          boxShadow: '0 0 16px rgba(250, 204, 21, 0.4)',
                        }}
                      />
                    </div>
                  )}

                  <h2
                    style={{
                      fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)',
                      fontWeight: 900,
                      color: GOLD_LIGHT,
                      margin: '0 0 12px 0',
                      lineHeight: 1.25,
                      letterSpacing: '0.03em',
                      textShadow: '0 0 16px rgba(250, 204, 21, 0.35)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {event.title}
                  </h2>

                  {/* 3. Time Slot Banner & Round Details */}
                  <div
                    style={{
                      background: stepData.isFinal
                        ? 'rgba(250, 204, 21, 0.08)'
                        : stepData.isBreak
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(4, 12, 24, 0.8)',
                      borderRadius: 14,
                      padding: '16px 14px',
                      border: stepData.isFinal
                        ? '1.5px solid rgba(250, 204, 21, 0.45)'
                        : '1px solid rgba(250, 204, 21, 0.22)',
                      textAlign: 'center',
                    }}
                  >
                    {/* Time Slot Banner */}
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '5px 16px',
                        borderRadius: 999,
                        background: 'rgba(250, 204, 21, 0.15)',
                        border: '1px solid rgba(250, 204, 21, 0.4)',
                        color: GOLD_ACCENT,
                        fontSize: 'clamp(0.8rem, 2.2vw, 0.95rem)',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        marginBottom: 8,
                      }}
                    >
                      🕒 {stepData.time}
                    </div>

                    {/* Activity / Round Title */}
                    <h3
                      style={{
                        fontSize: 'clamp(1rem, 2.8vw, 1.25rem)',
                        fontWeight: 900,
                        color: GOLD_LIGHT,
                        margin: '4px 0 6px 0',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {stepData.roundName}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                        color: '#cbd5e1',
                        lineHeight: 1.5,
                        margin: '0 auto',
                      }}
                    >
                      {stepData.desc}
                    </p>

                    {stepData.venue && (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 11,
                          fontWeight: 800,
                          color: GOLD_ACCENT,
                          letterSpacing: '0.08em',
                        }}
                      >
                        📍 VENUE: {stepData.venue}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Builds time-based activity steps for the selected event.
 */
function buildEventTimeSteps(event) {
  if (!event) return [];
  const stages = getEventStageSchedule(event);
  return stages.map((st, i) => ({
    ...st,
    stepIndex: i,
    roundName: st.shortTitle || st.title
  }));
}
