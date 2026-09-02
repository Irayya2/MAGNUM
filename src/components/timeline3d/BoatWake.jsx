import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  BOAT HULL WATER DISTURBANCE                                                  *
 *                                                                               *
 *  Effect: a soft, animated ring of foam/shimmer that SURROUNDS the moving     *
 *  hull — like the natural water surface disturbance seen around a real vessel. *
 *  This stays RIGHT at the ship, moves with it, and fades lightly.             *
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Hull disturbance ring ──────────────────────────────────────────────── */
const HULL_COUNT     = 80;         // particles spread around the hull
const HULL_HALF_LEN  = 23;         // ship half-length: bow→stern (world units)
const HULL_HALF_WID  = 10;         // ship half-width: port↔starboard
const HULL_SPREAD_LO = 1.05;       // inner spread factor (just outside hull)
const HULL_SPREAD_HI = 1.70;       // outer spread factor
const HULL_MAX_ALPHA = 0.22;       // max ring opacity — keep it subtle

/* ── Short trailing V-wake (minimal, stays behind stern) ────────────────── */
const WAKE_HISTORY   = 30;         // samples in ring buffer
const WAKE_INTERVAL  = 0.09;       // seconds between samples
const WAKE_LIFETIME  = 2.0;        // fade-out duration in seconds
const WAKE_HALF_W    = 6;          // inner half-width (world units)
const WAKE_EXPANSION = 28;         // V widens by this as wake ages
const WAKE_PTS       = 4;          // points per sample: inner×2 + outer×2
const WAKE_POINT_COUNT = WAKE_HISTORY * WAKE_PTS;
const WAKE_MAX_ALPHA = 0.22;

/* ── Speed / teleport ───────────────────────────────────────────────────── */
const SPEED_SCALE     = 40;        // world units/s at "full speed"
const SPEED_THRESHOLD = 0.08;      // below this norm speed → hide effect
const TELEPORT_DIST   = 100;       // world unit jump that resets history

const WATER_Y = 6.2;               // world Y for water surface

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  GLSL — Hull disturbance (shimmers with time)                                *
 * ═══════════════════════════════════════════════════════════════════════════ */
