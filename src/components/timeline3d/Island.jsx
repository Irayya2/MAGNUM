import React, { useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';

/* ─── Per-island schedule definitions ─────────────────────────────────────── */
const INAUGURATION_SCHEDULE = [
  { time: '10:00 – 11:00', label: 'Inauguration', icon: '🎉' },
];

const EVENT_SCHEDULE = [
  { time: '11:00 – 1:00', label: 'Round 1',    icon: '⚡' },
  { time: '1:00 – 2:00',  label: 'Lunch Break', icon: '🍽️' },
  { time: '2:00 – 5:00',  label: 'Round 2',    icon: '🔥' },
];

/* ─── Smooth cinematic arrival animation ───────────────────────────────────── */
const CARD_STYLE = `
  @keyframes islandCardIn {
    0%   { opacity: 0; transform: translateY(22px) scale(0.85); }
    70%  { opacity: 0.95; transform: translateY(-3px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0px) scale(1); }
  }
  @keyframes islandCardFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }
  .island-card-animated {
    animation: islandCardIn 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards,
               islandCardFloat 3.5s ease-in-out 0.95s infinite;
  }
`;

/* ─── Schedule card rendered inside Html ──────────────────────────────────── */
function ScheduleCard({ title, slots }) {
  return (
    <Html
      position={[0, 20, 0]}
      center
      distanceFactor={350}
      occlude={false}
      zIndexRange={[200, 300]}
      style={{ pointerEvents: 'none' }}
    >
      <style>{CARD_STYLE}</style>

      <div className="island-card-animated" style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 9,
        padding: '6px 10px',
        minWidth: 100,
        maxWidth: 130,
        boxShadow: '0 6px 24px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(250,204,21,0.6)',
        fontFamily: "'Inter','Segoe UI',sans-serif",
        transformOrigin: 'bottom center',
      }}>
        {/* Title row */}
        <div style={{
          fontSize: 6.5, fontWeight: 900, color: '#92400e',
          letterSpacing: '0.09em', textTransform: 'uppercase',
          textAlign: 'center', paddingBottom: 3,
          borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          ⚓ {title}
        </div>

        {/* Schedule rows */}
        {slots.map((slot, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '2.5px 0',
            borderBottom: i < slots.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          }}>
            <span style={{ fontSize: 8.5, flexShrink: 0 }}>{slot.icon}</span>
            <div>
              <div style={{ fontSize: 6.5, fontWeight: 800, color: '#b45309', lineHeight: 1.15 }}>
                {slot.time}
              </div>
              <div style={{ fontSize: 7.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.15 }}>
                {slot.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connector pin down to island */}
      <div style={{
        width: 2, height: 4,
        background: 'linear-gradient(to bottom, rgba(250,204,21,1), rgba(250,204,21,0))',
        margin: '0 auto',
      }} />
    </Html>
  );
}

/* ─── Island component ────────────────────────────────────────────────────── */
export function Island({ position, event, isDocked, islandIndex }) {
  const { scene } = useGLTF('/models/island.glb');
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isDocked) {
      // Delay card display until ship reaches port and camera settles into place
      const timer = setTimeout(() => setShowCard(true), 600);
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
    }
  }, [isDocked]);

  const isFirst = islandIndex === 0;
  const slots   = isFirst ? INAUGURATION_SCHEDULE : EVENT_SCHEDULE;
  const label   = event?.shortName || event?.title || 'Event';

  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={[40, 40, 40]} />
      {showCard && <ScheduleCard title={label} slots={slots} />}
    </group>
  );
}

useGLTF.preload('/models/island.glb');
