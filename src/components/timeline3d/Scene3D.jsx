import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Water }       from './Water';
import { Harbor }      from './Harbor';
import { ActiveShip }  from './ActiveShip';
import { Island }      from './Island';
import { FinalIsland } from './FinalIsland';
import { DaySelector } from './DaySelector';
import { ViewToggle }  from './ViewToggle';
import { getDayIslandPositions, dayEvents } from './DayPath';

/* ─── Per-day accent palette ─────────────────────────────────────────────── */
const DAY_META = {
  1: { accent: '#38bdf8', glow: '#0ea5e9', name: 'Day 1' },
  2: { accent: '#a78bfa', glow: '#7c3aed', name: 'Day 2' },
  3: { accent: '#fb923c', glow: '#ea580c', name: 'Day 3' },
};

/* ─── Cinematic harbor camera (active when no day is selected) ───────────── */
function HarborCamera() {
  const { camera } = useThree();
  const t = useRef(0);

  // Set initial position once
  useEffect(() => {
    camera.position.set(0, 80, -320);
    camera.lookAt(0, 5, -60);
  }, [camera]);

  useFrame((_, delta) => {
    t.current += delta * 0.12;
    // Slow cinematic pan arc around the harbor
    camera.position.x = 160 * Math.sin(t.current);
    camera.position.y = 72 + 8 * Math.sin(t.current * 0.4);
    camera.position.z = -300 + 40 * Math.cos(t.current * 0.6);
    camera.lookAt(0, 5, -50);
  });

  return null;
}

/* ─── Event info card shown when boat docks at an island ─────────────────── */
function EventInfoCard({ event, day }) {
  if (!event) return null;
  const { accent, glow } = DAY_META[day];

  return (
    <div style={{
      position: 'absolute', bottom: 90, left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(2,6,23,0.92)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${accent}44`,
      borderRadius: 18, padding: '16px 32px',
      textAlign: 'center', zIndex: 20,
      fontFamily: "'Inter','Segoe UI',sans-serif",
      boxShadow: `0 8px 36px ${glow}30, 0 0 0 1px ${accent}14`,
      animation: 'tl-fade-in 0.3s ease',
      whiteSpace: 'nowrap',
    }}>
      <div style={{
        fontSize: 11, color: accent, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
      }}>
        ⚓ Now Docked
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
        {event.title.replace(/\n/g, ' ')}
      </div>
      <div style={{ fontSize: 13, color: '#64748b' }}>
        🕐 {event.time} &nbsp;·&nbsp; {DAY_META[day].name}
      </div>
    </div>
  );
}

/* ─── Progress bar along the top for selected day ───────────────────────── */
function DayProgress({ day, dockedIndex }) {
  const events = dayEvents[day];
  const { accent, glow } = DAY_META[day];
  const progress = dockedIndex !== null ? ((dockedIndex + 1) / events.length) * 100 : 0;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: 'rgba(255,255,255,0.06)', zIndex: 20,
    }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: `linear-gradient(90deg, ${glow}, ${accent})`,
        boxShadow: `0 0 10px ${glow}`,
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
}

/* ─── Main 3D Scene ──────────────────────────────────────────────────────── */
export function Scene3D({ view, setView }) {
  const [selectedDay,      setSelectedDay]      = useState(null);
  const [dockedEventIndex, setDockedEventIndex] = useState(null);
  const isMobile = window.innerWidth < 768;

  const events          = selectedDay ? dayEvents[selectedDay]             : [];
  const islandPositions = selectedDay ? getDayIslandPositions(selectedDay) : [];
  const dockedEvent     = dockedEventIndex !== null ? events[dockedEventIndex] : null;

  const handleSelect = (day) => {
    setSelectedDay(day);
    setDockedEventIndex(null);
  };

  const handleBackToHarbor = () => {
    setSelectedDay(null);
    setDockedEventIndex(null);
  };

  /* Sky gradient transitions from night (harbor) to day (sailing) */
  const sky = selectedDay
    ? 'linear-gradient(to bottom, rgb(70,130,180) 0%, rgb(135,206,235) 100%)'
    : 'linear-gradient(to bottom, rgb(8,18,46) 0%, rgb(20,50,90) 60%, rgb(40,80,120) 100%)';

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Sky background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: sky, transition: 'background 2s ease',
      }} />

      {/* Three.js Canvas */}
      <Canvas
        camera={{ fov: isMobile ? 75 : 55, near: 1, far: 3000 }}
        gl={{ powerPreference: 'high-performance', antialias: true, stencil: false, depth: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0x1a3a5c, 600, 1800);
        }}
      >
        {/* Lights — brighter when sailing */}
        <ambientLight intensity={selectedDay ? 3 : 1.8} />
        <directionalLight position={[100, 100, 100]}  intensity={8} castShadow />
        <directionalLight position={[-100, 80, -50]}  intensity={5} />
        <directionalLight position={[0,   60,  100]}  intensity={4} />

        {/* Cinematic harbor pan when idle */}
        {!selectedDay && <HarborCamera />}

        <Suspense fallback={null}>
          <Water />

          {/* Harbor dock + 3 moored boats */}
          <Harbor selectedDay={selectedDay} />

          {/* Per-day islands & active ship once a day is selected */}
          {selectedDay && (
            <>
              {islandPositions.map((pos, i) => {
                const isLast = i === islandPositions.length - 1;
                const ev     = events[i];
                if (isLast) return <FinalIsland key={i} position={pos} event={ev} />;
                return <Island key={i} position={pos} event={ev} />;
              })}

              <ActiveShip
                key={selectedDay}      /* remount on day change to reset refs */
                day={selectedDay}
                isMobile={isMobile}
                onDock={setDockedEventIndex}
              />
            </>
          )}
        </Suspense>
      </Canvas>

      {/* ── Overlays ── */}

      {/* Day selection screen */}
      {!selectedDay && <DaySelector onSelect={handleSelect} />}

      {/* Top progress bar */}
      {selectedDay && (
        <DayProgress day={selectedDay} dockedIndex={dockedEventIndex} />
      )}

      {/* Event card when docked */}
      {selectedDay && <EventInfoCard event={dockedEvent} day={selectedDay} />}

      {/* Scroll hint */}
      {selectedDay && (
        <div style={{
          position: 'absolute', bottom: 26, left: '50%',
          transform: 'translateX(-50%)', pointerEvents: 'none',
          color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600,
          letterSpacing: '0.09em', textTransform: 'uppercase',
          fontFamily: "'Inter','Segoe UI',sans-serif",
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ animation: 'tl-bounce 1.5s ease-in-out infinite' }}>↕</span>
          Scroll to sail
        </div>
      )}

      {/* Back to harbour */}
      {selectedDay && (
        <button
          onClick={handleBackToHarbor}
          style={{
            position: 'absolute', top: 16, left: 16, zIndex: 20,
            background: 'rgba(2,6,23,0.82)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            color: '#94a3b8', padding: '8px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Inter','Segoe UI',sans-serif",
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          ← Back to Harbor
        </button>
      )}

      {/* View toggle (2D ↔ 3D) */}
      <div style={{
        position: 'absolute',
        bottom: selectedDay ? 60 : 32,
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, transition: 'bottom 0.3s',
      }}>
        <ViewToggle view={view} setView={setView} />
      </div>
    </div>
  );
}
