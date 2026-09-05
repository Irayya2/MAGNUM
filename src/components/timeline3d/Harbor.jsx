import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { harborBoatPositions } from './DayPath';
import { MAGNUM_EVENTS } from '../../data/timelineEvents';
import { WoodenEventSign } from './WoodenEventSign';

/* ─── Shore / Port "GCC-BCA" Bold Banner Canvas Texture Generator ─────────── */
function createShoreTextTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Solid Dark Navy / Charcoal Wooden Board Background
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#1e293b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Thick Bright Gold Outer Frame Border
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ─── Bold Shore / Port "GCC-BCA" Header Sign & Entrance Gate ────────────── */
function PortShoreSign() {
  const texture = useMemo(() => createShoreTextTexture(), []);

  return (
    <group>
      {/* 1. Large Seawall Cliff Top Header Board */}
      <group position={[0, 26, -408]}>
        {/* Dark Backing Frame Box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[200, 32, 3]} />
          <meshStandardMaterial color="#1e1005" roughness={0.8} />
        </mesh>
        {/* Border Texture Front Plane */}
        <mesh position={[0, 0, 1.6]}>
          <planeGeometry args={[196, 28]} />
          <meshStandardMaterial map={texture} roughness={0.5} />
        </mesh>
        {/* Single Crisp 3D Text Vector Overlay */}
        <Text
          position={[0, 0, 2.2]}
          fontSize={19}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={1.2}
          outlineColor="#1a0b02"
          letterSpacing={0.06}
        >
          GCC-BCA
        </Text>
      </group>

      {/* 2. Grand Entrance Archway Sign right at the Central Shore Pier */}
      <group position={[0, 10, -298]}>
        {/* Overhead Banner Signboard Frame */}
        <mesh position={[0, 16, 0]}>
          <boxGeometry args={[120, 24, 3]} />
          <meshStandardMaterial color="#1e1005" roughness={0.8} />
        </mesh>
        {/* Border Texture Front Plane */}
        <mesh position={[0, 16, 1.6]}>
          <planeGeometry args={[116, 20]} />
          <meshStandardMaterial map={texture} roughness={0.5} />
        </mesh>
        {/* Single Crisp 3D Text Vector Overlay */}
        <Text
          position={[0, 16, 2.2]}
          fontSize={14}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={1}
          outlineColor="#1a0b02"
          letterSpacing={0.06}
        >
          GCC-BCA
        </Text>

        {/* Support Wooden Pillars */}
        <mesh position={[-56, 6, 0]}>
          <boxGeometry args={[6, 24, 6]} />
          <meshStandardMaterial color="#4a3015" roughness={0.8} />
        </mesh>
        <mesh position={[56, 6, 0]}>
          <boxGeometry args={[6, 24, 6]} />
          <meshStandardMaterial color="#4a3015" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── One docked boat that bobs gently ──────────────────────────────────── */
function DockedBoat({ boatPosition, dayIndex, hide, onSelect }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/Ship.glb');

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        boatPosition[1] + 0.28 * Math.sin(clock.elapsedTime * 1.3 + dayIndex * 1.7);
    }
  });

  if (hide) return null;

  return (
    <group
      ref={groupRef}
      position={boatPosition}
      rotation={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(dayIndex);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={scene.clone()} scale={[20, 20, 20]} />
    </group>
  );
}

