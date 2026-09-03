import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  getDayShipCurve,
  getDayIslandPositions,
  getDayRouteDebugData,
  harborBoatPositions,
  ISLAND_SAFETY_RADII,
} from './DayPath';
import { BoatWake } from './BoatWake';

/* ─────────────────────────────────────────────────────────────────────────── *
 * BOAT COORDINATE SYSTEM                                                        *
 *   The Ship.glb has its visual bow pointing along LOCAL +X when rotation=0.  *
 *   GLB_BOW_CORRECTION = -π/2 rotates the mesh so that the group's +Z axis   *
 *   becomes the canonical forward / bow direction.                             *
 *   All navigation rotation is applied to the GROUP (shipRef), never to the   *
 *   primitive mesh directly.                                                   *
 * ─────────────────────────────────────────────────────────────────────────── */
const BOAT_FORWARD_AXIS  = new THREE.Vector3(0, 0, 1); // canonical forward for group
const GLB_BOW_CORRECTION = -Math.PI / 2;               // aligns GLB +X bow → group +Z

/* ─────────────────────────────────────────────────────────────────────────── *
 * CAMERA TUNING                                                                 *
 *   These constants define the cinematic camera position relative to the boat. *
 *   Two camera distance profiles are used:                                    *
 *     HARBOR profile  — wide & elevated, used when ship is near port          *
 *     SAILING profile — closer follow-cam that kicks in once ship is moving   *
 *   The blend between profiles uses the ship's progress along the path.       *
 * ─────────────────────────────────────────────────────────────────────────── */

// ── Harbor / wide-angle start (user said this looks good at port) ──
const CAM_HARBOR_BACK   = 180; // world units behind bow at harbor
const CAM_HARBOR_HEIGHT = 60;  // world units above boat at harbor
const CAM_HARBOR_AHEAD  = 90;  // look-ahead at harbor

// ── Sailing / close follow-cam (transitions in as ship moves) ──
const CAM_SAIL_BACK   = 32;  // world units behind bow while sailing  ← tighter
const CAM_SAIL_HEIGHT = 18;  // world units above boat while sailing  ← lower angle
const CAM_SAIL_AHEAD  = 28;  // look-ahead while sailing              ← closer target

// ── Blend transition: progress 0 → CAM_BLEND_START = harbor, → CAM_BLEND_END = sailing ──
const CAM_BLEND_START = 0.005; // progress at which zoom-in starts
const CAM_BLEND_END   = 0.06;  // progress at which zoom-in finishes (faster transition)

const CAMERA_MIN_Y = 8;    // lower floor so camera can get closer to water level
const ROT_SPEED    = 2.8;  // max rad/s for quaternion.rotateTowards (boat turning)
const CAM_LERP     = 0.07; // slightly faster camera catch-up

/* ─────────────────────────────────────────────────────────────────────────── *
 * NAVIGATION CONSTANTS                                                          *
 * ─────────────────────────────────────────────────────────────────────────── */
const DOCKING_RADIUS      = 115; // world units from island center to trigger docking
const DOCKING_LEAVE_DIST  = 145; // world units to travel before clearing docked state
const FINAL_LEAVE_DIST    = 175; // leave distance for the final island

/* ─────────────────────────────────────────────────────────────────────────── *
 * DEBUG MODE                                                                    *
 *   Set DEBUG_NAVIGATION = true to render:                                     *
 *     - Island safety boundary rings on the water surface                      *
 *     - Navigation waypoint spheres                                             *
 *     - Boat forward direction arrow                                            *
 *   Set back to false (or leave false) for production.                         *
 * ─────────────────────────────────────────────────────────────────────────── */
const DEBUG_NAVIGATION = false;

/* ─────────────────────────────────────────────────────────────────────────── *
 * PATH VISUALIZATION                                                            *
 * ─────────────────────────────────────────────────────────────────────────── */
const SHOW_PATH_DOTS = true; // cyan dot trail on the water showing navigation route

/* ─── Reusable temporaries (avoid per-frame allocation) ───────────────────── */
const _targetQuat  = new THREE.Quaternion();
const _upAxis      = new THREE.Vector3(0, 1, 0);
const _targetCam   = new THREE.Vector3();
const _lookTarget  = new THREE.Vector3();

