import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Html } from "@react-three/drei";

const NEON = "#12D6FF";

/** Simple animated demo object (no GLB, zero layout headache) */
function NeonProduct() {
  const ring = useRef();
  const cube = useRef();

  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.y += dt * 0.4;
    if (cube.current) {
      cube.current.rotation.x += dt * 0.8;
      cube.current.rotation.y += dt * 0.6;
    }
  });

  return (
    <>
      {/* Rotating torus as a “product hero” */}
      <mesh ref={ring} position={[0, 0.25, 0]}>
        <torusGeometry args={[1.1, 0.12, 24, 120]} />
        <meshBasicMaterial wireframe color={NEON} transparent opacity={0.9} />
      </mesh>

      {/* Little floating cube for “configurator” feel */}
      <mesh ref={cube} position={[0, 0.4, 0.0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshBasicMaterial wireframe color={NEON} transparent opacity={0.9} />
      </mesh>
    </>
  );
}

/** Right-side 3D card */
function SimpleCanvas() {
  return (
    <div className="u3ds-card">
      <Canvas
        className="u3ds-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0.9, 4.2], fov: 55 }}
      >
        <color attach="background" args={["#070B15"]} />
        <ambientLight intensity={0.6} />

        <Grid
          args={[40, 40]}
          sectionSize={2.6}
          sectionThickness={1}
          cellSize={0.7}
          cellThickness={0.5}
          fadeDistance={28}
          fadeStrength={1}
          position={[0, -0.9, 0]}
          infinity
          cellColor="#0e1732"
          sectionColor="#1a2f5a"
        />
        <NeonProduct />

      </Canvas>
    </div>
  );
}

/** Section layout (1200px max) */
export default function UpgradeTo3D_Simple() {
  return (
    <section className="u3ds-wrap">
      <div className="u3ds-inner">
        {/* LEFT: headline + simple metrics */}
        <div className="u3ds-left">
          <h2 className="u3ds-title">UPGRADE TO 3D</h2>

          <div className="u3ds-metric">
            <div className="u3ds-num">3×</div>
            <div className="u3ds-copy">
              <div className="u3ds-line">Showcase Products</div>
              <div className="u3ds-sub">Spin, zoom, configure in-page.</div>
            </div>
          </div>

          <div className="u3ds-metric">
            <div className="u3ds-num">50%</div>
            <div className="u3ds-copy">
              <div className="u3ds-line">Enhance Engagement</div>
              <div className="u3ds-sub">Interactive 3D keeps visitors longer.</div>
            </div>
          </div>

          <div className="u3ds-metric">
            <div className="u3ds-num u3ds-num--arrow">↑25%</div>
            <div className="u3ds-copy">
              <div className="u3ds-line">Boost Sales</div>
              <div className="u3ds-sub">Higher confidence, fewer returns.</div>
            </div>
          </div>
        </div>

        {/* RIGHT: simple reliable 3D */}
        <div className="u3ds-right">
          <SimpleCanvas />
        </div>
      </div>
    </section>
  );
}
