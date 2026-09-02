import React, { useMemo, useRef } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Water as WaterImpl } from 'three/examples/jsm/objects/Water';

extend({ WaterImpl });

export function Water() {
  const ref = useRef(null);
  
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

  const water = useMemo(() => {
    const w = new WaterImpl(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg',
        (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        }
      ),
      sunDirection: sunDirection,
      sunColor: 0xfff5e0,
      waterColor: 0x006994, // 27028 in decimal
      distortionScale: 4,
      fog: true,
      alpha: 0.95
    });
    w.material.transparent = true;
    return w;
  }, [waterGeometry, sunDirection]);

  useFrame((state, delta) => {
    if (ref.current?.material?.uniforms) {
      ref.current.material.uniforms.time.value += 0.6 * delta;
      
      const time = state.clock.elapsedTime;
      const sun = ref.current.material.uniforms.sunDirection.value;
      
      sun.x = 0.8 * Math.cos(0.02 * time);
      sun.y = 0.45 + 0.05 * Math.sin(0.01 * time);
      sun.z = 0.8 * Math.sin(0.02 * time);
      sun.normalize();
      
      // Infinite ocean effect
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
