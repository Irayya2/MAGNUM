import React, { useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';

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
    animation: islandCardIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards,
               islandCardFloat 3.5s ease-in-out 0.85s infinite;
  }
`;

export function FinalIsland({ position, stage, event, isDocked }) {
  const { scene } = useGLTF('/models/Island-Final.glb');
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isDocked) {
      const timer = setTimeout(() => setShowCard(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
    }
  }, [isDocked]);

  const GOLD_ACCENT = "#facc15";
  const GOLD_LIGHT  = "#fef08a";

  const stageData = stage || {
    badge: "GRAND CLOSING",
    date: "9 SEPTEMBER",
    time: "2:00 PM – 5:00 PM",
    title: "VALEDICTORY / CLOSING CEREMONY + PRIZE DISTRIBUTION",
    desc: "All participants from the events gather for the final ceremony and prize distribution.",
    venue: "AUDITORIUM",
    icon: "🏆"
  };

  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={[90, 90, 90]} />

      {showCard && (
        <Html
          position={[0, 32, 0]}
          center
          distanceFactor={380}
          occlude={false}
          zIndexRange={[200, 300]}
          style={{ pointerEvents: 'none' }}
        >
          <style>{CARD_STYLE}</style>

          <div className="island-card-final-animated" style={{
            background: 'linear-gradient(150deg, rgba(10, 20, 38, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '2px solid rgba(250, 204, 21, 0.75)',
            borderRadius: 20,
            padding: '16px 20px',
            minWidth: 210,
            maxWidth: 260,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 30px rgba(250, 204, 21, 0.35)',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            textAlign: 'center',
            transformOrigin: 'bottom center',
            color: '#f8fafc',
          }}>
            {/* Top ambient radial glow */}
            <div style={{
              position: 'absolute',
              top: -35,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 90,
              background: 'radial-gradient(ellipse, rgba(250, 204, 21, 0.28) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* 1. Header Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 12px',
              borderRadius: 999,
              background: 'rgba(250, 204, 21, 0.15)',
              border: '1px solid rgba(250, 204, 21, 0.5)',
              color: GOLD_ACCENT,
              fontSize: 9.5,
              fontWeight: 900,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              <span>🏆</span>
              <span>{stageData.badge || 'GRAND CLOSING & PRIZE DISTRIBUTION'}</span>
            </div>

            {/* 2. Date Banner */}
            <div style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: GOLD_LIGHT,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              📅 {stageData.date}
            </div>

            {/* 3. Time Slot Banner (ONE TIMING ONLY) */}
            <div style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: 999,
              background: 'rgba(250, 204, 21, 0.18)',
              border: '1px solid rgba(250, 204, 21, 0.5)',
              color: GOLD_ACCENT,
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: 8,
            }}>
              🕒 {stageData.time}
            </div>

            {/* 4. Activity Title (ONE PRIMARY ACTIVITY ONLY) */}
            <div style={{
              fontSize: 13.5,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.04em',
              margin: '3px 0 6px 0',
              textShadow: '0 0 14px rgba(250, 204, 21, 0.4)',
              lineHeight: 1.25,
            }}>
              {stageData.title}
            </div>

            {/* 5. Description */}
            <div style={{
              fontSize: 10,
              color: '#cbd5e1',
              lineHeight: 1.45,
              marginBottom: 8,
            }}>
              {stageData.desc}
            </div>

            {/* 6. Venue */}
            <div style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 800,
              color: GOLD_ACCENT,
              letterSpacing: '0.08em',
              background: 'rgba(250, 204, 21, 0.1)',
              padding: '2px 8px',
              borderRadius: 6,
              border: '1px solid rgba(250, 204, 21, 0.3)',
            }}>
              📍 VENUE: {stageData.venue || 'AUDITORIUM'}
            </div>
          </div>

          {/* Connector Pin */}
          <div style={{
            width: 2,
            height: 14,
            background: 'linear-gradient(to bottom, rgba(250, 204, 21, 1), rgba(250, 204, 21, 0))',
            margin: '0 auto',
          }} />
        </Html>
      )}
    </group>
  );
}

useGLTF.preload('/models/Island-Final.glb');
