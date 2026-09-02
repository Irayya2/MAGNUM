import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { getDayShipCurve, getDayIslandPositions, harborBoatPositions } from './DayPath';

/* ─────────────────────────────────────────────────────────────────────────── *
 * BOAT COORDINATE SYSTEM                                                       *
 *   The Ship.glb has its visual bow pointing along LOCAL +Z when rotation=0.  *
 *   Harbor docked boats confirm this: rotation={[0,0,0]} + comment "+Z ocean" *
 *   All rotation math uses this axis as the canonical forward direction.       *
 * ─────────────────────────────────────────────────────────────────────────── */
const BOAT_FORWARD_AXIS = new THREE.Vector3(0, 0, 1); // canonical forward for group

/* Ship.glb bow is aligned with +Z. No correction needed so 0° = destination (+Z), 180° = port (-Z). */
const GLB_BOW_CORRECTION = 0;

/* ─── Camera tuning constants ─────────────────────────────────────────────── */
const CAMERA_HEIGHT     = 38;   // world units above the boat pivot
const CAMERA_BACK       = 120;  // world units behind the bow (local -Z)
const LOOK_AHEAD        = 60;   // world units in front of bow for look-at target
const CAMERA_MIN_Y      = 12;   // never clip below this world height
const ROT_SPEED         = 2.4;  // max radians/sec for quaternion.rotateTowards
const CAM_LERP          = 0.08; // camera position lerp factor (per frame)

/* ─── Debug: set true to show direction arrows in the scene ───────────────── */
const DEBUG_ARROWS = false;

/* ─── Reusable temporaries (avoid per-frame alloc) ───────────────────────── */
const _boatQuat    = new THREE.Quaternion();
const _targetQuat  = new THREE.Quaternion();
const _upAxis      = new THREE.Vector3(0, 1, 0);
const _localOffset = new THREE.Vector3();
const _boatFwd     = new THREE.Vector3();
const _targetCam   = new THREE.Vector3();
const _lookTarget  = new THREE.Vector3();

/* ─────────────────────────────────────────────────────────────────────────── *
 * ActiveShip — the sailing ship for a selected day.                           *
 * ─────────────────────────────────────────────────────────────────────────── */
