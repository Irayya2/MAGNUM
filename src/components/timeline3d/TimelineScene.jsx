import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { islandPositions } from './TimelinePath';
import { timelineEvents } from '../../data/timelineEvents';
import { Island } from './Island';
import { FinalIsland } from './FinalIsland';
import { DockingMarker } from './DockingMarker';
import { Water } from './Water';
import { Ship } from './Ship';
import { Timeline2D } from './Timeline2D';
import { ViewToggle } from './ViewToggle';

/* ─── 3D Scene sub-component ─────────────────────────────────────────────── */
function Scene3D({ view, setView }) {
  const [activeIsland, setActiveIsland] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(to bottom, rgb(91,184,212), rgb(200,234,248))',
        pointerEvents: 'none',
      }} />

      <Canvas
        camera={{ fov: isMobile ? 75 : 55, near: 1, far: 3000 }}
        gl={{ powerPreference: 'high-performance', antialias: true, stencil: false, depth: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ gl, scene }) => {
          scene.fog = new THREE.Fog(0x1a2a3a, 400, 1200);
        }}
      >
        <ambientLight intensity={3} />
        <directionalLight position={[100, 100, 100]} intensity={8} />
        <directionalLight position={[-100, 80, -50]} intensity={5} />
        <directionalLight position={[0, 60, 100]} intensity={5} />

        <Suspense fallback={null}>
          <Water />
          <DockingMarker activeIsland={activeIsland} />

          {islandPositions.map((pos, i) => {
            const event = timelineEvents[i];
            const isLast = i === islandPositions.length - 1;
            const key = `island-${pos[0]}-${pos[2]}`;
            if (isLast) return <FinalIsland key={key} position={pos} event={event} />;
            return <Island key={key} position={pos} event={event} />;
          })}

          <Ship
            isMobile={isMobile}
            onDock={(index) => {
              setActiveIsland(index);
              setSelectedEvent(index !== null ? timelineEvents[index] : null);
            }}
          />
        </Suspense>
      </Canvas>

      {selectedEvent && (
        <div style={{
          position: 'absolute', top: '80px', left: '20px',
          background: 'rgba(0,0,0,0.7)', color: 'white',
          padding: '20px', borderRadius: '8px', fontFamily: 'sans-serif',
        }}>
          <h2>{selectedEvent.title}</h2>
          <p>Day {selectedEvent.day} • {selectedEvent.time}</p>
        </div>
      )}

      {/* Toggle anchored in 3D view – bottom-center, above scroll hint */}
      <div style={{
        position: 'absolute', bottom: 64, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
      }}>
        <ViewToggle view={view} setView={setView} />
      </div>

      {/* 3D scroll hint */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        fontFamily: "'Inter','Segoe UI',sans-serif",
        display: 'flex', alignItems: 'center', gap: 8,
        pointerEvents: 'none',
      }}>
        <span style={{ animation: 'tl-bounce 1.5s ease-in-out infinite' }}>↕</span>
        Scroll to sail
      </div>
    </div>
  );
}

/* ─── Main exported component ────────────────────────────────────────────── */
export function TimelineScene() {
  // Default to 3D so users immediately experience the 3D scene
  const [view, setView] = useState('3d');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <style>{`
        @keyframes tl-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        @keyframes tl-fade-in {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }
      `}</style>

      {/* ── 2D View ── */}
      {view === '2d' && (
        <div style={{ position: 'absolute', inset: 0, animation: 'tl-fade-in 0.35s ease' }}>
          {/* Pass toggle into 2D so it renders inside the 2D header, below the site navbar */}
          <Timeline2D view={view} setView={setView} />
        </div>
      )}

      {/* ── 3D View ── */}
      {view === '3d' && (
        <div style={{ position: 'absolute', inset: 0, animation: 'tl-fade-in 0.35s ease' }}>
          <Scene3D view={view} setView={setView} />
        </div>
      )}
    </div>
  );
}
