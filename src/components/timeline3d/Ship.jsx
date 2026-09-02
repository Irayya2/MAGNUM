import React, { useRef, useState, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { islandPositions, getShipCurve } from './TimelinePath';

/* ─────────────────────────────────────────────────────────────────────────── *
 * BOAT COORDINATE SYSTEM                                                       *
 *   Ship.glb bow = LOCAL +Z (rotation=0 in harbour faces open ocean = +Z)    *
 * ─────────────────────────────────────────────────────────────────────────── */
const BOAT_FORWARD_AXIS = new THREE.Vector3(0, 0, 1);

/* Ship.glb bow is along local +X — correct with -PI/2 rotation on the primitive */
const GLB_BOW_CORRECTION = -Math.PI / 2;

/* ─── Camera tuning constants ─────────────────────────────────────────────── */
const CAMERA_HEIGHT     = 38;
const CAMERA_BACK       = 120;
const LOOK_AHEAD        = 60;
const CAMERA_MIN_Y      = 12;
const ROT_SPEED         = 2.4;
const CAM_LERP          = 0.08;

/* ─── Reusable temporaries ────────────────────────────────────────────────── */
const _boatQuat    = new THREE.Quaternion();
const _targetQuat  = new THREE.Quaternion();
const _upAxis      = new THREE.Vector3(0, 1, 0);
const _localOffset = new THREE.Vector3();
const _boatFwd     = new THREE.Vector3();
const _targetCam   = new THREE.Vector3();
const _lookTarget  = new THREE.Vector3();

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
  
  const camPos          = useRef(new THREE.Vector3());
  const camLookRef      = useRef(new THREE.Vector3());
  const cameraDockedLerp = useRef(0);
  const wasDockedState = useRef(false);

  useEffect(() => {
    // Initial orientation — bow (+Z) aligned with path start tangent
    if (!shipRef.current) return;
    const tangent   = shipPath.getTangentAt(0);
    const facingYaw = Math.atan2(tangent.x, tangent.z);
    shipRef.current.rotation.set(0, facingYaw, 0);
    // Note: do NOT reset shipScene.rotation — the <primitive> rotation prop
    // applies GLB_BOW_CORRECTION and must not be overridden after render.
  }, [shipPath, shipScene]);

  // Input listeners
  useEffect(() => {
    let lastTouchY = 0;

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
    
    // ── 1. Smooth progress ──
    if (isChangingDir) {
      dirChangeTimer.current = Math.min(1, dirChangeTimer.current + 1.2 * delta);
      if (dirChangeTimer.current >= 1) setIsChangingDir(false);
    } else {
      lCurrent.current += (uCurrent.current - lCurrent.current) * 0.03;
    }
    
    const progress = Math.max(0, Math.min(1, lCurrent.current));
    const position = shipPath.getPointAt(progress);
    const tangent = shipPath.getTangentAt(progress);
    
    // ── 2. Ship orientation — quaternion slerp ──
    if (shipRef.current) {
      // Yaw to align local +Z bow with path tangent
      const rawYaw    = Math.atan2(tangent.x, tangent.z);
      const facingYaw = isReversed ? rawYaw + Math.PI : rawYaw;

      _targetQuat.setFromAxisAngle(_upAxis, facingYaw);
      const rotSpeed = isChangingDir ? ROT_SPEED * 1.4 : ROT_SPEED;
      shipRef.current.quaternion.rotateTowards(_targetQuat, rotSpeed * delta);

      // Positional bobbing
      shipRef.current.position.set(position.x, position.y + 3 + 0.4 * Math.sin(1.5 * time), position.z);

      // Subtle roll
      shipRef.current.rotation.z = 0.02 * Math.sin(0.8 * time);
      shipRef.current.rotation.x = 0;
    }
    
    // ── 3. Docking logic ──
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
    
    // ── 4. Camera — RIDER PERSPECTIVE ──
    //    Camera tracks movement direction (tangent), not boat facing,
    //    so it never jumps through the hull when reversing.
    if (!shipRef.current) return;

    let minIslandDist = Infinity;
    for (const pos of islandPositions) {
      const d = Math.sqrt((position.x - pos[0])**2 + (position.z - pos[2])**2);
      if (d < minIslandDist) minIslandDist = d;
    }
    const scaleFactor = minIslandDist < 40 ? 0.65 : minIslandDist < 70 ? 0.75 : minIslandDist < 100 ? 0.9 : 1.0;
    pMultiplier.current += (scaleFactor - pMultiplier.current) * 0.05;
    const combinedF = fMultiplier.current * pMultiplier.current;

    const backDist = (isMobile ? 45 : CAMERA_BACK) * combinedF;
    const heightV  = (isMobile ? 16 : CAMERA_HEIGHT) * combinedF;

    // Camera sits behind direction of movement
    const movSign = isReversed ? 1 : -1;
    _targetCam.set(
      position.x + tangent.x * backDist * movSign,
      Math.max(CAMERA_MIN_Y, position.y + heightV),
      position.z + tangent.z * backDist * movSign
    );

    // Look-ahead in movement direction
    const lookSign = isReversed ? -1 : 1;
    _lookTarget.set(
      position.x + tangent.x * LOOK_AHEAD * lookSign,
      3,
      position.z + tangent.z * LOOK_AHEAD * lookSign
    );

    // Docked override
    const isDockedValid = dockedIndex !== null && dockedIndex < islandPositions.length;
    if (isDockedValid !== wasDockedState.current) {
      wasDockedState.current = isDockedValid;
      gsap.to(cameraDockedLerp, {
        current: isDockedValid ? 1 : 0,
        duration: 1.0,
        ease: isDockedValid ? "power2.out" : "power2.inOut",
        overwrite: true
      });
    }
    
    if (isDockedValid) {
      const dPos = islandPositions[dockedIndex];
      const t = cameraDockedLerp.current;
      _targetCam.x  += (dPos[0] - 50 - _targetCam.x)  * t;
      _targetCam.y  += (55 - _targetCam.y)             * t;
      _targetCam.z  += (dPos[2] + 50 - _targetCam.z)   * t;
      _lookTarget.x += (dPos[0] - _lookTarget.x)       * t;
      _lookTarget.y += (dPos[1] - _lookTarget.y)       * t;
      _lookTarget.z += (dPos[2] - _lookTarget.z)       * t;
    }

    // Smooth follow
    camPos.current.lerp(_targetCam, CAM_LERP);
    camLookRef.current.lerp(_lookTarget, CAM_LERP * 1.2);
    camera.position.copy(camPos.current);
    camera.lookAt(camLookRef.current);
  });

  return (
    <group ref={shipRef} position={[0, 150, 0]}>
      <primitive object={shipScene} scale={[20, 20, 20]} rotation={[0, GLB_BOW_CORRECTION, 0]} />
    </group>
  );
});

useGLTF.preload('/models/Ship.glb');