/* ─── Fully Connected Wooden Pier Network + Inter-Stand Bridges + Support Pilings ─ */
function DockPlatform({ onSelect }) {
  const boatXPositions = harborBoatPositions.map(pos => pos[0]);

  // Midpoints between adjacent boat stands for inter-stand connecting bridges
  const bridgeXPositions = [];
  for (let i = 0; i < boatXPositions.length - 1; i++) {
    bridgeXPositions.push((boatXPositions[i] + boatXPositions[i + 1]) / 2);
  }

  // Pilings positions grid underneath all piers
  const pilingsList = [];
  
  // Promenade pilings
  for (let x = -400; x <= 400; x += 40) {
    pilingsList.push([x, -190], [x, -170]);
  }

  // Finger pier pilings under each stand
  boatXPositions.forEach((x) => {
    pilingsList.push(
      [x - 14, -150], [x + 14, -150],
      [x - 14, -110], [x + 14, -110],
      [x - 14, -70],  [x + 14, -70]
    );
  });

  // Inter-stand bridge pilings
  bridgeXPositions.forEach((x) => {
    pilingsList.push([x, -145], [x, -95]);
  });

  // Shore gangway pilings
  [-240, 0, 240].forEach((x) => {
    pilingsList.push([x, -280], [x, -240], [x, -200]);
  });

  return (
    <group>
      {/* Sandy beach floor behind the boats */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -300]}>
        <planeGeometry args={[1200, 450]} />
        <meshStandardMaterial color="#c4a97b" roughness={1} metalness={0} />
      </mesh>

      {/* Low cliff / seawall backing */}
      <mesh position={[0, 10, -420]}>
        <boxGeometry args={[1200, 25, 20]} />
        <meshStandardMaterial color="#8d7355" roughness={0.9} />
      </mesh>

      {/* Bold "GCC-BCA" Header & Entrance Archway Sign */}
      <PortShoreSign />

      {/* ─── 1. STRUCTURAL SUPPORT PILINGS (Stilts into water) ────────────── */}
      {pilingsList.map(([px, pz], idx) => (
        <group key={`piling-${idx}`} position={[px, -4.5, pz]}>
          {/* Wooden pole stilt */}
          <mesh>
            <cylinderGeometry args={[1.5, 1.8, 14, 8]} />
            <meshStandardMaterial color="#2e1d0f" roughness={0.95} />
          </mesh>
          {/* Metallic / Iron ring collar near top */}
          <mesh position={[0, 6.2, 0]}>
            <cylinderGeometry args={[2.0, 2.0, 0.8, 8]} />
            <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ─── 2. SHORE-TO-PROMENADE ACCESS GANGWAYS (Land to Pier Ramps) ──── */}
      {/* Central Shore Main Entrance Pier */}
      <mesh position={[0, 1.2, -242.5]}>
        <boxGeometry args={[48, 2.4, 95]} />
        <meshStandardMaterial color="#4a3015" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.5, -242.5]}>
        <boxGeometry args={[44, 0.4, 93]} />
        <meshStandardMaterial color="#664420" roughness={0.7} />
      </mesh>

      {/* Left & Right Shore Access Gangway Ramps */}
      {[-240, 240].map((gx) => (
        <group key={`shore-gangway-${gx}`}>
          <mesh position={[gx, 1.2, -242.5]}>
            <boxGeometry args={[36, 2.4, 95]} />
            <meshStandardMaterial color="#4a3015" roughness={0.85} />
          </mesh>
          <mesh position={[gx, 2.5, -242.5]}>
            <boxGeometry args={[32, 0.4, 93]} />
            <meshStandardMaterial color="#664420" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ─── 3. MAIN PROMENADE BOARDWALK DECK (Cross Horizontal Pier Deck) ─ */}
      {/* Heavy Sub-Deck Support Beam */}
      <mesh position={[0, 0.6, -180]}>
        <boxGeometry args={[796, 3.2, 32]} />
        <meshStandardMaterial color="#3d250d" roughness={0.9} />
      </mesh>
      {/* Upper Wooden Decking Boardwalk Plank Path */}
      <mesh position={[0, 2.3, -180]}>
        <boxGeometry args={[792, 0.5, 28]} />
        <meshStandardMaterial color="#614120" roughness={0.75} />
      </mesh>

      {/* Promenade Wooden Guard Railings & Posts along rear edge */}
      <mesh position={[0, 4.5, -194]}>
        <boxGeometry args={[790, 0.8, 1.2]} />
        <meshStandardMaterial color="#8c5828" roughness={0.8} />
      </mesh>
      {[-390, -310, -230, -150, -70, 0, 70, 150, 230, 310, 390].map((px) => (
        <mesh key={`prom-post-${px}`} position={[px, 3.5, -194]}>
          <boxGeometry args={[2, 4, 2]} />
          <meshStandardMaterial color="#4a3015" roughness={0.9} />
        </mesh>
      ))}

      {/* ─── 4. INTER-STAND CONNECTING BRIDGES (Cross Gangways between gaps) ─ */}
      {bridgeXPositions.map((bx, i) => (
        <group key={`bridge-group-${i}`}>
          {/* Bridge Row 1 (at Z = -145) */}
          <mesh position={[bx, 1.2, -145]}>
            <boxGeometry args={[44, 2.2, 16]} />
            <meshStandardMaterial color="#4d3216" roughness={0.8} />
          </mesh>
          <mesh position={[bx, 2.4, -145]}>
            <boxGeometry args={[42, 0.4, 14]} />
            <meshStandardMaterial color="#6e4722" roughness={0.7} />
          </mesh>
          {/* Front & Back Guard Rail Beams for Bridge Row 1 */}
          <mesh position={[bx, 3.4, -152.5]}>
            <boxGeometry args={[44, 1.2, 0.8]} />
            <meshStandardMaterial color="#7a4e23" roughness={0.8} />
          </mesh>
          <mesh position={[bx, 3.4, -137.5]}>
            <boxGeometry args={[44, 1.2, 0.8]} />
            <meshStandardMaterial color="#7a4e23" roughness={0.8} />
          </mesh>

          {/* Bridge Row 2 (at Z = -95) */}
          <mesh position={[bx, 1.2, -95]}>
            <boxGeometry args={[44, 2.2, 16]} />
            <meshStandardMaterial color="#4d3216" roughness={0.8} />
          </mesh>
          <mesh position={[bx, 2.4, -95]}>
            <boxGeometry args={[42, 0.4, 14]} />
            <meshStandardMaterial color="#6e4722" roughness={0.7} />
          </mesh>
          {/* Front & Back Guard Rail Beams for Bridge Row 2 */}
          <mesh position={[bx, 3.4, -102.5]}>
            <boxGeometry args={[44, 1.2, 0.8]} />
            <meshStandardMaterial color="#7a4e23" roughness={0.8} />
          </mesh>
          <mesh position={[bx, 3.4, -87.5]}>
            <boxGeometry args={[44, 1.2, 0.8]} />
            <meshStandardMaterial color="#7a4e23" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ─── 5. FINGER PIER STANDS & EVENT CARPET MATS ───────────────────── */}
      {boatXPositions.map((x, i) => (
        <group key={`dock-lane-${i}`}>
          {/* Heavy Wooden Sub-structure Pier Stand Base */}
          <mesh position={[x, 0.6, -120]}>
            <boxGeometry args={[36, 3.0, 120]} />
            <meshStandardMaterial color="#4a3015" roughness={0.85} />
          </mesh>

          {/* Luxury Decking Wooden Border Frame around carpet */}
          <mesh position={[x, 2.2, -120]}>
            <boxGeometry args={[35.6, 0.4, 119.6]} />
            <meshStandardMaterial color="#614120" roughness={0.7} />
          </mesh>

          {/* White / Cream Carpet Mat on top of the pier */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 2.42, -120]}>
            <planeGeometry args={[30, 114]} />
            <meshStandardMaterial color="#e2cfb4" roughness={0.8} />
          </mesh>

          {/* Event Name written directly ON the carpet mat */}
          {MAGNUM_EVENTS[i] && (
            <WoodenEventSign
              title={MAGNUM_EVENTS[i].title}
              position={[x, 2.58, -120]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
              width={75}
              height={20}
              onClick={() => onSelect?.(i)}
            />
          )}
        </group>
      ))}

      {/* ─── 6. DOCK TIES & MOORING BOLLARDS ──────────────────────────────── */}
      {[-1, 0, 1].map((row) =>
        boatXPositions.map((x, i) => (
          <mesh key={`${row}-${i}`} position={[x, 2.7, -80 + row * 30]}>
            <boxGeometry args={[37, 0.6, 2.5]} />
            <meshStandardMaterial color="#36220e" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Mooring bollards per stand */}
      {boatXPositions.map((x, i) => (
        <group key={`bollard-group-${i}`}>
          <mesh position={[x + 16, 3.8, -90]}>
            <cylinderGeometry args={[1.8, 2.2, 4.5, 10]} />
            <meshStandardMaterial color="#262626" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[x - 16, 3.8, -90]}>
            <cylinderGeometry args={[1.8, 2.2, 4.5, 10]} />
            <meshStandardMaterial color="#262626" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Exported Harbor: 10 docked boats + platform + Event signboards ────────── */
export function Harbor({ selectedDay, onSelect }) {
  return (
    <group>
      <DockPlatform onSelect={onSelect} />
      {harborBoatPositions.map((pos, i) => (
        <DockedBoat
          key={i}
          boatPosition={pos}
          dayIndex={i}
          hide={selectedDay === i}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/models/Ship.glb');