/* ─────────────────────────────────────────────────────────────────────────── *
 * DEBUG OVERLAYS COMPONENT                                                      *
 * Renders island safety rings + path waypoints when DEBUG_NAVIGATION is true.  *
 * ─────────────────────────────────────────────────────────────────────────── */
function NavigationDebugOverlay({ day, shipRef }) {
  const debugData = useMemo(() => getDayRouteDebugData(day), [day]);

  return (
    <group>
      {/* Island safety boundary rings */}
      {debugData.islands.map(([ix, , iz], i) => {
        const radius = debugData.safetyRadii[i];
        const isLast = i === debugData.islands.length - 1;
        return (
          <group key={`debug-island-${i}`}>
            {/* Outer safety ring */}
            <mesh rotation-x={-Math.PI / 2} position={[ix, 1, iz]}>
              <ringGeometry args={[radius - 2, radius + 2, 48]} />
              <meshBasicMaterial
                color={isLast ? '#ff4444' : '#ff8800'}
                transparent
                opacity={0.55}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* Center marker */}
            <mesh position={[ix, 2, iz]}>
              <sphereGeometry args={[4, 8, 8]} />
              <meshBasicMaterial color={isLast ? '#ff0000' : '#ff6600'} />
            </mesh>
          </group>
        );
      })}

      {/* Navigation waypoint spheres */}
      {debugData.waypoints.map((wp, i) => (
        <mesh key={`debug-wp-${i}`} position={[wp.x, 8, wp.z]}>
          <sphereGeometry args={[3.5, 8, 8]} />
          <meshBasicMaterial color={i === 0 ? '#00ff88' : '#00ffff'} />
        </mesh>
      ))}

      {/* Waypoint connector lines */}
      {debugData.waypoints.length > 1 && (() => {
        const positions = [];
        for (const wp of debugData.waypoints) {
          positions.push(wp.x, 8, wp.z);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return (
          <primitive
            object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.5, transparent: true }))}
          />
        );
      })()}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 * BOAT FORWARD ARROW COMPONENT                                                  *
 * Renders a small arrow in the direction the boat is facing.                   *
 * ─────────────────────────────────────────────────────────────────────────── */
