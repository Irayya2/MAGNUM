import React, { useRef, useState, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { islandPositions, getShipCurve } from './TimelinePath';

export const Ship = forwardRef(({ onProgress, onDock, isMobile = false }, ref) => {
  const shipRef = useRef(null);
  const { camera } = useThree();
  const { scene: shipScene } = useGLTF('/models/Ship.glb');

  // Core progression state
  const L = islandPositions.length;
  const maxDistanceC = 400 * (L + 1);
  
  const hCurrent = useRef(0); // abstract progress
  const uCurrent = useRef(0); // target normalized progress 0 to 1
  const lCurrent = useRef(0); // smoothed normalized progress 0 to 1
  
  const shipPath = useMemo(() => getShipCurve(), []);

  // Controls state
  const fMultiplier = useRef(isMobile ? 0.2 : 0.3);
  const pMultiplier = useRef(1);
  
  const [dockedIndex, setDockedIndex] = useState(null);
  const dockingTimer = useRef(0);
  const prevDockedIndex = useRef(null);
  
  const [isReversed, setIsReversed] = useState(false);
  const [isChangingDir, setIsChangingDir] = useState(false);
  const dirChangeTimer = useRef(1);
  const scrollAccumulator = useRef(0);
  
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraDockedLerp = useRef(0);
  const wasDockedState = useRef(false);

  useEffect(() => {
    // Initial ship orientation
    const tangent = shipPath.getTangentAt(0);
    shipScene.rotation.y = Math.atan2(tangent.x, tangent.z) - Math.PI / 2;
  }, [shipPath, shipScene]);

  // Input listeners
  useEffect(() => {
    let lastTouchY = 0;
    let lastTouchDist = 0;

    const getTouchDist = (touches) => {
      if (touches.length < 2) return 0;
      return Math.sqrt((touches[1].clientX - touches[0].clientX)**2 + (touches[1].clientY - touches[0].clientY)**2);
    };

    const handleWheel = (e) => {
      if (e.preventDefault) e.preventDefault();
      
      const isSmall = Math.abs(e.deltaY) < 50;
      const delta = e.deltaY * (isSmall ? 0.005 : 0.15);
      
      if (Math.abs(delta) < 0.5) return;
      
      scrollAccumulator.current += Math.abs(delta);
      const movingBackward = delta < 0;
      
      if (movingBackward !== isReversed && dirChangeTimer.current >= 1 && scrollAccumulator.current >= 50) {
        setIsReversed(movingBackward);
        setIsChangingDir(true);
        dirChangeTimer.current = 0;
        scrollAccumulator.current = 0;
        return;
      }
      
      if (dockedIndex !== null) {
        if ((dockedIndex === L - 1 && delta > 0) || (dockingTimer.current += Math.abs(delta)) < 40) {
          return;
        }
        prevDockedIndex.current = dockedIndex;
        setDockedIndex(null);
        dockingTimer.current = 0;
      }
      
      hCurrent.current = Math.max(0, hCurrent.current + delta);
      uCurrent.current = Math.min(1, Math.max(0, hCurrent.current / maxDistanceC));
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowUp" ? 10 : -10;
        scrollAccumulator.current += Math.abs(delta);
        
        const movingBackward = delta < 0;
        if (movingBackward !== isReversed && dirChangeTimer.current >= 1 && scrollAccumulator.current >= 50) {
          setIsReversed(movingBackward);
          setIsChangingDir(true);
          dirChangeTimer.current = 0;
          scrollAccumulator.current = 0;
          return;
        }
        
        if (dockedIndex !== null) {
          if ((dockedIndex === L - 1 && delta > 0) || (dockingTimer.current += Math.abs(delta)) < 40) return;
          prevDockedIndex.current = dockedIndex;
          setDockedIndex(null);
          dockingTimer.current = 0;
        }
        
        hCurrent.current = Math.max(0, hCurrent.current + delta);
        uCurrent.current = Math.min(1, Math.max(0, hCurrent.current / maxDistanceC));
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [L, maxDistanceC, dockedIndex, isReversed]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (onProgress) onProgress();
    
    if (isChangingDir) {
      dirChangeTimer.current = Math.min(1, dirChangeTimer.current + 1.2 * delta);
      if (dirChangeTimer.current >= 1) setIsChangingDir(false);
    } else {
      lCurrent.current += (uCurrent.current - lCurrent.current) * 0.03;
    }
    
    const progress = Math.max(0, Math.min(1, lCurrent.current));
    const position = shipPath.getPointAt(progress);
    const tangent = shipPath.getTangentAt(progress);
    
    if (shipRef.current) {
      // Bobbing
      shipRef.current.position.set(position.x, position.y + 3 + 0.4 * Math.sin(1.5 * time), position.z);
      
      // Rotation
      const targetYaw = Math.atan2(tangent.x, tangent.z) - Math.PI / 2;
      let yawDiff = (isReversed ? targetYaw + Math.PI : targetYaw) - shipRef.current.rotation.y;
      
      if (yawDiff > Math.PI) yawDiff -= 2 * Math.PI;
      if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI;
      
      shipRef.current.rotation.y += yawDiff * (isChangingDir ? 0.2 : 0.15);
      shipRef.current.rotation.z = 0.03 * Math.sin(0.8 * time); // Roll
    }
    
    // Docking logic
    if (dockedIndex === null) {
      for (let i = 0; i < islandPositions.length; i++) {
        if (i === prevDockedIndex.current) continue;
        const pos = islandPositions[i];
        const dist = Math.sqrt((position.x - pos[0])**2 + (position.z - pos[2])**2);
        
        if (i === islandPositions.length - 1) {
          if (lCurrent.current >= 0.995) {
            setDockedIndex(i);
            uCurrent.current = 1;
            hCurrent.current = maxDistanceC;
            dockingTimer.current = 0;
            if (onDock) onDock(i);
            break;
          }
          continue;
        }
        
        if (dist < 35) {
          setDockedIndex(i);
          uCurrent.current = lCurrent.current;
          hCurrent.current = lCurrent.current * maxDistanceC;
          dockingTimer.current = 0;
          if (onDock) onDock(i);
          break;
        }
      }
      
      if (prevDockedIndex.current !== null) {
        if (prevDockedIndex.current === islandPositions.length - 1) {
          if (lCurrent.current < 0.99) prevDockedIndex.current = null;
        } else {
          const pPos = islandPositions[prevDockedIndex.current];
          if (Math.sqrt((position.x - pPos[0])**2 + (position.z - pPos[2])**2) > 60) {
            prevDockedIndex.current = null;
          }
        }
      }
    } else {
      const dPos = islandPositions[dockedIndex];
      const leaveDist = dockedIndex === islandPositions.length - 1 ? 150 : 40;
      if (Math.sqrt((position.x - dPos[0])**2 + (position.z - dPos[2])**2) > leaveDist) {
        setDockedIndex(null);
        if (onDock) onDock(null);
      }
    }
    
    // Camera logic
    let minIslandDist = Infinity;
    for (const pos of islandPositions) {
      const d = Math.sqrt((position.x - pos[0])**2 + (position.z - pos[2])**2);
      if (d < minIslandDist) minIslandDist = d;
    }
    
    const scaleFactor = minIslandDist < 40 ? 0.65 : minIslandDist < 70 ? 0.75 : minIslandDist < 100 ? 0.9 : 1.1;
    pMultiplier.current += (scaleFactor - pMultiplier.current) * 0.05;
    
    const combinedF = fMultiplier.current * pMultiplier.current;
    const P = (isMobile ? 70 : 65) * combinedF;
    
    const isDockedValid = dockedIndex !== null && dockedIndex < islandPositions.length;
    if (isDockedValid !== wasDockedState.current) {
      wasDockedState.current = isDockedValid;
      gsap.to(cameraDockedLerp, {
        current: isDockedValid ? 1 : 0,
        duration: 0.8,
        ease: isDockedValid ? "power2.out" : "power2.inOut",
        overwrite: true
      });
    }
    
    const direction = isReversed ? 1 : -1;
    const offsetF = isMobile ? 20 : 30;
    const lookOffsetX = isMobile ? (isReversed ? -15 : 15) : 0;
    
    let targetCamX = position.x + tangent.x * offsetF * direction;
    let targetCamY = (isMobile ? 30 : 45) * combinedF;
    let targetCamZ = position.z + P;
    
    let targetLookX = position.x + lookOffsetX;
    let targetLookY = 5;
    let targetLookZ = position.z;
    
    if (isDockedValid) {
      const dPos = islandPositions[dockedIndex];
      const lerpAmt = cameraDockedLerp.current;
      targetCamX += (dPos[0] - 40 - targetCamX) * lerpAmt;
      targetCamY += (45 - targetCamY) * lerpAmt;
      targetCamZ += (dPos[2] + 40 - targetCamZ) * lerpAmt;
      
      targetLookX += (dPos[0] - targetLookX) * lerpAmt;
      targetLookY += (dPos[1] - targetLookY) * lerpAmt;
      targetLookZ += (dPos[2] - targetLookZ) * lerpAmt;
    }
    
    const camDuration = isMobile ? 0.4 : 0.6;
    
    gsap.to(camera.position, {
      x: targetCamX,
      y: targetCamY,
      z: targetCamZ,
      duration: camDuration,
      ease: "power1.out",
      overwrite: true
    });
    
    gsap.to(cameraTarget.current, {
      x: targetLookX,
      y: targetLookY,
      z: targetLookZ,
      duration: camDuration,
      ease: "power1.out",
      overwrite: true,
      onUpdate: () => {
        camera.lookAt(cameraTarget.current);
      }
    });
  });

  return (
    <group ref={shipRef} position={[0, 150, 0]}>
      <primitive object={shipScene} scale={[20, 20, 20]} rotation={[0, 0, 0]} />
    </group>
  );
});

useGLTF.preload('/models/Ship.glb');