const HULL_VERT = /* glsl */`
  attribute float aPhase;   // per-particle flicker phase offset
  attribute float aSize;    // world-unit point size hint
  varying   float vPhase;

  void main() {
    vPhase = aPhase;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Perspective-correct size, keep it soft and medium
    gl_PointSize = clamp(aSize * 250.0 / max(1.0, -mv.z), 2.0, 52.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

const HULL_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uSpeed;   // 0..1 normalised boat speed
  varying float vPhase;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    // Very soft, wide falloff so particles blend into the ocean
    float soft    = 1.0 - smoothstep(0.05, 0.50, d);

    // Organic shimmer: each particle flickers at its own rate
    float shimmer = 0.55 + 0.45 * sin(uTime * 3.0 + vPhase);

    float alpha   = soft * shimmer * uSpeed * ${HULL_MAX_ALPHA.toFixed(2)};

    // Ocean-foam colour: near-white with a slight icy blue tint
    vec3 col = vec3(0.88, 0.96, 1.00);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  GLSL — Trailing wake (ages out behind stern)                                *
 * ═══════════════════════════════════════════════════════════════════════════ */
const WAKE_VERT = /* glsl */`
  attribute float aAge;
  attribute float aSize;
  varying   float vAge;

  void main() {
    vAge = aAge;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * 260.0 / max(1.0, -mv.z), 1.0, 46.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

const WAKE_FRAG = /* glsl */`
  varying float vAge;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float soft    = 1.0 - smoothstep(0.12, 0.50, d);
    float ageFade = pow(max(0.0, 1.0 - vAge), 2.2);
    float alpha   = soft * ageFade * ${WAKE_MAX_ALPHA.toFixed(2)};

    gl_FragColor = vec4(0.86, 0.94, 1.00, alpha);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  BUILD HULL OFFSETS (deterministic, computed once at module load)             *
 *                                                                               *
 *  Generates LOCAL-SPACE (lx, lz) positions for each hull particle.            *
 *  lz is along the bow→stern axis, lx is port↔starboard.                       *
 *  More particles are placed at the bow to match the physics of water splitting.*
 * ═══════════════════════════════════════════════════════════════════════════ */
function buildHullData() {
  // Simple deterministic LCG so the pattern is stable across renders
  let seed = 13579;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const offsets = new Float32Array(HULL_COUNT * 2); // [lx, lz] in local space
  const phases  = new Float32Array(HULL_COUNT);
  const sizes   = new Float32Array(HULL_COUNT);

  for (let i = 0; i < HULL_COUNT; i++) {
    const angle = rng() * Math.PI * 2;
    const r     = HULL_SPREAD_LO + rng() * (HULL_SPREAD_HI - HULL_SPREAD_LO);

    // Ellipse aligned with ship: lx = starboard axis, lz = bow axis
    // Bias: particles closer to bow (angle ≈ 0, +Z) get slightly denser distribution
    // achieved naturally by uniform angle distribution on the ellipse perimeter
    offsets[i * 2 + 0] = Math.sin(angle) * HULL_HALF_WID  * r;
    offsets[i * 2 + 1] = Math.cos(angle) * HULL_HALF_LEN  * r;
    phases[i]           = rng() * Math.PI * 2;
    sizes[i]            = 8 + rng() * 8;   // 8–16 world-unit size hint
  }

  return { offsets, phases, sizes };
}

const HULL_DATA = buildHullData(); // computed once, never recreated

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  REUSABLE TEMPORARIES                                                         *
 * ═══════════════════════════════════════════════════════════════════════════ */
const _fwd   = new THREE.Vector3();
const _right = new THREE.Vector3();

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  BoatWake COMPONENT                                                          *
 *                                                                               *
 *  Props:                                                                       *
 *    shipRef — ref to the boat's <group> (position + quaternion from there)    *
 * ═══════════════════════════════════════════════════════════════════════════ */
export function BoatWake({ shipRef }) {

  /* ── Pre-allocated GPU attribute buffers ─────────────────────────────── */
  const hullPos   = useMemo(() => new Float32Array(HULL_COUNT * 3).fill(0),   []);
  const hullPhase = useMemo(() => HULL_DATA.phases,                            []);
  const hullSize  = useMemo(() => HULL_DATA.sizes,                             []);

  const wakePos   = useMemo(() => new Float32Array(WAKE_POINT_COUNT * 3).fill(0), []);
  const wakeAge   = useMemo(() => new Float32Array(WAKE_POINT_COUNT).fill(1),     []);
  const wakeSize  = useMemo(() => new Float32Array(WAKE_POINT_COUNT).fill(0),     []);

  /* ── BufferGeometry (attributes backed by the arrays above) ──────────── */
  const hullGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(hullPos,   3));
    g.setAttribute('aPhase',   new THREE.BufferAttribute(hullPhase, 1));
    g.setAttribute('aSize',    new THREE.BufferAttribute(hullSize,  1));
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wakeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(wakePos,  3));
    g.setAttribute('aAge',     new THREE.BufferAttribute(wakeAge,  1));
    g.setAttribute('aSize',    new THREE.BufferAttribute(wakeSize, 1));
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Materials ───────────────────────────────────────────────────────── */
  const hullMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   HULL_VERT,
    fragmentShader: HULL_FRAG,
    uniforms: {
      uTime:  { value: 0 },
      uSpeed: { value: 0 },
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), []);

  const wakeMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   WAKE_VERT,
    fragmentShader: WAKE_FRAG,
    uniforms: {},
    transparent: true,
    depthWrite:  false,
    blending:    THREE.NormalBlending,
  }), []);

  /* ── Runtime state ───────────────────────────────────────────────────── */
  const wakeHistory = useRef([]);  // [{ x, z, dx, dz, age, intensity }]
  const sampleTimer = useRef(0);
  const prevPos     = useRef(null);

  /* ── Per-frame update ────────────────────────────────────────────────── */
  useFrame((state, delta) => {
    if (!shipRef.current) return;

    const ship = shipRef.current;
    const cx   = ship.position.x;
    const cz   = ship.position.z;
    const time = state.clock.elapsedTime;

    /* 1. Compute speed from position delta */
    let movDx = 0, movDz = 0, speed = 0;
    if (prevPos.current) {
      const ddx = cx - prevPos.current.x;
      const ddz = cz - prevPos.current.z;
      const d   = Math.sqrt(ddx * ddx + ddz * ddz);
      speed = d / Math.max(delta, 0.0001);
      movDx = ddx;
      movDz = ddz;
      // Reset on timeline scrub / teleport
      if (d > TELEPORT_DIST) wakeHistory.current = [];
    }
    prevPos.current = { x: cx, z: cz };

    const normSpeed = Math.min(1, speed / SPEED_SCALE);
    const isMoving  = normSpeed > SPEED_THRESHOLD;

    /* 2. Hull disturbance ring — follows ship every frame
     *
     *  Each pre-computed (lx, lz) offset is transformed from LOCAL ship
     *  space into WORLD space using the ship's quaternion:
     *
     *    world = ship.position
     *          + right * lx    (port/starboard)
     *          + forward * lz  (bow/stern)
     */
    _fwd.set(0, 0, 1).applyQuaternion(ship.quaternion);
    _right.set(1, 0, 0).applyQuaternion(ship.quaternion);

    for (let i = 0; i < HULL_COUNT; i++) {
      const lx = HULL_DATA.offsets[i * 2];
      const lz = HULL_DATA.offsets[i * 2 + 1];
      const pi = i * 3;
      hullPos[pi]     = cx + _right.x * lx + _fwd.x * lz;
      hullPos[pi + 1] = WATER_Y;
      hullPos[pi + 2] = cz + _right.z * lx + _fwd.z * lz;
    }
    hullGeo.attributes.position.needsUpdate = true;

    // Drive opacity via uniform (zero when stopped → effect disappears naturally)
    hullMat.uniforms.uTime.value  = time;
    hullMat.uniforms.uSpeed.value = isMoving
      ? normSpeed
      : Math.max(0, hullMat.uniforms.uSpeed.value - delta * 0.8); // gentle fade-out

    /* 3. Sample wake history */
    sampleTimer.current += delta;
    if (isMoving && sampleTimer.current >= WAKE_INTERVAL) {
      sampleTimer.current = 0;
      const mLen = Math.sqrt(movDx * movDx + movDz * movDz);
      if (wakeHistory.current.length >= WAKE_HISTORY) wakeHistory.current.shift();
      wakeHistory.current.push({
        x: cx, z: cz,
        dx: mLen > 0.0001 ? movDx / mLen : 0,
        dz: mLen > 0.0001 ? movDz / mLen : 0,
        age: 0,
        intensity: normSpeed,
      });
    } else if (!isMoving) {
      sampleTimer.current = 0;
    }

    /* 4. Age and prune wake history */
    const ageStep = delta / WAKE_LIFETIME;
    for (const h of wakeHistory.current) h.age += ageStep;
    while (wakeHistory.current.length > 0 && wakeHistory.current[0].age > 1.02) {
      wakeHistory.current.shift();
    }

    /* 5. Write wake geometry — V-shaped trail behind stern */
    const hist = wakeHistory.current;
    for (let i = 0; i < WAKE_HISTORY; i++) {
      const base = i * WAKE_PTS;

      if (i >= hist.length) {
        // Deactivate unused slots
        for (let p = 0; p < WAKE_PTS; p++) {
          wakeAge[base + p]  = 1;
          wakeSize[base + p] = 0;
        }
        continue;
      }

      const h  = hist[i];
      const af = Math.min(1, h.age);

      // Perpendicular to movement direction
      const px = -h.dz;
      const pz =  h.dx;

      const iW = WAKE_HALF_W * h.intensity;
      const oW = iW + af * WAKE_EXPANSION;
      const sz = 8.5 * h.intensity;

      // Inner pair (close to hull centreline)
      let pi = base * 3;
      wakePos[pi]     = h.x + px * iW;
      wakePos[pi + 1] = WATER_Y;
      wakePos[pi + 2] = h.z + pz * iW;
      wakeAge[base]   = af;
      wakeSize[base]  = sz;

      pi = (base + 1) * 3;
      wakePos[pi]     = h.x - px * iW;
      wakePos[pi + 1] = WATER_Y;
      wakePos[pi + 2] = h.z - pz * iW;
      wakeAge[base + 1]  = af;
      wakeSize[base + 1] = sz;

      // Outer V tips (wider, fade sooner)
      const outerAf = Math.min(1, af + 0.06);
      const outerSz = sz * 0.8;

      pi = (base + 2) * 3;
      wakePos[pi]     = h.x + px * oW;
      wakePos[pi + 1] = WATER_Y;
      wakePos[pi + 2] = h.z + pz * oW;
      wakeAge[base + 2]  = outerAf;
      wakeSize[base + 2] = outerSz;

      pi = (base + 3) * 3;
      wakePos[pi]     = h.x - px * oW;
      wakePos[pi + 1] = WATER_Y;
      wakePos[pi + 2] = h.z - pz * oW;
      wakeAge[base + 3]  = outerAf;
      wakeSize[base + 3] = outerSz;
    }

    wakeGeo.attributes.position.needsUpdate = true;
    wakeGeo.attributes.aAge.needsUpdate     = true;
    wakeGeo.attributes.aSize.needsUpdate    = true;
  });

  return (
    <>
      {/* Soft shimmer ring that wraps around the hull — the primary disturbance */}
      <points geometry={hullGeo} material={hullMat} />

      {/* Subtle V-shaped trail directly behind the stern */}
      <points geometry={wakeGeo} material={wakeMat} />
    </>
  );
}