function BoatForwardArrow({ shipRef }) {
  const arrowRef = useRef();

  useFrame(() => {
    if (!arrowRef.current || !shipRef.current) return;
    const pos = shipRef.current.position;
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(shipRef.current.quaternion);
    arrowRef.current.position.set(pos.x + fwd.x * 40, pos.y + 10, pos.z + fwd.z * 40);
  });

  return (
    <mesh ref={arrowRef}>
      <coneGeometry args={[4, 16, 8]} />
      <meshBasicMaterial color="#ff0088" />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 * ACTIVE SHIP — the sailing ship for a selected day                            *
 * ─────────────────────────────────────────────────────────────────────────── */
export function ActiveShip({ day, onDock, isMobile = false }) {
  const shipRef    = useRef(null);
  const { camera } = useThree();
  const { scene: rawScene } = useGLTF('/models/Ship.glb');

  // Clone so this instance is independent from the Harbor's shared scene
  const shipScene = useMemo(() => rawScene.clone(true), [rawScene]);

  const islandPositions = useMemo(() => getDayIslandPositions(day), [day]);
  const shipPath        = useMemo(() => getDayShipCurve(day),        [day]);

  const L           = islandPositions.length;
  const maxDistance = 400 * (L + 1);

  // --- Progress refs (abstract scroll units → 0-1 normalized) ---
  const hCurrent = useRef(0); // raw accumulated scroll
  const uCurrent = useRef(0); // target normalized [0,1]
  const lCurrent = useRef(0); // smooth interpolated [0,1]

  // --- Camera smooth-follow refs ---
  const camPos           = useRef(new THREE.Vector3());
  const camLookRef       = useRef(new THREE.Vector3());
  const cameraDockedLerp = useRef(0);
  const wasDockedState   = useRef(false);

  // --- Docking state ---
  const [dockedIndex, setDockedIndex] = useState(null);
  const dockingTimer    = useRef(0);
  const prevDockedIndex = useRef(null);

  // --- Direction state ---
  const [isReversed, setIsReversed]       = useState(false);
  const [isChangingDir, setIsChangingDir] = useState(false);
  const dirChangeTimer    = useRef(1);
  const scrollAccumulator = useRef(0);

  // ─── Set initial camera position and boat orientation once path is ready ──
  useEffect(() => {
    if (!shipRef.current) return;

    // Align group +Z bow with the path start tangent
    const tangent   = shipPath.getTangentAt(0.001);
    const facingYaw = Math.atan2(tangent.x, tangent.z);
    shipRef.current.rotation.set(0, facingYaw, 0);

    // Prime the camera at the correct starting position so there is no
    // jump on the first frame. Use harbor (wide) profile — ship is at port.
    const startPos = shipPath.getPointAt(0);
    const camStartX = startPos.x - tangent.x * CAM_HARBOR_BACK;
    const camStartY = startPos.y + CAM_HARBOR_HEIGHT;
    const camStartZ = startPos.z - tangent.z * CAM_HARBOR_BACK;
    camPos.current.set(camStartX, camStartY, camStartZ);
    camLookRef.current.set(
      startPos.x + tangent.x * CAM_HARBOR_AHEAD,
      3,
      startPos.z + tangent.z * CAM_HARBOR_AHEAD,
    );
    camera.position.copy(camPos.current);
    camera.lookAt(camLookRef.current);
  }, [shipPath, shipScene, camera]);

  // ─── Reset when day changes ────────────────────────────────────────────────
  useEffect(() => {
    // Always start at 0 so the boat departs from its harbor port position
    const initialProgress = 0;

    hCurrent.current        = initialProgress * maxDistance;
    uCurrent.current        = initialProgress;
    lCurrent.current        = initialProgress;
    prevDockedIndex.current = null;
    setDockedIndex(null);
    setIsReversed(false);
    setIsChangingDir(false);
    dirChangeTimer.current    = 1;
    scrollAccumulator.current = 0;
  }, [day, L, maxDistance]);

  // ─── Input listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.preventDefault) e.preventDefault();

      const isSmall = Math.abs(e.deltaY) < 50;
      const delta   = e.deltaY * (isSmall ? 0.005 : 0.15);
      if (Math.abs(delta) < 0.5) return;

      scrollAccumulator.current += Math.abs(delta);
      const movingBackward = delta < 0;

      // Direction change requires intentional reverse scroll accumulation
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
        onDock?.(null);
        dockingTimer.current = 0;
      }

      hCurrent.current = Math.max(0, hCurrent.current + delta);
      uCurrent.current = Math.min(1, Math.max(0, hCurrent.current / maxDistance));
    };

    const handleKeyDown = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      // ArrowUp = forward (positive Z), ArrowDown = backward
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
        onDock?.(null);
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

  // ─── Frame loop ────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // ── 1. Smooth progress toward target ──
    if (isChangingDir) {
      // During direction change: freeze position, advance the transition timer
      dirChangeTimer.current = Math.min(1, dirChangeTimer.current + 1.2 * delta);
      if (dirChangeTimer.current >= 1) setIsChangingDir(false);
    } else {
      // Smooth lerp: small factor = smooth lag, feels like real boat momentum
      lCurrent.current += (uCurrent.current - lCurrent.current) * 0.03;
    }

    const progress = Math.max(0, Math.min(1, lCurrent.current));

    // ── 2. Sample path position and tangent ──
    const position = shipPath.getPointAt(progress);

    // For tangent we need a slightly ahead sample to avoid zero-tangent at endpoints
    const tangentT  = Math.min(1, progress + 0.002);
    const tangent   = shipPath.getTangentAt(Math.max(0.001, tangentT));

    // ── 3. Boat orientation — quaternion slerp toward path tangent ──
    if (shipRef.current) {
      // rawYaw: angle that aligns group +Z (canonical bow) with the tangent
      const rawYaw = Math.atan2(tangent.x, tangent.z);

      // Forward mode: bow follows movement direction.
      // Reversed mode: bow faces OPPOSITE (180° flip) — stern leads, bow faces harbor.
      const facingYaw = isReversed ? rawYaw + Math.PI : rawYaw;

      _targetQuat.setFromAxisAngle(_upAxis, facingYaw);

      // Subtle roll on boat's forward axis (applied after heading)
      const rollAngle = 0.018 * Math.sin(0.8 * time);
      const rollQuat  = new THREE.Quaternion().setFromAxisAngle(BOAT_FORWARD_AXIS, rollAngle);
      _targetQuat.multiply(rollQuat);

      // Smooth slerp — faster during direction-change to snap the turn
      const rotSpeed = isChangingDir ? ROT_SPEED * 2.0 : ROT_SPEED;
      shipRef.current.quaternion.rotateTowards(_targetQuat, rotSpeed * delta);

      // Positional bobbing on Y (wave simulation)
      shipRef.current.position.set(
        position.x,
        position.y + 3 + 0.4 * Math.sin(1.5 * time),
        position.z,
      );
    }

    // ── 4. Docking detection ──
    if (dockedIndex === null) {
      for (let i = 0; i < islandPositions.length; i++) {
        if (i === prevDockedIndex.current) continue;
        const [px, , pz] = islandPositions[i];
        const dist = Math.sqrt((position.x - px) ** 2 + (position.z - pz) ** 2);

        // Final island: dock by progress, not proximity
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

        // Regular island: dock when within DOCKING_RADIUS of island center
        if (dist < DOCKING_RADIUS) {
          setDockedIndex(i);
          dockingTimer.current = 0;
          onDock?.(i);
          break;
        }
      }

      // Clear prevDockedIndex once we've moved far enough from it
      if (prevDockedIndex.current !== null) {
        const [px, , pz] = islandPositions[prevDockedIndex.current] ?? [];
        if (px !== undefined) {
          const leaveDist = prevDockedIndex.current === L - 1
            ? FINAL_LEAVE_DIST
            : DOCKING_LEAVE_DIST;
          if (Math.sqrt((position.x - px) ** 2 + (position.z - pz) ** 2) > leaveDist) {
            prevDockedIndex.current = null;
          }
        }
      }
    } else {
      // Undock when the boat moves away far enough
      const [dx, , dz] = islandPositions[dockedIndex];
      const leaveDist   = dockedIndex === L - 1 ? FINAL_LEAVE_DIST : DOCKING_LEAVE_DIST;
      if (Math.sqrt((position.x - dx) ** 2 + (position.z - dz) ** 2) > leaveDist) {
        prevDockedIndex.current = dockedIndex;
        setDockedIndex(null);
        onDock?.(null);
      }
    }

    // ── 5. Camera — CINEMATIC FOLLOW ──
    //
    // The camera sits BEHIND the boat's movement direction (path tangent),
    // elevated above sea level. It looks slightly AHEAD of the boat so the
    // user can see the upcoming route.
    //
    // Using the path tangent (not the boat's facing) means the camera smoothly
    // tracks through the curve and never jumps through the hull on reverse.

    if (!shipRef.current) return;

    // ── Progress-based camera blend: harbor (wide) → sailing (close) ──
    // Maps lCurrent progress [CAM_BLEND_START … CAM_BLEND_END] → blend [0 … 1]
    // blend = 0 : full harbor distance  (ship still near port)
    // blend = 1 : full sailing distance (ship is underway)
    const rawBlend = (lCurrent.current - CAM_BLEND_START) / (CAM_BLEND_END - CAM_BLEND_START);
    const blend    = Math.max(0, Math.min(1, rawBlend));
    // Ease-in-out for a natural feel
    const smoothBlend = blend * blend * (3 - 2 * blend);

    const activeCamBack   = CAM_HARBOR_BACK   + (CAM_SAIL_BACK   - CAM_HARBOR_BACK)   * smoothBlend;
    const activeCamHeight = CAM_HARBOR_HEIGHT + (CAM_SAIL_HEIGHT - CAM_HARBOR_HEIGHT) * smoothBlend;
    const activeLookAhead = CAM_HARBOR_AHEAD  + (CAM_SAIL_AHEAD  - CAM_HARBOR_AHEAD)  * smoothBlend;

    let camX, camY, camZ;
    let lookX, lookY, lookZ;

    if (!isReversed) {
      // ── FORWARD: camera behind stern, looking ahead toward bow ──
      camX  = position.x - tangent.x * activeCamBack;
      camY  = Math.max(CAMERA_MIN_Y, position.y + activeCamHeight);
      camZ  = position.z - tangent.z * activeCamBack;
      lookX = position.x + tangent.x * activeLookAhead;
      lookY = 3;
      lookZ = position.z + tangent.z * activeLookAhead;
    } else {
      // ── BACKWARD: camera in +tangent direction, looking in -tangent direction ──
      camX  = position.x + tangent.x * activeCamBack;
      camY  = Math.max(CAMERA_MIN_Y, position.y + activeCamHeight);
      camZ  = position.z + tangent.z * activeCamBack;
      lookX = position.x - tangent.x * activeLookAhead;
      lookY = 3;
      lookZ = position.z - tangent.z * activeLookAhead;
    }

    // During direction transition: arc the camera smoothly to the opposite side
    if (dirChangeTimer.current < 1) {
      const arcFactor = Math.sin(dirChangeTimer.current * Math.PI);
      const sideX = -tangent.z;
      const sideZ =  tangent.x;
      camX += sideX * activeCamBack * 0.3 * arcFactor;
      camZ += sideZ * activeCamBack * 0.3 * arcFactor;
      camY += 12 * arcFactor;
    }

    _targetCam.set(camX, camY, camZ);
    _lookTarget.set(lookX, lookY, lookZ);

    // ── Docked override: smoothly pan camera to show the island ──
    const isDockedValid = dockedIndex !== null && dockedIndex < L;
    if (isDockedValid !== wasDockedState.current) {
      wasDockedState.current = isDockedValid;
      gsap.to(cameraDockedLerp, {
        current: isDockedValid ? 1 : 0,
        duration: 1.2,
        ease: isDockedValid ? 'power2.out' : 'power2.inOut',
        overwrite: true,
      });
    }

    if (isDockedValid) {
      const [dx, dy, dz] = islandPositions[dockedIndex];
      const t = cameraDockedLerp.current;
      // Lerp camera toward a panoramic side view showing the island
      _targetCam.x  += (dx - 70 - _targetCam.x) * t;
      _targetCam.y  += (75  - _targetCam.y) * t;
      _targetCam.z  += (dz + 70 - _targetCam.z) * t;
      _lookTarget.x += (dx - _lookTarget.x) * t;
      _lookTarget.y += (dy - _lookTarget.y) * t;
      _lookTarget.z += (dz - _lookTarget.z) * t;
    }

    // Smooth position + look-at lerp (lag gives cinematic feel)
    camPos.current.lerp(_targetCam, CAM_LERP);
    camLookRef.current.lerp(_lookTarget, CAM_LERP * 1.3);

    camera.position.copy(camPos.current);
    camera.lookAt(camLookRef.current);
  });

  // ─── Cyan dot-trail path visualization ────────────────────────────────────
  // Renders the actual navigation path as evenly-spaced cyan dots on the water.
  // The displayed route matches the actual boat route exactly.
  const PathDots = useMemo(() => {
    const TOTAL_SAMPLES = 500; // curve resolution
    const DOT_STEP      = 4;   // 1 dot every N samples (controls spacing)
    const DOT_Y         = 6.5; // slightly above water surface

    const positions = [];
    for (let i = 0; i <= TOTAL_SAMPLES; i++) {
      if (i % DOT_STEP !== 0) continue;
      const t  = i / TOTAL_SAMPLES;
      const pt = shipPath.getPointAt(t);
      positions.push(pt.x, DOT_Y, pt.z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color:           0x00e5ff,
      size:            1.8,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0.55,
      depthWrite:      false,
    });

    return new THREE.Points(geo, mat);
  }, [shipPath]);

  const startPos = (typeof day === 'number' && harborBoatPositions[day])
    ? harborBoatPositions[day]
    : (harborBoatPositions[1] || [0, 5, -70]);

  return (
    <>
      {/* Boat group — navigation rotation applied here */}
      <group ref={shipRef} position={[startPos[0], startPos[1] + 3, startPos[2]]}>
        {/* GLB_BOW_CORRECTION aligns the mesh so its visual bow (+X) maps to group +Z */}
        <primitive object={shipScene} scale={[20, 20, 20]} rotation={[0, GLB_BOW_CORRECTION, 0]} />
      </group>

      {/* Cyan dotted navigation trail on the water surface */}
      {SHOW_PATH_DOTS && <primitive object={PathDots} />}

      {/* Water wake / bow-spray effect — follows actual boat movement */}
      <BoatWake shipRef={shipRef} />

      {/* Debug overlays — only rendered when DEBUG_NAVIGATION = true */}
      {DEBUG_NAVIGATION && (
        <>
          <NavigationDebugOverlay day={day} shipRef={shipRef} />
          <BoatForwardArrow shipRef={shipRef} />
        </>
      )}
    </>
  );
}
