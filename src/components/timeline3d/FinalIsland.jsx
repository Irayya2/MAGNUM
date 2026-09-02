import React from 'react';
import { useGLTF } from '@react-three/drei';

export function FinalIsland({ position, event, onSelect }) {
  const { scene } = useGLTF('/models/Island-Final.glb');

  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={[90, 90, 90]} />
      {/* Event component could be rendered here in the future */}
    </group>
  );
}

useGLTF.preload('/models/Island-Final.glb');
