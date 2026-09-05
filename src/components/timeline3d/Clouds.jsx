import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Individual Cloud Puff Cluster ────────────────────────────────────────── */
function SingleCloud({ position, scale = 1, speed = 0.5, colorRef }) {
  const groupRef = useRef();

  // Create sub-spheres for stylized fluffy cloud shape
  const puffs = useMemo(() => [
    { pos: [0, 0, 0], scale: 1.0 },
    { pos: [-6, -1, 2], scale: 0.75 },
    { pos: [6, -1, -1], scale: 0.8 },
    { pos: [-3, 3, -1], scale: 0.85 },
    { pos: [3, 2.5, 1], scale: 0.7 },
    { pos: [0, -2, -3], scale: 0.65 },
  ], []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += speed * delta * 2;
      // Wrap around wide bounds
      if (groupRef.current.position.x > 800) {
        groupRef.current.position.x = -800;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale * 0.55, scale]}>
      {puffs.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[12 * p.scale, 7, 7]} />
          <meshStandardMaterial
            ref={i === 0 ? colorRef : undefined}
            color="#ffffff"
            roughness={0.9}
            metalness={0.1}
            flatShading
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Main Clouds Component ────────────────────────────────────────────────── */
export function Clouds({ progress = 0, isSailing = false }) {
  const matRefs = useRef([]);

  // Distribute clouds evenly in the sky along the 3D timeline path
  const cloudData = useMemo(() => [
    { pos: [-250, 140, -100], scale: 2.2, speed: 1.2 },
    { pos: [150, 160, -250],  scale: 2.8, speed: 0.8 },
    { pos: [-400, 180, -400], scale: 3.2, speed: 1.5 },
    { pos: [300, 150, -600],  scale: 2.5, speed: 1.0 },
    { pos: [-180, 190, -850], scale: 3.5, speed: 0.7 },
    { pos: [220, 170, -1100], scale: 2.9, speed: 1.4 },
    { pos: [-320, 160, -1350],scale: 3.1, speed: 1.1 },
    { pos: [180, 200, -1600], scale: 3.8, speed: 0.9 },
    { pos: [-100, 175, -1850],scale: 2.6, speed: 1.3 },
  ], []);

  // Climate colors for clouds based on time/progress
  const cloudMorning = useMemo(() => new THREE.Color('#fff7ed'), []); // Soft warm cream
  const cloudMidday  = useMemo(() => new THREE.Color('#ffffff'), []); // Pure bright white
  const cloudSunset  = useMemo(() => new THREE.Color('#fba518'), []); // Flaming golden amber
  const cloudNight   = useMemo(() => new THREE.Color('#1e293b'), []); // Midnight slate

  const targetColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = isSailing ? Math.max(0, Math.min(1, progress)) : 0;

    if (!isSailing) {
      targetColor.copy(cloudMorning);
    } else if (p < 0.3) {
      const t = p / 0.3;
      targetColor.copy(cloudMorning).lerp(cloudMidday, t);
    } else if (p < 0.7) {
      const t = (p - 0.3) / 0.4;
      targetColor.copy(cloudMidday).lerp(cloudSunset, t);
    } else {
      const t = (p - 0.7) / 0.3;
      targetColor.copy(cloudSunset).lerp(cloudNight, t);
    }

    matRefs.current.forEach((mat) => {
      if (mat) {
        mat.color.lerp(targetColor, 0.05);
      }
    });
  });

  return (
    <group>
      {cloudData.map((c, idx) => (
        <SingleCloud
          key={idx}
          position={c.pos}
          scale={c.scale}
          speed={c.speed}
          colorRef={(el) => { matRefs.current[idx] = el; }}
        />
      ))}
    </group>
  );
}
