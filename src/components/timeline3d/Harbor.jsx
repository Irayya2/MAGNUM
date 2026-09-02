import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { harborBoatPositions } from './DayPath';
import { MAGNUM_EVENTS } from '../../data/timelineEvents';
import { WoodenEventSign } from './WoodenEventSign';

/* ─── One docked boat that bobs gently ──────────────────────────────────── */
function DockedBoat({ boatPosition, dayIndex, hide, onSelect }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/Ship.glb');

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        boatPosition[1] + 0.28 * Math.sin(clock.elapsedTime * 1.3 + dayIndex * 1.7);
    }
  });

  if (hide) return null;

  return (
    <group
      ref={groupRef}
      position={boatPosition}
      rotation={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(dayIndex);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={scene.clone()} scale={[20, 20, 20]} />
    </group>
  );
}

/* ─── Wooden dock platform + 90-Degree Rotated Event Names on White Carpet Mat ─ */
function DockPlatform({ onSelect }) {
  const boatXPositions = harborBoatPositions.map(pos => pos[0]);

  return (
    <group>
      {/* Sandy beach floor behind the boats */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -280]}>
        <planeGeometry args={[1100, 400]} />
        <meshStandardMaterial color="#c4a97b" roughness={1} metalness={0} />
      </mesh>

      {/* Low cliff / seawall backing */}
      <mesh position={[0, 10, -420]}>
        <boxGeometry args={[1100, 25, 20]} />
        <meshStandardMaterial color="#8d7355" roughness={0.9} />
      </mesh>

      {/* Dock walkway per boat lane */}
      {boatXPositions.map((x, i) => (
        <group key={`dock-lane-${i}`}>
          {/* White / Cream Carpet Mat */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.1, -120]}>
            <planeGeometry args={[36, 120]} />
            <meshStandardMaterial color="#e2cfb4" roughness={0.8} />
          </mesh>

          {/* Event Name written directly ON the white carpet mat, rotated 90 degrees along the walkway */}
          {MAGNUM_EVENTS[i] && (
            <WoodenEventSign
              title={MAGNUM_EVENTS[i].title}
              position={[x, 0.28, -120]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
              width={75}
              height={20}
              onClick={() => onSelect?.(i)}
            />
          )}
        </group>
      ))}

      {/* Horizontal dock ties */}
      {[-1, 0, 1].map((row) =>
        boatXPositions.map((x, i) => (
          <mesh key={`${row}-${i}`} position={[x, 0.5, -80 + row * 30]}>
            <boxGeometry args={[38, 2, 3]} />
            <meshStandardMaterial color="#5c3f1e" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Mooring bollards */}
      {boatXPositions.map((x, i) => (
        <mesh key={`bollard-${i}`} position={[x + 18, 2, -90]}>
          <cylinderGeometry args={[2, 2.5, 5, 8]} />
          <meshStandardMaterial color="#333" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Exported Harbor: 10 docked boats + platform + Event signboards ────────── */
export function Harbor({ selectedDay, onSelect }) {
  return (
    <group>
      <DockPlatform onSelect={onSelect} />
      {harborBoatPositions.map((pos, i) => (
        <DockedBoat
          key={i}
          boatPosition={pos}
          dayIndex={i}
          hide={selectedDay === i}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/models/Ship.glb');
