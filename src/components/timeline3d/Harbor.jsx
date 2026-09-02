import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { harborBoatPositions } from './DayPath';

/* ─── One docked boat that bobs gently ──────────────────────────────────── */
function DockedBoat({ boatPosition, dayIndex, hide }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/Ship.glb');

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle bob — each boat offset by dayIndex so they don't sync
      groupRef.current.position.y =
        boatPosition[1] + 0.28 * Math.sin(clock.elapsedTime * 1.3 + dayIndex * 2.1);
    }
  });

  if (hide) return null;

  return (
    // Boats face toward +Z (open ocean)
    <group ref={groupRef} position={boatPosition} rotation={[0, 0, 0]}>
      <primitive object={scene.clone()} scale={[20, 20, 20]} />
    </group>
  );
}

/* ─── Wooden dock planks ─────────────────────────────────────────────────── */
function DockPlatform() {
  return (
    <group>
      {/* Sandy beach floor behind the boats */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -280]}>
        <planeGeometry args={[800, 400]} />
        <meshStandardMaterial color="#c4a97b" roughness={1} metalness={0} />
      </mesh>

      {/* Low cliff / seawall backing */}
      <mesh position={[0, 10, -420]}>
        <boxGeometry args={[800, 25, 20]} />
        <meshStandardMaterial color="#8d7355" roughness={0.9} />
      </mesh>

      {/* Dock walkway per boat lane */}
      {[-100, 0, 100].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.1, -120]}>
          <planeGeometry args={[28, 120]} />
          <meshStandardMaterial color="#7a5c2e" roughness={0.85} />
        </mesh>
      ))}

      {/* Horizontal dock ties */}
      {[-1, 0, 1].map((row) =>
        [-100, 0, 100].map((x, i) => (
          <mesh key={`${row}-${i}`} position={[x, 0.5, -80 + row * 30]}>
            <boxGeometry args={[30, 2, 3]} />
            <meshStandardMaterial color="#5c3f1e" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Mooring bollards */}
      {[-100, 0, 100].map((x, i) => (
        <mesh key={i} position={[x + 18, 2, -90]}>
          <cylinderGeometry args={[2, 2.5, 5, 8]} />
          <meshStandardMaterial color="#333" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Exported Harbor: 3 docked boats + platform ────────────────────────── */
export function Harbor({ selectedDay }) {
  return (
    <group>
      <DockPlatform />
      {[1, 2, 3].map((day, i) => (
        <DockedBoat
          key={day}
          boatPosition={harborBoatPositions[i]}
          dayIndex={i}
          hide={selectedDay === day}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/models/Ship.glb');
