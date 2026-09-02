import React from 'react';
import { useGLTF } from '@react-three/drei';
import { WoodenEventSign } from './WoodenEventSign';

export function Island({ position, event, onSelect }) {
  const { scene } = useGLTF('/models/island.glb');

  return (
    <group position={position}>
      {/* 3D Island Terrain */}
      <primitive object={scene.clone()} scale={[40, 40, 40]} />

      {/* Weathered Burnt Wooden Event Signboard standing on the island shore */}
      {event?.title && (
        <WoodenEventSign
          title={event.title}
          position={[25, 8, 25]}
          rotation={[0, -Math.PI / 4, 0]}
          scale={[0.85, 0.85, 0.85]}
          onClick={onSelect}
        />
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/island.glb');