export function ActiveShip({ day, onDock, isMobile = false }) {
  const shipRef  = useRef(null);
  const { camera } = useThree();
  const { scene: rawScene } = useGLTF('/models/Ship.glb');

  // Clone so this instance is independent from the Harbor's
  const shipScene = useMemo(() => rawScene.clone(true), [rawScene]);

  const islandPositions = useMemo(() => getDayIslandPositions(day), [day]);
  const shipPath        = useMemo(() => getDayShipCurve(day),        [day]);

  const L           = islandPositions.length;
  const maxDistance = 400 * (L + 1);

  // --- Progress refs (abstract units → 0-1) ---
  const hCurrent = useRef(0);
  const uCurrent = useRef(0);
  const lCurrent = useRef(0);

  // --- Camera smooth-follow refs ---
  const camPos             = useRef(new THREE.Vector3());
  const camLookRef         = useRef(new THREE.Vector3());
  const cameraDockedLerp   = useRef(0);
  const wasDockedState     = useRef(false);
  const fMultiplier        = useRef(isMobile ? 0.2 : 0.3);
  const pMultiplier        = useRef(1);

  // --- Docking state ---
  const [dockedIndex, setDockedIndex] = useState(null);
  const dockingTimer      = useRef(0);
  const prevDockedIndex   = useRef(null);

  // --- Direction state ---
  const [isReversed, setIsReversed]       = useState(false);
  const [isChangingDir, setIsChangingDir] = useState(false);
  const dirChangeTimer    = useRef(1);
  const scrollAccumulator = useRef(0);

  // ─── Set initial orientation once path is ready ─────────────────────────
  useEffect(() => {
    if (!shipRef.current) return;
    const tangent   = shipPath.getTangentAt(0);
    const facingYaw = Math.atan2(tangent.x, tangent.z); // align group +Z bow with tangent
    shipRef.current.rotation.set(0, facingYaw, 0);
    // Note: do NOT reset shipScene.rotation here — the <primitive> rotation prop
    // applies GLB_BOW_CORRECTION and must not be overridden after render.
  }, [shipPath, shipScene]);

  // ─── Reset when day changes ──────────────────────────────────────────────
  useEffect(() => {
    hCurrent.current        = 0;
    uCurrent.current        = 0;
    lCurrent.current        = 0;
    prevDockedIndex.current = null;
    setDockedIndex(null);
    setIsReversed(false);
    setIsChangingDir(false);
    dirChangeTimer.current    = 1;
    scrollAccumulator.current = 0;
  }, [day]);

  // ─── Input listeners ─────────────────────────────────────────────────────
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

    // ── 1. Smooth progress ──
    if (isChangingDir) {
      dirChangeTimer.current = Math.min(1, dirChangeTimer.current + 1.2 * delta);
      if (dirChangeTimer.current >= 1) setIsChangingDir(false);
    } else {
      lCurrent.current += (uCurrent.current - lCurrent.current) * 0.03;
    }

    const progress = Math.max(0, Math.min(1, lCurrent.current));
    const position = shipPath.getPointAt(progress);
    const tangent  = shipPath.getTangentAt(progress);

    // ── 2. Ship orientation — quaternion slerp toward path tangent ──
    if (shipRef.current) {
      // Align bow with direction of travel (facing forward when moving forward, facing port when reversing)
      const rawYaw    = Math.atan2(tangent.x, tangent.z);
      const facingYaw = isReversed ? rawYaw + Math.PI : rawYaw;

      _targetQuat.setFromAxisAngle(_upAxis, facingYaw);

      // Smooth slerp rotation for turn
      const rotSpeed = isChangingDir ? ROT_SPEED * 1.6 : ROT_SPEED;
      shipRef.current.quaternion.rotateTowards(_targetQuat, rotSpeed * delta);

      // Positional bobbing
      shipRef.current.position.set(
        position.x,
        position.y + 3 + 0.4 * Math.sin(1.5 * time),
        position.z
      );

      // Subtle roll — applied as Euler on top of quaternion
      // Extract current rotation, add roll, re-apply
      shipRef.current.rotation.z = 0.02 * Math.sin(0.8 * time);
      shipRef.current.rotation.x = 0;
    }

    // ── 3. Docking detection ──
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

    // ── 4. Camera — RIDER PERSPECTIVE ──
    //    Camera sits behind the DIRECTION OF MOVEMENT, not the boat's facing.
    //    Using the path tangent (movement direction) means the camera never
    //    jumps through the hull when the boat reverses.

    if (!shipRef.current) return;

    // Proximity-to-island scale factor (zoom out near islands)
    let minIslandDist = Infinity;
    for (const [px, , pz] of islandPositions) {
      const d = Math.sqrt((position.x - px) ** 2 + (position.z - pz) ** 2);
      if (d < minIslandDist) minIslandDist = d;
    }
    const scaleFactor =
      minIslandDist < 40  ? 0.65 :
      minIslandDist < 70  ? 0.75 :
      minIslandDist < 100 ? 0.90 : 1.0;
    pMultiplier.current += (scaleFactor - pMultiplier.current) * 0.05;
    const combinedF = fMultiplier.current * pMultiplier.current;

    const backDist = (isMobile ? 45 : CAMERA_BACK) * combinedF;
    const heightV  = (isMobile ? 16 : CAMERA_HEIGHT) * combinedF;

    // Movement direction: tangent when forward, -tangent when reversed.
    // Camera sits BEHIND this direction (opposite to movement → behind the ship).
    const movSign = isReversed ? 1 : -1; // -1 = behind forward movement
    
    let camX = position.x + tangent.x * backDist * movSign;
    let camY = Math.max(CAMERA_MIN_Y, position.y + heightV);
    let camZ = position.z + tangent.z * backDist * movSign;

    // During direction change, swing camera out along a side-arc (perpendicular to path)
    // so the user visually sees the boat's 180° rotation from a side-by-side angle.
    if (dirChangeTimer.current < 1) {
      const arcFactor = Math.sin(dirChangeTimer.current * Math.PI); // 0 -> 1 -> 0 peak mid-turn
      const sideX = -tangent.z; // perpendicular vector
      const sideZ =  tangent.x;
      camX += sideX * backDist * 0.9 * arcFactor;
      camZ += sideZ * backDist * 0.9 * arcFactor;
      camY += 14 * arcFactor; // slightly elevate camera during turn
    }

    _targetCam.set(camX, camY, camZ);

    // Look-ahead: point ahead IN the movement direction
    const lookSign = isReversed ? -1 : 1; // forward = +tangent, reverse = -tangent
    _lookTarget.set(
      position.x + tangent.x * LOOK_AHEAD * lookSign,
      3,
      position.z + tangent.z * LOOK_AHEAD * lookSign
    );

    // Docked override — smoothly pan camera to show the island
    const isDockedValid = dockedIndex !== null && dockedIndex < L;
    if (isDockedValid !== wasDockedState.current) {
      wasDockedState.current = isDockedValid;
      gsap.to(cameraDockedLerp, {
        current: isDockedValid ? 1 : 0,
        duration: 1.0,
        ease: isDockedValid ? 'power2.out' : 'power2.inOut',
        overwrite: true,
      });
    }

    if (isDockedValid) {
      const [dx, dy, dz] = islandPositions[dockedIndex];
      const t = cameraDockedLerp.current;
      // Lerp toward a side view of the island while still maintaining some height
      _targetCam.x  += (dx - 50 - _targetCam.x) * t;
      _targetCam.y  += (55  - _targetCam.y) * t;
      _targetCam.z  += (dz + 50 - _targetCam.z) * t;
      _lookTarget.x += (dx - _lookTarget.x) * t;
      _lookTarget.y += (dy - _lookTarget.y) * t;
      _lookTarget.z += (dz - _lookTarget.z) * t;
    }

    // Smooth camera position using lerp (frame-rate independent feel)
    camPos.current.lerp(_targetCam, CAM_LERP);
    camLookRef.current.lerp(_lookTarget, CAM_LERP * 1.2);

    camera.position.copy(camPos.current);
    camera.lookAt(camLookRef.current);
  });

  // ─── Debug: direction arrows ─────────────────────────────────────────────
  // When DEBUG_ARROWS = true, renders three arrows in the scene:
  //   GREEN  = boat forward (+Z bow direction)
  //   YELLOW = path tangent direction
  //   RED    = camera look-ahead target vector
  const DebugArrows = () => {
    if (!DEBUG_ARROWS || !shipRef.current) return null;
    const pos = shipRef.current.position.clone();
    const q   = shipRef.current.quaternion.clone();

    const fwd  = BOAT_FORWARD_AXIS.clone().applyQuaternion(q);
    const tang = shipPath.getTangentAt(lCurrent.current);

    return (
      <>
        {/* Boat forward — GREEN */}
        <arrowHelper args={[fwd, pos, 60, 0x00ff00, 10, 6]} />
        {/* Path tangent — YELLOW */}
        <arrowHelper args={[tang, pos, 60, 0xffff00, 10, 6]} />
        {/* Look-ahead target — RED (point in front) */}
        <arrowHelper
          args={[
            fwd,
            new THREE.Vector3(pos.x, 3, pos.z),
            LOOK_AHEAD,
            0xff4444, 8, 5
          ]}
        />
      </>
    );
  };

  const startPos = harborBoatPositions[day - 1];

  return (
    <>
      <group ref={shipRef} position={[startPos[0], startPos[1] + 3, startPos[2]]}>
        {/* GLB_BOW_CORRECTION rotates the mesh so its +X bow aligns with group +Z */}
        <primitive object={shipScene} scale={[20, 20, 20]} rotation={[0, GLB_BOW_CORRECTION, 0]} />
      </group>
      {DEBUG_ARROWS && <DebugArrows />}
    </>
  );
}
