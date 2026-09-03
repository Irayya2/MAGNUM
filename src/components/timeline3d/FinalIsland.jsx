import React, { useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';

const FINAL_SCHEDULE = [
  { time: '10:00 – 1:00', label: 'Round 3 Final', icon: '🏅' },
  { time: '1:00 – 2:00',  label: 'Lunch Break',   icon: '🍽️' },
  { time: '2:00 – 5:00',  label: 'Valedictory',   icon: '🏆' },
];

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
  .island-card-final-animated {
    animation: islandCardIn 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards,
               islandCardFloat 3.5s ease-in-out 0.95s infinite;
  }
`;

export function FinalIsland({ position, event, isDocked }) {
  const { scene } = useGLTF('/models/Island-Final.glb');
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

  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={[90, 90, 90]} />

      {showCard && (
        <Html
          position={[0, 20, 0]}
          center
          distanceFactor={380}
          occlude={false}
          zIndexRange={[200, 300]}
          style={{ pointerEvents: 'none' }}
        >
          <style>{CARD_STYLE}</style>

          <div className="island-card-final-animated" style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 9,
            padding: '6px 10px',
            minWidth: 105,
            maxWidth: 135,
            boxShadow: '0 6px 24px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(250,204,21,0.8)',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            transformOrigin: 'bottom center',
          }}>
            {/* Title */}
            <div style={{
              fontSize: 6.5, fontWeight: 900, color: '#78350f',
              letterSpacing: '0.09em', textTransform: 'uppercase',
              textAlign: 'center', paddingBottom: 3,
              borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 4,
            }}>
              🏆 9 Sept · Auditorium
            </div>

            {/* Schedule rows */}
            {FINAL_SCHEDULE.map((slot, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2.5px 0',
                borderBottom: i < FINAL_SCHEDULE.length - 1
                  ? '1px solid rgba(0,0,0,0.06)' : 'none',
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

          {/* Connector pin */}
          <div style={{
            width: 2, height: 4,
            background: 'linear-gradient(to bottom, rgba(250,204,21,1), rgba(250,204,21,0))',
            margin: '0 auto',
          }} />
        </Html>
      )}
    </group>
  );
}

useGLTF.preload('/models/Island-Final.glb');
