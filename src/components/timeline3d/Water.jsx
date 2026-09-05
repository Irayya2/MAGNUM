import React, { useMemo, useRef } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Water as WaterImpl } from 'three/examples/jsm/objects/Water';

extend({ WaterImpl });

function createProceduralWaterNormalsTexture() {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  const waves = [
    { fx: 3, fy: 5, amp: 1.0, phase: 0.1 },
    { fx: 7, fy: 3, amp: 0.7, phase: 0.4 },
    { fx: 11, fy: 13, amp: 0.5, phase: 0.8 },
    { fx: 17, fy: 19, amp: 0.35, phase: 1.2 },
    { fx: 29, fy: 31, amp: 0.2, phase: 1.7 },
    { fx: 43, fy: 47, amp: 0.1, phase: 2.3 },
  ];

  const getH = (x, y) => {
    let h = 0;
    const u = (x / 512) * Math.PI * 2;
    const v = (y / 512) * Math.PI * 2;
    for (let i = 0; i < waves.length; i++) {
      const w = waves[i];
      h += w.amp * Math.sin(u * w.fx + v * w.fy + w.phase);
      h += w.amp * Math.cos(u * w.fy - v * w.fx + w.phase * 1.5);
    }
    return h;
  };

  let idx = 0;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const hL = getH((x - 1 + 512) % 512, y);
      const hR = getH((x + 1) % 512, y);
      const hU = getH(x, (y - 1 + 512) % 512);
      const hD = getH(x, (y + 1) % 512);

      const dx = (hR - hL) * 1.0;
      const dy = (hD - hU) * 1.0;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;

      data[idx]     = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
      idx += 4;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function Water() {
  const ref = useRef(null);
  const timeRef = useRef(0);
  
  const gl = useThree((state) => state.gl);
  const waterGeometry = useMemo(() => new THREE.PlaneGeometry(3000, 3000, 2, 2), []);
  
  const sunDirection = useMemo(() => {
    const v = new THREE.Vector3();
    const t = Math.PI * (0.45 - 0.5);
    const r = 2 * Math.PI * (0.205 - 0.5);
    v.x = Math.cos(r);
    v.y = Math.sin(t);
    v.z = Math.sin(r);
    v.normalize();
    return v;
  }, []);

  const waterNormalsTexture = useMemo(() => {
    const texture = createProceduralWaterNormalsTexture();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const water = useMemo(() => {
    const w = new WaterImpl(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormalsTexture,
      sunDirection: sunDirection,
      sunColor: 0xfff8e7,
      waterColor: 0x0b7fb5,
      distortionScale: 1.8,
      fog: true,
      alpha: 0.98
    });
    w.material.transparent = true;
    if (w.material.uniforms && w.material.uniforms.size) {
      w.material.uniforms.size.value = 0.15;
    }
    return w;
  }, [waterGeometry, sunDirection, waterNormalsTexture]);

  useFrame((state, delta) => {
    if (ref.current?.material?.uniforms) {
      ref.current.material.uniforms.time.value += 0.6 * delta;
      
      timeRef.current += delta;
      const time = timeRef.current;
      const sun = ref.current.material.uniforms.sunDirection.value;
      
      sun.x = 0.8 * Math.cos(0.02 * time);
      sun.y = 0.45 + 0.05 * Math.sin(0.01 * time);
      sun.z = 0.8 * Math.sin(0.02 * time);
      sun.normalize();
      
      // Infinite ocean position follow camera
      ref.current.position.x = state.camera.position.x;
      ref.current.position.z = state.camera.position.z;
    }
  });

  return (
    <primitive
      ref={ref}
      object={water}
      rotation-x={-Math.PI / 2}
      position={[0, 0, 0]}
    />
  );
}
