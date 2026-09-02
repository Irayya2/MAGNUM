import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { getDayShipCurve, getDayIslandPositions, harborBoatPositions } from './DayPath';

/* ─────────────────────────────────────────────────────────────────────────── *
 * ActiveShip — the one ship that is currently sailing for a selected day.     *
 * Derived from Ship.jsx but uses per-day CatmullRom path & island positions.  *
 * ─────────────────────────────────────────────────────────────────────────── */
export function ActiveShip({ day, onDock, isMobile = false }) {
  const shipRef  = useRef(null);
  const { camera } = useThree();
  const { scene: rawScene } = useGLTF('/models/Ship.glb');

  // Clone so it is independent from the Harbor's instances
  const shipScene = useMemo(() => rawScene.clone(true), [rawScene]);

  const islandPositions = useMemo(() => getDayIslandPositions(day), [day]);
  const shipPath        = useMemo(() => getDayShipCurve(day),        [day]);

  const L           = islandPositions.length;
  const maxDistance = 400 * (L + 1);

  // --- Progress refs (abstract units → 0-1) ---
  const hCurrent = useRef(0);
  const uCurrent = useRef(0);
  const lCurrent = useRef(0);

  // --- Camera helpers ---
  const fMultiplier        = useRef(isMobile ? 0.2 : 0.3);
  const pMultiplier        = useRef(1);
  const cameraTarget       = useRef(new THREE.Vector3());
  const cameraDockedLerp   = useRef(0);
  const wasDockedState     = useRef(false);

  // --- Docking state ---
  const [dockedIndex, setDockedIndex] = useState(null);
  const dockingTimer      = useRef(0);
  const prevDockedIndex   = useRef(null);

  // --- Direction state ---
  const [isReversed, setIsReversed]       = useState(false);
  const [isChangingDir, setIsChangingDir] = useState(false);
  const dirChangeTimer    = useRef(1);
  const scrollAccumulator = useRef(0);

  // Set initial ship orientation from path tangent
  useEffect(() => {
    const tangent = shipPath.getTangentAt(0);
    shipScene.rotation.y = Math.atan2(tangent.x, tangent.z) - Math.PI / 2;
  }, [shipPath, shipScene]);

  // Reset progress when day changes
  useEffect(() => {
    hCurrent.current      = 0;
    uCurrent.current      = 0;
    lCurrent.current      = 0;
    prevDockedIndex.current = null;
    setDockedIndex(null);
    setIsReversed(false);
    setIsChangingDir(false);
    dirChangeTimer.current    = 1;
    scrollAccumulator.current = 0;
  }, [day]);

  // ─── Input listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.preventDefault) e.preventDefault();
      const isSmall = Math.abs(e.deltaY) < 50;
      const delta   = e.deltaY * (isSmall ? 0.005 : 0.15);
      if (Math.abs(delta) < 0.5) return;

      scrollAccumulator.current += Math.abs(delta);
      const movingBackward = delta < 0;

      if (
        movingBackward !== isReversed &&
        dirChangeTimer.current >= 1 &&
        scrollAccumulator.current >= 50
      ) {
        setIsReversed(movingBackward);
        setIsChangingDir(true);
        dirChangeTimer.current    = 0;
        scrollAccumulator.current = 0;
        return;
      }

      if (dockedIndex !== null) {
        if (
          (dockedIndex === L - 1 && delta > 0) ||
          (dockingTimer.current += Math.abs(delta)) < 40
        ) return;
        prevDockedIndex.current = dockedIndex;
        setDockedIndex(null);
        dockingTimer.current = 0;
      }

      hCurrent.current = Math.max(0, hCurrent.current + delta);
      uCurrent.current = Math.min(1, Math.max(0, hCurrent.current / maxDistance));
    };

    const handleKeyDown = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const delta = e.key === 'ArrowUp' ? 10 : -10;
      scrollAccumulator.current += Math.abs(delta);

      const movingBackward = delta < 0;
      if (
        movingBackward !== isReversed &&
        dirChangeTimer.current >= 1 &&
        scrollAccumulator.current >= 50
      ) {
        setIsReversed(movingBackward);
        setIsChangingDir(true);
        dirChangeTimer.current    = 0;
        scrollAccumulator.current = 0;
        return;
      }

      if (dockedIndex !== null) {
        if (
          (dockedIndex === L - 1 && delta > 0) ||
          (dockingTimer.current += Math.abs(delta)) < 40
        ) return;
        prevDockedIndex.current = dockedIndex;
        setDockedIndex(null);
        dockingTimer.current = 0;
      }

      hCurrent.current = Math.max(0, hCurrent.current + delta);
      uCurrent.current = Math.min(1, Math.max(0, hCurrent.current / maxDistance));
    };

    window.addEventListener('wheel',   handleWheel,   { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('wheel',   handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [L, maxDistance, dockedIndex, isReversed]);

  // ─── Frame loop ──────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Smooth progress
    if (isChangingDir) {
      dirChangeTimer.current = Math.min(1, dirChangeTimer.current + 1.2 * delta);
      if (dirChangeTimer.current >= 1) setIsChangingDir(false);
    } else {
      lCurrent.current += (uCurrent.current - lCurrent.current) * 0.03;
    }

    const progress = Math.max(0, Math.min(1, lCurrent.current));
    const position = shipPath.getPointAt(progress);
    const tangent  = shipPath.getTangentAt(progress);

    // ── Ship transform ──
    if (shipRef.current) {
      shipRef.current.position.set(
        position.x,
        position.y + 3 + 0.4 * Math.sin(1.5 * time),
        position.z
      );

      const targetYaw = Math.atan2(tangent.x, tangent.z) - Math.PI / 2;
      let yawDiff = (isReversed ? targetYaw + Math.PI : targetYaw) - shipRef.current.rotation.y;
      if (yawDiff >  Math.PI) yawDiff -= 2 * Math.PI;
      if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI;
      shipRef.current.rotation.y += yawDiff * (isChangingDir ? 0.2 : 0.15);
      shipRef.current.rotation.z  = 0.03 * Math.sin(0.8 * time);
    }

    // ── Docking detection ──
    if (dockedIndex === null) {
      for (let i = 0; i < islandPositions.length; i++) {
        if (i === prevDockedIndex.current) continue;
        const [px, , pz] = islandPositions[i];
        const dist = Math.sqrt((position.x - px) ** 2 + (position.z - pz) ** 2);

        if (i === islandPositions.length - 1) {
          if (lCurrent.current >= 0.995) {
            setDockedIndex(i);
            uCurrent.current = 1;
            hCurrent.current = maxDistance;
            dockingTimer.current = 0;
            onDock?.(i);
            break;
          }
          continue;
        }

        if (dist < 40) {
          setDockedIndex(i);
          uCurrent.current = lCurrent.current;
          hCurrent.current = lCurrent.current * maxDistance;
          dockingTimer.current = 0;
          onDock?.(i);
          break;
        }
      }

      if (prevDockedIndex.current !== null) {
        const [px, , pz] = islandPositions[prevDockedIndex.current] ?? [];
        if (px !== undefined) {
          const leaveDist = prevDockedIndex.current === L - 1 ? 150 : 60;
          if (Math.sqrt((position.x - px) ** 2 + (position.z - pz) ** 2) > leaveDist) {
            prevDockedIndex.current = null;
          }
        }
      }
    } else {
      const [dx, , dz] = islandPositions[dockedIndex];
      const leaveDist  = dockedIndex === L - 1 ? 150 : 50;
      if (Math.sqrt((position.x - dx) ** 2 + (position.z - dz) ** 2) > leaveDist) {
        prevDockedIndex.current = dockedIndex;
        setDockedIndex(null);
        onDock?.(null);
      }
    }

    // ── Camera ──
    let minIslandDist = Infinity;
    for (const [px, , pz] of islandPositions) {
      const d = Math.sqrt((position.x - px) ** 2 + (position.z - pz) ** 2);
      if (d < minIslandDist) minIslandDist = d;
    }
    const scaleFactor =
      minIslandDist < 40  ? 0.65 :
      minIslandDist < 70  ? 0.75 :
      minIslandDist < 100 ? 0.90 : 1.1;
    pMultiplier.current += (scaleFactor - pMultiplier.current) * 0.05;

    const combinedF = fMultiplier.current * pMultiplier.current;
    const P = (isMobile ? 70 : 65) * combinedF;

    const isDockedValid = dockedIndex !== null && dockedIndex < L;
    if (isDockedValid !== wasDockedState.current) {
      wasDockedState.current = isDockedValid;
      gsap.to(cameraDockedLerp, {
        current: isDockedValid ? 1 : 0,
        duration: 0.8,
        ease: isDockedValid ? 'power2.out' : 'power2.inOut',
        overwrite: true,
      });
    }

    const direction = isReversed ? 1 : -1;
    const offsetF   = isMobile ? 20 : 30;

    let targetCamX = position.x + tangent.x * offsetF * direction;
    let targetCamY = (isMobile ? 30 : 45) * combinedF;
    let targetCamZ = position.z + P;
    let targetLookX = position.x;
    let targetLookY = 5;
    let targetLookZ = position.z;

    if (isDockedValid) {
      const [dx, dy, dz] = islandPositions[dockedIndex];
      const lerpAmt = cameraDockedLerp.current;
      targetCamX  += (dx - 40 - targetCamX)  * lerpAmt;
      targetCamY  += (45  - targetCamY)       * lerpAmt;
      targetCamZ  += (dz + 40 - targetCamZ)   * lerpAmt;
      targetLookX += (dx - targetLookX)       * lerpAmt;
      targetLookY += (dy - targetLookY)       * lerpAmt;
      targetLookZ += (dz - targetLookZ)       * lerpAmt;
    }

    const dur = isMobile ? 0.4 : 0.6;
    gsap.to(camera.position, { x: targetCamX, y: targetCamY, z: targetCamZ, duration: dur, ease: 'power1.out', overwrite: true });
    gsap.to(cameraTarget.current, {
      x: targetLookX, y: targetLookY, z: targetLookZ,
      duration: dur, ease: 'power1.out', overwrite: true,
      onUpdate: () => camera.lookAt(cameraTarget.current),
    });
  });

  const startPos = harborBoatPositions[day - 1];

  return (
    <group ref={shipRef} position={[startPos[0], startPos[1] + 3, startPos[2]]}>
      <primitive object={shipScene} scale={[20, 20, 20]} />
    </group>
  );
}
