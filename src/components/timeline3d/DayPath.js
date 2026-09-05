import * as THREE from 'three';
import { MAGNUM_EVENTS, FINAL_DESTINATION } from '../../data/timelineEvents';

/* ─── 10 MAGNUM Events ─────────────────────────────────────────────────── */
export const allDestinations = MAGNUM_EVENTS.map(e => ({ ...e, isFinal: false }));


/* ─── Harbor boat launching positions for 10 Event Ships ─────────────────── */
export const harborBoatPositions = [
  [-360, 5, -70], // 0. Coding Event
  [-280, 5, -70], // 1. Communication Event
  [-200, 5, -70], // 2. Content Creation Event
  [-120, 5, -70], // 3. Cybersecurity Event
  [-40,  5, -70], // 4. Data Analytics Event
  [40,   5, -70], // 5. Designing Event
  [120,  5, -70], // 6. Gaming Event
  [200,  5, -70], // 7. Quiz Event
  [280,  5, -70], // 8. Prompt Engineering Event
  [360,  5, -70], // 9. Cultural Event (Group)
];

/* ─── 7 Stage Island Positions (6 Stage Islands + 1 Final Common Destination) ────── */
export const STAGE_ISLAND_POSITIONS = [
  [-120, 10, 250],   // 1. Inauguration (8 Sept, 9:00 AM – 10:00 AM)
  [140,  10, 580],   // 2. Round 1 (8 Sept, Event Specific Timing)
  [-160, 10, 910],   // 3. Lunch Break (8 Sept, 1:00 PM – 2:00 PM)
  [160,  10, 1240],  // 4. Round 2 (8 Sept, Event Specific Timing)
  [-170, 10, 1570],  // 5. Round 3 Final (9 Sept, Event Specific Timing)
  [170,  10, 1900],  // 6. Lunch Break (9 Sept, 1:00 PM – 2:00 PM)
  [0,    25, 2300],  // 7. FINAL COMMON DESTINATION (Valedictory / Closing Ceremony + Prize Distribution)
];

export const EVENT_ISLANDS = STAGE_ISLAND_POSITIONS;

export function getEventIslandPositions() {
  return STAGE_ISLAND_POSITIONS;
}

// Backward compatibility alias
export const dayEvents = {
  1: MAGNUM_EVENTS.slice(0, 4),
  2: MAGNUM_EVENTS.slice(4, 7),
  3: MAGNUM_EVENTS.slice(7, 10),
};

export function getDayIslandPositions(day = 1) {
  return STAGE_ISLAND_POSITIONS;
}

export const ISLAND_SAFETY_RADII = {
  regular: 75,
  final:   105,
};

const BOAT_NAVIGATION_CLEARANCE = 90;
const ISLAND_SIDE_OFFSET        = 95;
const APPROACH_CLEARANCE        = 95;
const LEAVE_CLEARANCE           = 95;

function pointToSegmentDistXZ(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 0.0001) {
    const ex = px - ax;
    const ez = pz - az;
    return Math.sqrt(ex * ex + ez * ez);
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  const cx = ax + t * dx;
  const cz = az + t * dz;
  const ex = px - cx;
  const ez = pz - cz;
  return Math.sqrt(ex * ex + ez * ez);
}

export function routeIntersectsIsland(ax, az, bx, bz, ix, iz, radius) {
  return pointToSegmentDistXZ(ix, iz, ax, az, bx, bz) < radius;
}

function chooseBypassSide(dx, dz, refX, refZ, ix, iz) {
  const perpX = -dz;
  const perpZ =  dx;
  const toIslandX = ix - refX;
  const toIslandZ = iz - refZ;
  const dot = toIslandX * perpX + toIslandZ * perpZ;
  return dot > 0 ? -1 : +1;
}

