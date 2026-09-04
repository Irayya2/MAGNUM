import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Water }       from './Water';
import { Harbor }      from './Harbor';
import { ActiveShip }  from './ActiveShip';
import { Island }      from './Island';
import { FinalIsland } from './FinalIsland';
import { DaySelector } from './DaySelector';
import { ViewToggle }  from './ViewToggle';
import { BoatControls } from './BoatControls';
import { getEventIslandPositions } from './DayPath';
import { MAGNUM_EVENTS, getEventStageSchedule } from '../../data/timelineEvents';

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

/* ─── Top progress bar ─── */
function VoyageProgress({ dockedIndex }) {
  const total = 7;
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

/* ─── Dynamic Atmosphere Controller (Fog & Lights inside Canvas) ─── */
function AtmosphereController({ progress, isSailing }) {
  const { scene } = useThree();
  const ambientRef = useRef();
  const sunRef = useRef();

  const fogDay = useMemo(() => new THREE.Color(0x1a3a5c), []);
  const fogNight = useMemo(() => new THREE.Color(0x080f1d), []);

  const ambDayColor = useMemo(() => new THREE.Color(0xffffff), []);
  const ambNightColor = useMemo(() => new THREE.Color(0x7888a0), []);

  const sunDayColor = useMemo(() => new THREE.Color(0xfffaed), []);
  const sunNightColor = useMemo(() => new THREE.Color(0x60a5fa), []);

  const targetFog = useMemo(() => new THREE.Color(), []);
  const targetAmbColor = useMemo(() => new THREE.Color(), []);
  const targetSunColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = isSailing ? Math.max(0, Math.min(1, progress)) : 0;

    let ambInt, sunInt;
    if (!isSailing) {
      targetFog.copy(fogDay);
      targetAmbColor.copy(ambDayColor);
      targetSunColor.copy(sunDayColor);
      ambInt = 1.8;
      sunInt = 5;
    } else {
      targetFog.copy(fogDay).lerp(fogNight, p);
      targetAmbColor.copy(ambDayColor).lerp(ambNightColor, p);
      targetSunColor.copy(sunDayColor).lerp(sunNightColor, p);
      ambInt = THREE.MathUtils.lerp(3.0, 1.2, p);
      sunInt = THREE.MathUtils.lerp(8.0, 3.2, p);
    }

    if (scene.fog) {
      scene.fog.color.lerp(targetFog, 0.05);
    }
    if (ambientRef.current) {
      ambientRef.current.color.lerp(targetAmbColor, 0.05);
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, ambInt, 0.05);
    }
    if (sunRef.current) {
      sunRef.current.color.lerp(targetSunColor, 0.05);
      sunRef.current.intensity = THREE.MathUtils.lerp(sunRef.current.intensity, sunInt, 0.05);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={isSailing ? 3 : 1.8} />
      <directionalLight ref={sunRef} position={[100, 100, 100]} intensity={8} castShadow />
      <directionalLight position={[-100, 80, -50]} intensity={4} />
      <directionalLight position={[0, 60, 100]} intensity={3} />
    </>
  );
}

/* ─── Color Interpolation Helper for Sky Gradient ─── */
function lerpRGB(c1, c2, t) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

function getSkyGradient(progress, isSailing) {
  if (!isSailing) {
    return 'linear-gradient(to bottom, rgb(8,18,46) 0%, rgb(20,50,90) 60%, rgb(40,80,120) 100%)';
  }

  const p = Math.max(0, Math.min(1, progress));

  // Clean transition directly from Day Sky to Dark Mode Evening Sky
  // Day (p = 0.0)
  const dayTop = [35, 95, 155];
  const dayMid = [90, 170, 215];
  const dayBot = [150, 210, 238];

  // Dark Mode Evening (p = 1.0)
  const nightTop = [2, 6, 23];
  const nightMid = [15, 23, 42];
  const nightBot = [30, 41, 59];

  const top = lerpRGB(dayTop, nightTop, p);
  const mid = lerpRGB(dayMid, nightMid, p);
  const bot = lerpRGB(dayBot, nightBot, p);

  return `linear-gradient(to bottom, ${top} 0%, ${mid} 55%, ${bot} 100%)`;
}

/* ─── Main 3D Scene Component ─── */
export function Scene3D({ view, setView, selectedDestination: propSelectedDestination, setSelectedDestination: propSetSelectedDestination }) {
  const [internalSelectedDestination, setInternalSelectedDestination] = useState(null);
  const selectedDestination = propSelectedDestination !== undefined ? propSelectedDestination : internalSelectedDestination;
  const setSelectedDestination = propSetSelectedDestination || setInternalSelectedDestination;

  const [dockedIndex, setDockedIndex] = useState(null);
  const [shipProgress, setShipProgress] = useState(0);
  const isMobile = window.innerWidth < 768;

  const islandPositions = getEventIslandPositions();
  const selectedEvent = (selectedDestination !== null && MAGNUM_EVENTS[selectedDestination])
    ? MAGNUM_EVENTS[selectedDestination]
    : MAGNUM_EVENTS[0];
  const stages = getEventStageSchedule(selectedEvent);

  const handleSelect = (index) => {
    setSelectedDestination(index);
    setDockedIndex(null);
    setShipProgress(0);
  };

  const handleBackToHarbor = () => {
    setSelectedDestination(null);
    setDockedIndex(null);
    setShipProgress(0);
  };

  const isSailing = selectedDestination !== null;
  const sky = getSkyGradient(shipProgress, isSailing);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Sky background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: sky, transition: 'background 0.3s ease-out',
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
        <AtmosphereController progress={shipProgress} isSailing={isSailing} />

        {selectedDestination === null && <HarborCamera />}

        <Suspense fallback={null}>
          <Water progress={shipProgress} isSailing={isSailing} />
          <Harbor selectedDay={selectedDestination} onSelect={handleSelect} />

          {selectedDestination !== null && (
            <>
              {islandPositions.map((pos, i) => {
                const isLast = i === islandPositions.length - 1;
                const stage = stages[i];
                const isDocked = dockedIndex === i;
                if (isLast) {
                  return (
                    <FinalIsland
                      key={i}
                      position={pos}
                      stage={stage}
                      event={selectedEvent}
                      isDocked={isDocked}
                    />
                  );
                }
                return (
                  <Island
                    key={i}
                    position={pos}
                    stage={stage}
                    event={selectedEvent}
                    isDocked={isDocked}
                    islandIndex={i}
                  />
                );
              })}

              <ActiveShip
                key={selectedDestination}
                day={selectedDestination}
                isMobile={isMobile}
                onDock={setDockedIndex}
                onProgress={setShipProgress}
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

      {/* Touch & Click Boat Movement Controls (Mobile Friendly) */}
      <BoatControls
        selectedDestination={selectedDestination}
        onSelect={handleSelect}
      />

      {selectedDestination !== null && (
        <VoyageProgress dockedIndex={dockedIndex} />
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

    </div>
  );
}
