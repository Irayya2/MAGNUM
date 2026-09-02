import * as THREE from 'three';
import { timelineEvents } from '../../data/timelineEvents';

/* ─── Events split by day ────────────────────────────────────────────────── */
export const dayEvents = {
  1: timelineEvents.filter(e => e.day === 1), // 7 events
  2: timelineEvents.filter(e => e.day === 2), // 6 events
  3: timelineEvents.filter(e => e.day === 3), // 7 events
};

/* ─── Harbor dock positions (3 boats side-by-side, all face +Z / open sea) ── */
export const harborBoatPositions = [
  [-100, 5, -70], // Day 1
  [0,   5, -70],  // Day 2
  [100, 5, -70],  // Day 3
];

/* ─── Per-day island layouts ─────────────────────────────────────────────── */
// Day 1 — fans LEFT (negative X) + forward (+Z)
// Day 2 — goes STRAIGHT ahead (+Z centre lane)
// Day 3 — fans RIGHT (positive X) + forward (+Z)
const DAY_ISLANDS = {
  1: [
    [-80,  10, 200],
    [-200, 10, 360],
    [-340, 10, 480],
    [-460, 10, 570],
    [-560, 10, 640],
    [-640, 10, 695],
    [-700, 25, 730], // final
  ],
  2: [
    [20,  10, 220],
    [40,  10, 440],
    [10,  10, 660],
    [50,  10, 870],
    [20,  10, 1070],
    [30,  25, 1260], // final
  ],
  3: [
    [80,  10, 200],
    [200, 10, 360],
    [340, 10, 480],
    [460, 10, 570],
    [560, 10, 640],
    [640, 10, 695],
    [700, 25, 730], // final
  ],
};

export function getDayIslandPositions(day) {
  return DAY_ISLANDS[day];
}

/* ─── CatmullRom ship path per day ──────────────────────────────────────── */
export function getDayShipCurve(day) {
  const islands  = DAY_ISLANDS[day];
  const startPos = harborBoatPositions[day - 1];
  const points   = [];

  // --- Harbor start ---
  points.push(new THREE.Vector3(startPos[0], 5, startPos[2]));

  // --- Harbour exit control point (taper toward open-ocean lane) ---
  const exitX = day === 1 ? startPos[0] * 0.55 : day === 3 ? startPos[0] * 0.55 : 0;
  points.push(new THREE.Vector3(exitX, 5, 50));

  // --- Mid-entry control point toward first island ---
  const first = islands[0];
  points.push(new THREE.Vector3((exitX + first[0]) * 0.5, 5, 130));

  // --- Island approach / leave / mid waypoints ---
  for (let i = 0; i < islands.length; i++) {
    const [x, , z] = islands[i];
    const isLast = i === islands.length - 1;

    // Approach
    points.push(new THREE.Vector3(x, 5, z - 25));

    if (!isLast) {
      // Leave
      points.push(new THREE.Vector3(x, 5, z + 25));
      // Mid-point between this and next island
      const [nx, , nz] = islands[i + 1];
      points.push(new THREE.Vector3((x + nx) / 2, 5, (z + nz) / 2));
    }
  }

  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}