function generateSafeBoatRoute(eventIndex) {
  const islands  = EVENT_ISLANDS;
  const idx      = (typeof eventIndex === 'number' && harborBoatPositions[eventIndex]) ? eventIndex : 4;
  const startPos = harborBoatPositions[idx];
  const points   = [];
  const PATH_Y   = 5;

  const startV = new THREE.Vector3(startPos[0], PATH_Y, startPos[2]);
  points.push(startV);

  const exitX = startPos[0] * 0.4;
  const exitZ = 40;
  points.push(new THREE.Vector3(exitX, PATH_Y, exitZ));

  let prevX = exitX;
  let prevZ = exitZ;

  for (let i = 0; i < islands.length; i++) {
    const [ix, , iz] = islands[i];
    const isLast = i === islands.length - 1;

    let apDx = ix - prevX;
    let apDz = iz - prevZ;
    const apLen = Math.sqrt(apDx * apDx + apDz * apDz);
    if (apLen > 0.01) { apDx /= apLen; apDz /= apLen; }

    const side = chooseBypassSide(apDx, apDz, prevX, prevZ, ix, iz);
    const perpX = -apDz * side;
    const perpZ =  apDx * side;

    const approachX = ix - apDx * APPROACH_CLEARANCE + perpX * ISLAND_SIDE_OFFSET;
    const approachZ = iz - apDz * APPROACH_CLEARANCE + perpZ * ISLAND_SIDE_OFFSET;
    points.push(new THREE.Vector3(approachX, PATH_Y, approachZ));

    if (isLast) {
      const dockX = ix + perpX * (ISLAND_SIDE_OFFSET * 0.9);
      const dockZ = iz + perpZ * (ISLAND_SIDE_OFFSET * 0.9);
      points.push(new THREE.Vector3(dockX, PATH_Y, dockZ));
    } else {
      const dockX = ix + perpX * ISLAND_SIDE_OFFSET;
      const dockZ = iz + perpZ * ISLAND_SIDE_OFFSET;
      points.push(new THREE.Vector3(dockX, PATH_Y, dockZ));

      const leaveX = ix + apDx * LEAVE_CLEARANCE + perpX * ISLAND_SIDE_OFFSET;
      const leaveZ = iz + apDz * LEAVE_CLEARANCE + perpZ * ISLAND_SIDE_OFFSET;
      points.push(new THREE.Vector3(leaveX, PATH_Y, leaveZ));

      const [nx, , nz] = islands[i + 1];
      let nApDx = nx - leaveX;
      let nApDz = nz - leaveZ;
      const nApLen = Math.sqrt(nApDx * nApDx + nApDz * nApDz);
      if (nApLen > 0.01) { nApDx /= nApLen; nApDz /= nApLen; }

      const nextSide = chooseBypassSide(nApDx, nApDz, leaveX, leaveZ, nx, nz);
      const nextPerpX = -nApDz * nextSide;
      const nextPerpZ =  nApDx * nextSide;
      const nextApproachX = nx - nApDx * APPROACH_CLEARANCE + nextPerpX * ISLAND_SIDE_OFFSET;
      const nextApproachZ = nz - nApDz * APPROACH_CLEARANCE + nextPerpZ * ISLAND_SIDE_OFFSET;

      const midX = (leaveX + nextApproachX) / 2;
      const midZ = (leaveZ + nextApproachZ) / 2;
      const safeMid = ensureMidpointSafe(midX, midZ, islands, i, PATH_Y);
      points.push(safeMid);

      prevX = leaveX;
      prevZ = leaveZ;
    }
  }

  return points;
}

function ensureMidpointSafe(mx, mz, islands, currentIndex, pathY) {
  let finalX = mx;
  let finalZ = mz;
  const PATH_Y = pathY;

  const checkFrom = Math.max(0, currentIndex - 1);
  const checkTo   = Math.min(islands.length - 1, currentIndex + 2);

  for (let j = checkFrom; j <= checkTo; j++) {
    const [ix, , iz] = islands[j];
    const isLast = j === islands.length - 1;
    const radius = isLast ? ISLAND_SAFETY_RADII.final : ISLAND_SAFETY_RADII.regular;

    const dx = finalX - ix;
    const dz = finalZ - iz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < radius + BOAT_NAVIGATION_CLEARANCE * 0.3) {
      const pushFactor = (radius + BOAT_NAVIGATION_CLEARANCE * 0.3) / Math.max(dist, 0.01);
      finalX = ix + dx * pushFactor;
      finalZ = iz + dz * pushFactor;
    }
  }

  return new THREE.Vector3(finalX, PATH_Y, finalZ);
}

export function getEventShipCurve(eventIndex) {
  const points = generateSafeBoatRoute(eventIndex);
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}

// Backward compatibility alias
export function getDayShipCurve(day) {
  return getEventShipCurve(day);
}

export function getDayRouteDebugData(day) {
  const islands = EVENT_ISLANDS;
  const waypoints = generateSafeBoatRoute(day);
  const safetyRadii = islands.map((_, i) =>
    i === islands.length - 1 ? ISLAND_SAFETY_RADII.final : ISLAND_SAFETY_RADII.regular
  );
  return { waypoints, islands, safetyRadii };
}
