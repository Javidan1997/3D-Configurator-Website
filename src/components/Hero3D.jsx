// src/components/Hero3D.jsx
import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Environment,
  PerspectiveCamera,
  Html,
  ContactShadows,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../store/useAppStore";

// ─────────────────────────────────────────────────────────────
// Instanced orbiting chips (single draw call)
// ─────────────────────────────────────────────────────────────
function OrbitingBits({ count = 36, radius = 3.4, speed = 0.25, dim = false }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        a: (i / count) * Math.PI * 2,
        r: radius * (0.9 + (i % 5) * 0.02),
        s: 0.05 + ((i % 3) * 0.02),
      })),
    [count, radius]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    seeds.forEach((s, i) => {
      const a = s.a + t * (1.0 + (i % 5) * 0.03);
      dummy.position.set(
        Math.cos(a) * s.r,
        Math.sin(a * 2.0) * 0.35,
        Math.sin(a) * s.r
      );
      dummy.scale.setScalar(s.s);
      dummy.rotation.set(a, a * 1.2, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color={dim ? "#3FBBD6" : "#00E0FF"}
        transparent
        opacity={dim ? 0.5 : 0.85}
      />
    </instancedMesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Parallax tilt (mouse-driven)
// ─────────────────────────────────────────────────────────────
function ParallaxGroup({ children }) {
  const ref = useRef();
  const { mouse } = useThree();
  useFrame(() => {
    const rx = THREE.MathUtils.lerp(ref.current.rotation.x, mouse.y * 0.08, 0.08);
    const ry = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.12, 0.08);
    ref.current.rotation.set(rx, ry, 0);
  });
  return <group ref={ref}>{children}</group>;
}

// ─────────────────────────────────────────────────────────────
// Hero mesh with a light Fresnel rim
// ─────────────────────────────────────────────────────────────
function FresnelIcosahedron() {
  const matRef = useRef();
  const onBeforeCompile = (shader) => {
    shader.uniforms.fresnelColor = { value: new THREE.Color("#00E0FF") };
    shader.uniforms.fresnelPower = { value: 2.0 };

    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      `
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      void main() {
        vNormalW = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDirW = normalize(-mvPosition.xyz);
    `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
      uniform vec3 fresnelColor;
      uniform float fresnelPower;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      void main() {
    `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `
      float f = pow(1.0 - max(0.0, dot(normalize(vNormalW), normalize(vViewDirW))), 3.0);
      gl_FragColor.rgb += fresnelColor * f * fresnelPower * 0.12;
      #include <dithering_fragment>
    `
    );
    matRef.current.userData.shader = shader;
  };

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh castShadow>
        <icosahedronGeometry args={[1.2, 3]} />
        <meshStandardMaterial
          ref={matRef}
          color={"#4B8CFF"}
          metalness={0.35}
          roughness={0.25}
          envMapIntensity={1.0}
          onBeforeCompile={onBeforeCompile}
        />
      </mesh>
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────
// Halo torus rings for subtle focus cues
// ─────────────────────────────────────────────────────────────
function HaloRings() {
  const group = useRef();
  useFrame((_, dt) => {
    group.current.children.forEach((m, i) => {
      const t = performance.now() * 0.001 + i * 0.6;
      m.scale.setScalar(1 + Math.sin(t) * 0.03);
      m.rotation.z += dt * (i % 2 ? 0.1 : -0.08);
    });
  });
  return (
    <group ref={group}>
      {[2.0, 2.6, 3.2].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.03, 12, 144]} />
          <meshBasicMaterial
            color="#00E0FF"
            transparent
            opacity={0.18 - i * 0.03}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Ribbon tube flowing around hero
// ─────────────────────────────────────────────────────────────
function Ribbon({ radius = 2.3 }) {
  const ref = useRef();
  const curve = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * radius,
          Math.sin(a * 2) * 0.25,
          Math.sin(a) * radius
        )
      );
    }
    return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.06);
  }, [radius]);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.15;
  });
  return (
    <mesh ref={ref}>
      <tubeGeometry args={[curve, 256, 0.02, 8, true]} />
      <meshBasicMaterial color="#4B8CFF" transparent opacity={0.35} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Labels (billboarded HTML) for value props
// ─────────────────────────────────────────────────────────────
function Label({ children, position }) {
  return (
    <Html transform distanceFactor={8} position={position} occlude>
      <div className="px-2 py-1 text-[8px] rounded bg-white/10 border border-white/10 backdrop-blur">
        {children}
      </div>
    </Html>
  );
}
function LabelRing({ radius = 3.6 }) {
  const items = ["AR", "VR", "Analytics", "Speed"];
  return (
    <>
      {items.map((t, i) => {
        const a = (i / items.length) * Math.PI * 2;
        return (
          <Label
            key={t}
            position={[
              Math.cos(a) * radius,
              Math.sin(a * 2) * 0.2,
              Math.sin(a) * radius,
            ]}
          >
            {t}
          </Label>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Swatch chips orbit with hover & click
// ─────────────────────────────────────────────────────────────
function SwatchOrbit({ colors = ["#00E0FF", "#14e3a1", "#f35", "#f5c84b"] }) {
  const chips = useRef([]);
  const [selected, setSelected] = useState(colors[0]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.4;
    chips.current.forEach((m, i) => {
      const a = t + (i / colors.length) * Math.PI * 2;
      const r = 2.9;
      if (m) {
        m.position.set(Math.cos(a) * r, Math.sin(a * 2) * 0.25, Math.sin(a) * r);
        m.rotation.y = a;
        m.scale.setScalar(colors[i] === selected ? 1.2 : 1);
      }
    });
  });

  return (
    <group>
      {colors.map((c, i) => (
        <mesh
          key={c}
          ref={(el) => (chips.current[i] = el)}
          onPointerOver={(e) => e.object.scale.setScalar(1.2)}
          onPointerOut={(e) =>
            e.object.scale.setScalar(c === selected ? 1.2 : 1)
          }
          onClick={() => setSelected(c)}
        >
          <cylinderGeometry args={[0.14, 0.14, 0.06, 24]} />
          <meshStandardMaterial color={c} metalness={0.2} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Perf meter INSIDE Canvas — toggles high/eco modes
// ─────────────────────────────────────────────────────────────
function PerfMeter({ onChange }) {
  const modeRef = useRef(true);
  const last = useRef({ t: 0, frames: 0 });

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    last.current.frames++;
    const dt = now - last.current.t;
    if (dt >= 0.5) {
      const fps = last.current.frames / dt;
      const next = fps >= 55 ? true : fps <= 45 ? false : modeRef.current;
      if (next !== modeRef.current) {
        modeRef.current = next;
        onChange(next);
      }
      last.current.t = now;
      last.current.frames = 0;
    }
  });
  return null;
}

// ─────────────────────────────────────────────────────────────
// Main Hero3D export
// ─────────────────────────────────────────────────────────────
export default function Hero3D() {
  const env = useAppStore((s) => s.env);
  const rot = useAppStore((s) => s.lightRotation);
  const [goodPerf, setGoodPerf] = useState(true);

  return (
    <div className="relative w-full h-[520px] rounded-2xl border border-white/10 overflow-hidden shadow-glow hero3dconf">
      <Canvas
        shadows
        gl={{ antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 1.6, 5], fov: 50 }}
      >
        <PerfMeter onChange={setGoodPerf} />

        <color attach="background" args={["#0B0B12"]} />
        <fog attach="fog" args={["#0B0B12", 8, 16]} />

        <directionalLight
          castShadow
          position={[Math.sin(rot) * 5, 3, Math.cos(rot) * 5]}
          intensity={1.7}
          shadow-mapSize={[1024, 1024]}
        />
        <ambientLight intensity={0.3} />

        <Suspense fallback={<Html center className="text-muted">Loading…</Html>}>
          <Environment preset={env} />
          <ParallaxGroup>
            {/* Depth & focus cues */}
            <HaloRings />
            <Ribbon />

            {/* Main object */}
            <FresnelIcosahedron />

            {/* Value props */}
            <SwatchOrbit />

            {/* Decorative bits & sparkles */}
            <OrbitingBits count={goodPerf ? 36 : 16} dim={!goodPerf} />
            {goodPerf && <Sparkles count={26} scale={6} size={2} speed={0.4} />}
          </ParallaxGroup>
        </Suspense>

        <ContactShadows
          position={[0, -1.1, 0]}
          opacity={0.35}
          scale={10}
          blur={2.8}
          far={4}
        />
        <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />
        <OrbitControls enableZoom={false} />
      </Canvas>

      <div className="absolute left-3 top-3 text-[11px] px-2 py-1 rounded bg-white/10 backdrop-blur border border-white/10">
        {goodPerf ? "High FX" : "Eco Mode"}
      </div>
    </div>
  );
}
