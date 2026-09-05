import React, { useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';

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
    animation: islandCardIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards,
               islandCardFloat 3.5s ease-in-out 0.85s infinite;
  }
`;

/* ─── Single Stage Schedule Card rendered inside Html ────────────────────────── */
function SingleStageCard({ stage, event }) {
  if (!stage) return null;

  const GOLD_ACCENT = "#facc15";
  const GOLD_LIGHT  = "#fef08a";

  return (
    <Html
      position={[0, 24, 0]}
      center
      distanceFactor={160}
      occlude={false}
      zIndexRange={[200, 300]}
      style={{ pointerEvents: 'none' }}
    >
      <style>{CARD_STYLE}</style>

      <div className="island-card-animated" style={{
        background: 'linear-gradient(150deg, rgba(10, 20, 38, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(250, 204, 21, 0.55)',
        borderRadius: 14,
        padding: '10px 14px',
        minWidth: 150,
        maxWidth: 200,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(250, 204, 21, 0.25)',
        fontFamily: "'Inter','Segoe UI',sans-serif",
        textAlign: 'center',
        transformOrigin: 'bottom center',
        color: '#f8fafc',
      }}>
        {/* Top ambient radial glow */}
        <div style={{
          position: 'absolute',
          top: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 180,
          height: 80,
          background: 'radial-gradient(ellipse, rgba(250, 204, 21, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* 1. Category / Stage Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 10px',
          borderRadius: 999,
          background: 'rgba(250, 204, 21, 0.12)',
          border: '1px solid rgba(250, 204, 21, 0.4)',
          color: GOLD_ACCENT,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          <span>{stage.icon}</span>
          <span>{stage.badge}</span>
        </div>

        {/* 2. Date Banner */}
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          color: GOLD_LIGHT,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          📅 {stage.date}
        </div>

        {/* 3. Time Slot */}
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 999,
          background: 'rgba(250, 204, 21, 0.15)',
          border: '1px solid rgba(250, 204, 21, 0.45)',
          color: GOLD_ACCENT,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.04em',
          marginBottom: 8,
          whiteSpace: 'pre-line',
        }}>
          🕒 {stage.time}
        </div>

        {/* 4. Activity Title (ONE PRIMARY ACTIVITY ONLY) */}
        <div style={{
          fontSize: 13,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '0.04em',
          margin: '2px 0 6px 0',
          textShadow: '0 0 12px rgba(250, 204, 21, 0.3)',
          lineHeight: 1.25,
        }}>
          {stage.title}
        </div>

        {/* 5. Description */}
        <div style={{
          fontSize: 9.5,
          color: '#cbd5e1',
          lineHeight: 1.45,
        }}>
          {stage.desc}
        </div>
      </div>

      {/* Connector Pin */}
      <div style={{
        width: 2,
        height: 12,
        background: 'linear-gradient(to bottom, rgba(250, 204, 21, 0.9), rgba(250, 204, 21, 0))',
        margin: '0 auto',
      }} />
    </Html>
  );
}

/* ─── Island Component ────────────────────────────────────────────────────── */
export function Island({ position, stage, event, isDocked, islandIndex }) {
  const { scene } = useGLTF('/models/island.glb');
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isDocked) {
      const timer = setTimeout(() => setShowCard(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
    }
  }, [isDocked]);

  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={[40, 40, 40]} />
      {showCard && <SingleStageCard stage={stage} event={event} />}
    </group>
  );
}

useGLTF.preload('/models/island.glb');
