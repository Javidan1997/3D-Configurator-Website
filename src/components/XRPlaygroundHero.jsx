import React, { Suspense, useMemo, useRef, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* -------- turn any mesh into a neon wireframe + subtle glow -------- */
function useNeonWireframe(scene, color = "#12D6FF") {
  return useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData.__neonized || o.userData.__glowShell) return;

      o.material = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.92,
      });
      o.castShadow = o.receiveShadow = false;
      o.userData.__neonized = true;

      const shell = new THREE.Mesh(
        o.geometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.08,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      shell.userData.__glowShell = true;
      shell.scale.setScalar(1.03);
      o.add(shell);
    });
    return clone;
  }, [scene, color]);
}

/* -------- scale + center the object so its largest side == targetSize -------- */
function fitToBox(object, targetSize = 3.2) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxSide = Math.max(size.x, size.y, size.z) || 1;
  const s = targetSize / maxSide;

  const center = new THREE.Vector3();
  box.getCenter(center);

  object.position.sub(center);
  object.scale.setScalar(s);
}

/* -------- the single model -------- */
function CityModel({ url = "models/city.glb" }) {
  const { scene } = useGLTF(url);
  // No scaling, no centering, no material changes — original authoring preserved
  return <primitive object={scene} />;
}

/* -------- the minimal scene -------- */
function SingleModelScene({ modelUrl }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1.5, 8], fov: 45, near: 0.1, far: 1000 }}
      className="xr3d-canvas"
    >
      <color attach="background" args={["#070B15"]} />
      <fog attach="fog" args={["#070B15", 14, 26]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />

      <Grid
        args={[60, 60]}
        cellSize={0.72}
        cellThickness={0.6}
        sectionSize={3.2}
        sectionThickness={1.2}
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid
        position={[0, -1.4, 0]}
        cellColor="#11223f"
        sectionColor="#1a3e67"
      />

      <Suspense fallback={<Html center className="xr3d-loading">Loading…</Html>}>
          <CityModel url={modelUrl} />
      </Suspense>
      <OrbitControls
       makeDefault
       enableDamping
       dampingFactor={0.08}
       rotateSpeed={0.7}
       zoomSpeed={0.8}
       panSpeed={0.8}
       minDistance={2}
       maxDistance={200}
     />
    </Canvas>
  );
}

/* -------- exported section (title + stage + CTAs) -------- */
export default function XRPlaygroundSingle({
  modelUrl = "models/city.glb",
  title = "XR PLAYGROUND",
  sub = "Prototype, test, and ship immersive web experiences.",
}) {
  return (
    <section className="xr3d-hero">
      <div className="xr3d-grid" aria-hidden />
      <div className="xr3d-wrap">
        <h1 className="xr3d-title">{title}</h1>
        <p className="xr3d-sub">{sub}</p>

        <div className="xr3d-stage">
          <SingleModelScene modelUrl={modelUrl} />
        </div>

        {/* NEW: neon CTA buttons */}
        <div className="xr3d-cta-row">
          <a className="btn-neon" href="#playground">OPEN PLAYGROUND</a>
          <a className="btn-neon btn-neon--ghost" href="/docs">DOCS</a>
        </div>
      </div>
    </section>
  );
}

/* optional: preload common models */
useGLTF.preload("models/city.glb");
