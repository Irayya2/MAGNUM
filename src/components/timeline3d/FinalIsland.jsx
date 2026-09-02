import React from 'react';
import { useGLTF } from '@react-three/drei';
import { WoodenEventSign } from './WoodenEventSign';

export function FinalIsland({ position, event, onSelect }) {
  const { scene } = useGLTF('/models/Island-Final.glb');

  return (
    <group position={position}>
      {/* 3D Final Island Terrain */}
      <primitive object={scene.clone()} scale={[90, 90, 90]} />

      {/* Weathered Burnt Wooden Signboard at Auditorium Final Destination */}
      <WoodenEventSign
        title={event?.title || "FINAL DESTINATION"}
        position={[0, 22, 60]}
        rotation={[0, 0, 0]}
        scale={[1.1, 1.1, 1.1]}
        onClick={onSelect}
      />
    </group>
  );
}

useGLTF.preload('/models/Island-Final.glb');
