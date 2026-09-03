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
import { getEventIslandPositions, allDestinations } from './DayPath';

/* ─── Cinematic harbor camera (active when no destination is selected) ─── */
function HarborCamera() {
  const { camera } = useThree();
  const t = useRef(0);

  useEffect(() => {
    camera.position.set(0, 80, -320);
    camera.lookAt(0, 5, -60);
  }, [camera]);

  useFrame((_, delta) => {
    t.current += delta * 0.12;
    camera.position.x = 160 * Math.sin(t.current);
    camera.position.y = 72 + 8 * Math.sin(t.current * 0.4);
    camera.position.z = -300 + 40 * Math.cos(t.current * 0.6);
    camera.lookAt(0, 5, -50);
  });

  return null;
}

/* ─── Per-island schedules ────────────────────────────────────────────────── */
const ISLAND_SCHEDULES = [
  // Island 0 — Inauguration
  [{ time: '10:00–11:00', label: 'Inauguration', icon: '🎉' }],
  // Islands 1–9 — Day 1 rounds
  ...Array(9).fill([
    { time: '11:00–1:00', label: 'Round 1',     icon: '⚡' },
    { time: '1:00–2:00',  label: 'Lunch Break', icon: '🍽️' },
    { time: '2:00–5:00',  label: 'Round 2',     icon: '🔥' },
  ]),
];

const FINAL_DAY_SCHEDULE = [
  { time: '10:00–1:00', label: 'Round 3 Final', icon: '🏅' },
  { time: '1:00–2:00',  label: 'Lunch Break',   icon: '🍽️' },
  { time: '2:00–5:00',  label: 'Valedictory',   icon: '🏆' },
];

