import React, { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';

export function Island({ position, event, onSelect }) {
  const { scene } = useGLTF('/models/island.glb');

  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={[40, 40, 40]} />
      {/* Event component could be rendered here in the future */}
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/island.glb');
