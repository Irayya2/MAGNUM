import React, { memo } from 'react';
import * as THREE from 'three';
import { islandPositions } from './TimelinePath';

export const DockingMarker = memo(function DockingMarker({ activeIsland }) {
  return (
    <>
      {islandPositions.map((pos, index) => {
        const isActive = index === activeIsland;
        return (
          <group key={`dock-${pos[0]}-${pos[2]}`} position={[pos[0], 1.5, pos[2] + 25]}>
            {/* Inner Sphere */}
            <mesh>
              <sphereGeometry args={[isActive ? 3 : 2, 12, 12]} />
              <meshStandardMaterial
                color={isActive ? "#ffdd44" : "#66ccff"}
                emissive={isActive ? "#ffaa00" : "#44aaff"}
                emissiveIntensity={isActive ? 2.5 : 1.2}
                transparent={true}
                opacity={isActive ? 1 : 0.7}
              />
            </mesh>
            
            {/* Outer Ring */}
            <mesh rotation-x={-Math.PI / 2}>
              <ringGeometry args={[isActive ? 3.5 : 2.5, isActive ? 5.5 : 4, 24]} />
              <meshBasicMaterial
                color={isActive ? "#ffaa00" : "#44aaff"}
                transparent={true}
                opacity={isActive ? 0.5 : 0.25}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
});
