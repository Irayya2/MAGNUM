import * as THREE from 'three';
import { timelineEvents } from '../../data/timelineEvents';

// Calculate procedural island positions
export const islandPositions = (function(eventsCount) {
  let seed = 12345;
  const rng = () => {
    seed = (9301 * seed + 49297) % 233280;
    return seed / 233280;
  };
  
  const positions = [];
  for (let i = 0; i < eventsCount; i++) {
    const isLast = i === eventsCount - 1;
    const x = 60 + 180 * i;
    const mod = i % 6;
    let offset = 0;
    
    if (mod === 0 || mod === 1) {
      offset = -60;
    } else {
      offset = 60 * (mod !== 2 && mod !== 3 ? 1 : 0);
    }
    
    const randomDrift = (rng() - 0.5) * 20;
    const y = isLast ? 25 : 10;
    const z = offset + randomDrift;
    
    positions.push([x, y, z]);
  }
  return positions;
})(timelineEvents.length);

// Generate CatmullRomCurve3 for the ship path
export const getShipCurve = () => {
  const points = [];
  const firstPos = islandPositions[0];
  
  // Starting point far behind first island
  points.push(new THREE.Vector3(firstPos[0] - 80, 5, firstPos[2]));
  
  for (let i = 0; i < islandPositions.length; i++) {
    const pos = islandPositions[i];
    const isLast = i === islandPositions.length - 1;
    
    const dockX = isLast ? pos[0] - 60 : pos[0] - 12;
    const dockZ = isLast ? pos[2] + 40 : pos[2] + 25;
    
    points.push(new THREE.Vector3(dockX, 5, dockZ));
    
    if (!isLast) {
      const leaveX = pos[0] + 12;
      const leaveZ = pos[2] + 25;
      points.push(new THREE.Vector3(leaveX, 5, leaveZ));
      
      const nextPos = islandPositions[i + 1];
      const midX = (pos[0] + nextPos[0]) / 2;
      const midZ = (pos[2] + nextPos[2]) / 2 + 25;
      points.push(new THREE.Vector3(midX, 5, midZ));
    }
  }
  
  return new THREE.CatmullRomCurve3(points, false, "centripetal", 0.5);
};
