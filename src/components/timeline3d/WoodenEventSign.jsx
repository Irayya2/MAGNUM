import React, { useMemo } from 'react';
import * as THREE from 'three';

/* ─── Weathered Carpet / Wood Texture with Burnt Lettering Generator ──────── */
function createCarpetEventTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // 1. Base Cream / Weathered Carpet Surface Background
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  bgGrad.addColorStop(0, '#cca876');
  bgGrad.addColorStop(0.5, '#deb882');
  bgGrad.addColorStop(1, '#be9a68');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Weathered Darkened Edges & Border
  const edgeGrad = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.height * 0.25,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.55
  );
  edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edgeGrad.addColorStop(1, 'rgba(35, 18, 5, 0.45)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle Carpet Weave / Wood Grain Lines
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * canvas.height;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(50, 25, 8, 0.16)' : 'rgba(180, 140, 90, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      canvas.width * 0.3, y + (Math.random() - 0.5) * 6,
      canvas.width * 0.7, y + (Math.random() - 0.5) * 6,
      canvas.width, y
    );
    ctx.stroke();
  }

  // 3. Outer Plank / Carpet Bevel Border
  ctx.strokeStyle = 'rgba(40, 20, 5, 0.65)';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  // 4. Burnt / Engraved Event Name Text
  // Single dark burnt charcoal tone (#150a03)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Determine font size (compact, clear, readable)
  let fontSize = 38;
  if (text.length > 22) fontSize = 28;
  else if (text.length > 16) fontSize = 32;

  ctx.font = `900 ${fontSize}px 'Georgia', 'Cinzel', 'Times New Roman', serif`;

  // Charcoal Burn Shadow
  ctx.shadowColor = 'rgba(12, 5, 1, 0.88)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.fillStyle = '#150a03';

  // Render text twice for burnt crispness
  const displayText = text.toUpperCase();
  ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
  ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 5. Subtle Grain Overlay through Text
  for (let i = 0; i < 15; i++) {
    const y = (canvas.height / 2 - 30) + Math.random() * 60;
    ctx.strokeStyle = 'rgba(90, 55, 24, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.05, y);
    ctx.lineTo(canvas.width * 0.95, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ─── 3D Event Name Sign Board / Carpet Text Mesh ────────────────────────── */
export function WoodenEventSign({
  title,
  position,
  rotation = [-Math.PI / 2, 0, Math.PI / 2],
  scale = [1, 1, 1],
  width = 65,
  height = 16,
  onClick
}) {
  const texture = useMemo(() => createCarpetEventTexture(title), [title]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick();
          }
        }}
        onPointerOver={(e) => {
          if (onClick) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.82}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
