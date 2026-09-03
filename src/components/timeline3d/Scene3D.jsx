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

/* ─── Event Info Card Modal overlay when docked at an event or final island ─── */
function EventInfoCard({ destinationIndex }) {
  if (destinationIndex === null || destinationIndex === undefined) return null;
  const dest = allDestinations[destinationIndex];
  if (!dest) return null;

  const accent = '#facc15';
  const glow = '#ca8a04';

  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(10, 20, 38, 0.94)',
      backdropFilter: 'blur(20px)',
      border: '1.5px solid rgba(250, 204, 21, 0.45)',
      borderRadius: 18, padding: '16px 20px',
      textAlign: 'center', zIndex: 25,
      fontFamily: "'Inter','Segoe UI',sans-serif",
      boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(250, 204, 21, 0.2)',
      animation: 'tl-fade-in 0.35s ease',
      width: 'calc(100vw - 32px)', maxWidth: 420,
      boxSizing: 'border-box',
    }}>
      {/* Badge */}
      <div style={{
        fontSize: 10, color: accent, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
      }}>
        <span>⚓ {dest.isFinal ? 'COMMON FINAL DESTINATION' : 'EVENT VOYAGE'}</span>
      </div>

      {/* Main Title */}
      <div style={{
        fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)', fontWeight: 900,
        color: '#fef08a', marginBottom: 6, wordBreak: 'break-word',
        letterSpacing: '0.03em'
      }}>
        {dest.title}
      </div>

      {/* If Final Island: Auditorium Winner Announcement */}
      {dest.isFinal ? (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fde047', textShadow: '0 0 15px rgba(253,224,71,0.5)' }}>
            📍 AUDITORIUM
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fef08a', marginTop: 2 }}>
            🏆 WINNER ANNOUNCEMENT
          </div>
          <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 6, fontStyle: 'italic' }}>
            "{dest.subtitle}"
          </p>
        </div>
      ) : (
        /* Event Rounds (3 Rounds for every event) */
        <div style={{ marginTop: 10 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            textAlign: 'left', background: 'rgba(4, 12, 24, 0.75)',
            borderRadius: 12, padding: '10px 14px',
            border: '1px solid rgba(250,204,21,0.2)'
          }}>
            {/* Round 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: accent }}>ROUND 1</span>
              <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>8 SEPTEMBER</span>
            </div>

            {/* Round 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: accent }}>ROUND 2</span>
              <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>8 SEPTEMBER</span>
            </div>

            {/* Round 3 - Final Round */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fde047' }}>ROUND 3 — FINAL ROUND</span>
              <span style={{ fontSize: 11, color: '#fef08a', fontWeight: 700 }}>9 SEPTEMBER</span>
            </div>

            <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2, textAlign: 'center', fontWeight: 600 }}>
              ⏰ 9:00 AM – 1:30 PM
            </div>
          </div>
        </div>
      )}
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
                if (isLast) return <FinalIsland key={i} position={pos} event={dest} />;
                return <Island key={i} position={pos} event={dest} />;
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
        <EventInfoCard destinationIndex={dockedIndex} />
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
