import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Water }       from './Water';
import { Harbor }      from './Harbor';
import { ActiveShip }  from './ActiveShip';
import { Island }      from './Island';
import { FinalIsland } from './FinalIsland';
import { Clouds }      from './Clouds';
import { DaySelector } from './DaySelector';
import { ViewToggle }  from './ViewToggle';
import { BoatControls } from './BoatControls';
import { getEventIslandPositions } from './DayPath';
import { MAGNUM_EVENTS, getEventStageSchedule } from '../../data/timelineEvents';

// Suppress THREE.Clock deprecation warning emitted by Three.js when R3F initializes internal Canvas clock
if (typeof window !== 'undefined') {
  const _origWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
      return;
    }
    _origWarn.apply(console, args);
  };
}

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

/* ─── Dynamic Atmosphere Controller (Multi-stage Time-of-Day Climate) ─── */
function AtmosphereController({ progress, isSailing }) {
  const { scene } = useThree();
  const ambientRef = useRef();
  const sunRef = useRef();

  const fogMorning = useMemo(() => new THREE.Color(0x5294c7), []);
  const fogMidday  = useMemo(() => new THREE.Color(0x38bdf8), []);
  const fogSunset  = useMemo(() => new THREE.Color(0xc96e38), []);
  const fogNight   = useMemo(() => new THREE.Color(0x0a1628), []);

  const ambMorning = useMemo(() => new THREE.Color(0xffffff), []);
  const ambMidday  = useMemo(() => new THREE.Color(0xffffff), []);
  const ambSunset  = useMemo(() => new THREE.Color(0xffd1a4), []);
  const ambNight   = useMemo(() => new THREE.Color(0x7888a0), []);

  const sunMorning = useMemo(() => new THREE.Color(0xfff8e7), []);
  const sunMidday  = useMemo(() => new THREE.Color(0xffffff), []);
  const sunSunset  = useMemo(() => new THREE.Color(0xf97316), []);
  const sunNight   = useMemo(() => new THREE.Color(0x60a5fa), []);

  const targetFog = useMemo(() => new THREE.Color(), []);
  const targetAmbColor = useMemo(() => new THREE.Color(), []);
  const targetSunColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const p = isSailing ? Math.max(0, Math.min(1, progress)) : 0;

    let ambInt, sunInt;
    if (!isSailing) {
      targetFog.copy(fogMorning);
      targetAmbColor.copy(ambMorning);
      targetSunColor.copy(sunMorning);
      ambInt = 2.0;
      sunInt = 5.0;
    } else if (p < 0.3) {
      const t = p / 0.3;
      targetFog.copy(fogMorning).lerp(fogMidday, t);
      targetAmbColor.copy(ambMorning).lerp(ambMidday, t);
      targetSunColor.copy(sunMorning).lerp(sunMidday, t);
      ambInt = THREE.MathUtils.lerp(2.0, 3.0, t);
      sunInt = THREE.MathUtils.lerp(5.0, 8.0, t);
    } else if (p < 0.7) {
      const t = (p - 0.3) / 0.4;
      targetFog.copy(fogMidday).lerp(fogSunset, t);
      targetAmbColor.copy(ambMidday).lerp(ambSunset, t);
      targetSunColor.copy(sunMidday).lerp(sunSunset, t);
      ambInt = THREE.MathUtils.lerp(3.0, 2.2, t);
      sunInt = THREE.MathUtils.lerp(8.0, 6.0, t);
    } else {
      const t = (p - 0.7) / 0.3;
      targetFog.copy(fogSunset).lerp(fogNight, t);
      targetAmbColor.copy(ambSunset).lerp(ambNight, t);
      targetSunColor.copy(sunSunset).lerp(sunNight, t);
      ambInt = THREE.MathUtils.lerp(2.2, 1.2, t);
      sunInt = THREE.MathUtils.lerp(6.0, 3.0, t);
    }

    if (scene.fog) {
      scene.fog.color.lerp(targetFog, 0.05);
    }
    if (!scene.background || !(scene.background instanceof THREE.Color)) {
      scene.background = new THREE.Color();
    }
    scene.background.lerp(targetFog, 0.05);

    if (ambientRef.current) {
      ambientRef.current.color.lerp(targetAmbColor, 0.05);
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, ambInt, 0.05);
    }
    if (sunRef.current) {
      sunRef.current.color.lerp(targetSunColor, 0.05);
      sunRef.current.intensity = THREE.MathUtils.lerp(sunRef.current.intensity, sunInt, 0.05);
    }
    
    // Ensure WebGL clear color matches fog
    state.gl.setClearColor(scene.fog.color, 1.0);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={isSailing ? 3 : 2.0} />
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
    return 'linear-gradient(to bottom, rgb(20,75,140) 0%, rgb(60,140,205) 50%, rgb(130,200,240) 100%)';
  }

  const p = Math.max(0, Math.min(1, progress));

  let top, mid, bot;

  if (p < 0.3) {
    // Morning -> Midday
    const t = p / 0.3;
    top = lerpRGB([25, 80, 150], [14, 116, 144], t);
    mid = lerpRGB([70, 155, 215], [56, 189, 248], t);
    bot = lerpRGB([140, 210, 245], [186, 230, 253], t);
  } else if (p < 0.7) {
    // Midday -> Dramatic Golden Sunset
    const t = (p - 0.3) / 0.4;
    top = lerpRGB([14, 116, 144], [88, 28, 135], t);
    mid = lerpRGB([56, 189, 248], [194, 65, 12], t);
    bot = lerpRGB([186, 230, 253], [253, 186, 116], t);
  } else {
    // Sunset -> Midnight Sky
    const t = (p - 0.7) / 0.3;
    top = lerpRGB([88, 28, 135], [2, 6, 23], t);
    mid = lerpRGB([194, 65, 12], [15, 23, 42], t);
    bot = lerpRGB([253, 186, 116], [30, 41, 59], t);
  }

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
          <Clouds progress={shipProgress} isSailing={isSailing} />
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