function IslandScheduleCard({ destinationIndex }) {
  if (destinationIndex === null || destinationIndex === undefined) return null;
  const dest = allDestinations[destinationIndex];
  if (!dest) return null;

  const isFinal = dest.isFinal;
  const slots   = isFinal ? FINAL_DAY_SCHEDULE : (ISLAND_SCHEDULES[destinationIndex] || ISLAND_SCHEDULES[1]);
  const dateLabel = isFinal ? '9 Sept · Auditorium' : '8–9 September 2026';

  return (
    <div style={{
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.97)',
      border: '1.5px solid rgba(250,204,21,0.7)',
      borderRadius: 8,
      padding: '6px 9px',
      zIndex: 200,
      fontFamily: "'Inter','Segoe UI',sans-serif",
      boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
      animation: 'tl-fade-in 0.3s ease',
      minWidth: 110,
      maxWidth: 140,
      pointerEvents: 'none',
    }}>
      {/* Header */}
      <div style={{
        fontSize: 7, fontWeight: 900, color: '#92400e',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        textAlign: 'center', paddingBottom: 3,
        borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 4,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {isFinal ? '🏆' : '⚓'} {dest.shortName || dest.title}
      </div>
      <div style={{
        fontSize: 6, color: '#b45309', fontWeight: 700,
        textAlign: 'center', marginBottom: 4,
      }}>
        {dateLabel}
      </div>

      {/* Schedule rows */}
      {slots.map((slot, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '2px 0',
          borderBottom: i < slots.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
        }}>
          <span style={{ fontSize: 8 }}>{slot.icon}</span>
          <div>
            <div style={{ fontSize: 6.5, fontWeight: 800, color: '#b45309', lineHeight: 1.1 }}>
              {slot.time}
            </div>
            <div style={{ fontSize: 7.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.1 }}>
              {slot.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Top progress bar ─── */
function VoyageProgress({ dockedIndex }) {
  const total = allDestinations.length;
  const progress = dockedIndex !== null ? ((dockedIndex + 1) / total) * 100 : 0;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 4,
      background: 'rgba(255,255,255,0.08)', zIndex: 25,
    }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: 'linear-gradient(90deg, #facc15, #eab308)',
        boxShadow: '0 0 12px #facc15',
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
}

/* ─── Main 3D Scene Component ─── */
export function Scene3D({ view, setView, selectedDestination: propSelectedDestination, setSelectedDestination: propSetSelectedDestination }) {
  const [internalSelectedDestination, setInternalSelectedDestination] = useState(null);
  const selectedDestination = propSelectedDestination !== undefined ? propSelectedDestination : internalSelectedDestination;
  const setSelectedDestination = propSetSelectedDestination || setInternalSelectedDestination;

  const [dockedIndex, setDockedIndex] = useState(null);
  const isMobile = window.innerWidth < 768;

  const islandPositions = getEventIslandPositions();

  const handleSelect = (index) => {
    setSelectedDestination(index);
    setDockedIndex(null);
  };

  const handleBackToHarbor = () => {
    setSelectedDestination(null);
    setDockedIndex(null);
  };

  const sky = selectedDestination !== null
    ? 'linear-gradient(to bottom, rgb(40,90,140) 0%, rgb(100,180,220) 100%)'
    : 'linear-gradient(to bottom, rgb(8,18,46) 0%, rgb(20,50,90) 60%, rgb(40,80,120) 100%)';

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Sky background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: sky, transition: 'background 2s ease',
      }} />

      {/* Canvas */}
      <Canvas
        camera={{ fov: isMobile ? 75 : 55, near: 1, far: 3500 }}
        gl={{ powerPreference: 'high-performance', antialias: true, stencil: false, depth: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0x1a3a5c, 700, 2200);
        }}
      >
        <ambientLight intensity={selectedDestination !== null ? 3 : 1.8} />
        <directionalLight position={[100, 100, 100]} intensity={8} castShadow />
        <directionalLight position={[-100, 80, -50]} intensity={5} />
        <directionalLight position={[0, 60, 100]} intensity={4} />

        {selectedDestination === null && <HarborCamera />}

        <Suspense fallback={null}>
          <Water />
          <Harbor selectedDay={selectedDestination} onSelect={handleSelect} />

          {selectedDestination !== null && (
            <>
              {islandPositions.map((pos, i) => {
                const isLast = i === islandPositions.length - 1;
                const dest = allDestinations[i];
                const isDocked = dockedIndex === i;
                if (isLast) return <FinalIsland key={i} position={pos} event={dest} isDocked={isDocked} />;
                return <Island key={i} position={pos} event={dest} isDocked={isDocked} islandIndex={i} />;
              })}

              <ActiveShip
                key={selectedDestination}
                day={selectedDestination}
                isMobile={isMobile}
                onDock={setDockedIndex}
              />
            </>
          )}
        </Suspense>
      </Canvas>

      {/* Single Clean Event Dropdown Control near top */}
      <DaySelector
        selectedDestination={selectedDestination}
        onSelect={handleSelect}
      />

      {selectedDestination !== null && (
        <VoyageProgress dockedIndex={dockedIndex} />
      )}



      {selectedDestination !== null && (
        <div style={{
          position: 'absolute', bottom: 26, left: '50%',
          transform: 'translateX(-50%)', pointerEvents: 'none',
          color: 'rgba(250,204,21,0.8)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.09em', textTransform: 'uppercase',
          fontFamily: "'Inter','Segoe UI',sans-serif",
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(2,6,23,0.75)', padding: '6px 16px', borderRadius: 999,
          border: '1px solid rgba(250,204,21,0.2)'
        }}>
          <span style={{ animation: 'tl-bounce 1.5s ease-in-out infinite' }}>↕</span>
          Scroll to sail along the Event Voyage
        </div>
      )}

      {selectedDestination !== null && (
        <button
          onClick={handleBackToHarbor}
          style={{
            position: 'absolute', top: isMobile ? 140 : 85, left: 16, zIndex: 30,
            background: 'rgba(10,20,38,0.88)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(250,204,21,0.4)', borderRadius: 12,
            color: '#facc15', padding: '9px 18px', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: "'Inter','Segoe UI',sans-serif",
            transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = '#facc15'}
        >
          ← Back to Overview
        </button>
      )}

      {/* View Toggle */}
      <div style={{
        position: 'absolute',
        bottom: selectedDestination !== null ? 48 : 28,
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, transition: 'bottom 0.3s',
      }}>
        <ViewToggle view={view} setView={setView} />
      </div>
    </div>
  );
}
