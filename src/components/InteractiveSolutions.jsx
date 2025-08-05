// src/components/InteractiveSolutions.jsx
import React, {
  Suspense,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import * as THREE from "three";

/* ───────── utilities ───────── */
function useIsMobile(bp = 768) {
  const [is, setIs] = useState(
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width:${bp}px)`).matches
      : false
  );
  useEffect(() => {
    const m = window.matchMedia(`(max-width:${bp}px)`);
    const h = (e) => setIs(e.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, [bp]);
  return is;
}

/* Dimension presets */
const DESKTOP = {
  CARD_W: 3.6,
  CARD_H: 4.6,
  CARD_R: 0.28,
  GAP: 3.9,
  CAM_POS: [0, 0.5, 8],
  FOV: 40,
  CANVAS_H: 520,
  ICON_Z: 0.7,
};
const MOBILE = {
  CARD_W: 3.2,
  CARD_H: 3.2,
  CARD_R: 0.22,
  GAP: 3.9,
  CAM_POS: [0, 0.4, 7.2],
  FOV: 52,
  CANVAS_H: 430,
  ICON_Z: 0.7,
};

const NEON = "#12D6FF";
const COPY = "#93A4C6";
const Z_IDLE = 0.0;
const Z_HOV = 0.55;

/* Preload assets */
useGLTF.preload(assetUrl("models/cube_icon.glb"));
useGLTF.preload(assetUrl("models/laptop_icon.glb"));
useGLTF.preload(assetUrl("models/vr_icon.glb"));
useGLTF.preload(assetUrl("models/hand.glb"));

/* ---------------- exact-size wireframe model ---------------- */
export function SizedWireModel({
  url,
  width,
  height,
  fit = "contain",
  color = NEON,
  y = 0.35,
  z = 0.7, // will be overridden by dims.ICON_Z where used
}) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  const neon = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.9,
        });
      }
    });
    return clone;
  }, [scene, color]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (!size.x || !size.y) return;
    let sx, sy, sz;
    if (fit === "nonuniform") {
      sx = width / size.x;
      sy = height / size.y;
      sz = Math.min(sx, sy);
    } else {
      const sContain = Math.min(width / size.x, height / size.y);
      const sCover = Math.max(width / size.x, height / size.y);
      const s = fit === "cover" ? sCover : sContain;
      sx = sy = sz = s;
    }
    ref.current.scale.set(sx, sy, sz);
  }, [width, height, fit, neon]);

  return (
    <Center disableY position={[0, y, z]}>
      <primitive ref={ref} object={neon} />
    </Center>
  );
}

/* ---------------- rounded neon card ---------------- */
function roundedShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function NeonCardFrame({ dims }) {
  const geom = useMemo(
    () =>
      new THREE.ExtrudeGeometry(
        roundedShape(dims.CARD_W, dims.CARD_H, dims.CARD_R),
        { depth: 0.02, bevelEnabled: false }
      ),
    [dims]
  );

  return (
    <group>
      <mesh geometry={geom} position={[0, 0, -0.02]}>
        <meshBasicMaterial transparent opacity={0.08} color={NEON} />
      </mesh>
      <lineSegments geometry={new THREE.EdgesGeometry(geom)}>
        <lineBasicMaterial color={NEON} />
      </lineSegments>
      <mesh position={[0, 0, -0.04]}>
        <extrudeGeometry
          args={[
            roundedShape(
              dims.CARD_W * 1.02,
              dims.CARD_H * 1.02,
              dims.CARD_R * 1.02
            ),
            { depth: 0.01, bevelEnabled: false },
          ]}
        />
        <meshBasicMaterial transparent opacity={0.04} color={NEON} />
      </mesh>
    </group>
  );
}

/* ---------------- single interactive card ---------------- */
function Card({
  idx,
  title,
  copy,
  icon,
  hovered,
  setHovered,
  dims,
  onClickCard, // used on mobile to focus
}) {
  const active = hovered === idx;
  const spring = useSpring({
    posZ: active ? Z_HOV : Z_IDLE,
    scl: active ? 1.06 : 1.0,
    config: { tension: 190, friction: 18, mass: 0.9 },
  });

  return (
    <a.group position={[idx * dims.GAP - dims.GAP, 0, 0]} scale={spring.scl}>
      {/* Hit-plane: stable Z, handles hover (desktop) and click (mobile) */}
      <mesh
        position={[0, 0, 0.02]}
        onPointerEnter={() => setHovered(idx)}
        onPointerLeave={() => setHovered(null)}
        onClick={() => onClickCard?.(idx)}
      >
        <planeGeometry args={[dims.CARD_W * 1.06, dims.CARD_H * 1.06]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <a.group position-z={spring.posZ}>
        <NeonCardFrame dims={dims} />
        {icon}
        <Html
          transform
          distanceFactor={8}
          position={[0, -dims.CARD_H / 2 + 0.65, 0.16]}
          className="is-card-html"
        >
          <div className="is-title">{title}</div>
          <div className="is-copy">{copy}</div>
        </Html>
      </a.group>
    </a.group>
  );
}

/* ---------------- hover hand (desktop only) ---------------- */
function Hand({ hovered, dims }) {
  const { scene } = useGLTF("models/hand.glb");
  const handWire = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshBasicMaterial({
          color: NEON,
          wireframe: true,
          transparent: true,
          opacity: 0.85,
        });
        o.raycast = () => null;
      }
    });
    return clone;
  }, [scene]);

  // Base (center) pose
  const BASE_POS = useMemo(() => [1, -5, 1.2], []);
  const BASE_ROT = useMemo(() => [0.12, Math.PI, 0.03], []);

  const targetPos = useMemo(() => {
    const [bx, by, bz] = BASE_POS;
    const lift = 0.35;
    if (hovered === 0) return [bx - dims.GAP, by + lift, bz];
    if (hovered === 2) return [bx + dims.GAP, by + lift, bz];
    return [bx, by, bz];
  }, [hovered, BASE_POS, dims.GAP]);

  const spring = useSpring({
    to: { position: targetPos, rotation: BASE_ROT },
    config: { mass: 1, tension: 120, friction: 22 },
    precision: 0.0001,
  });

  return (
    <a.primitive
      object={handWire}
      {...spring}
      scale={0.15}
      raycast={null}
      renderOrder={3}
    />
  );
}

/* ---------------- main section (responsive) ---------------- */
export default function InteractiveSolutions() {
  const isMobile = useIsMobile(768);
  const dims = isMobile ? MOBILE : DESKTOP;

  // Desktop uses hover; mobile uses "selected" to slide the deck
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(1); // start on center

  // Keep "hovered" in sync on mobile so labels/styles still highlight
  useEffect(() => {
    if (isMobile) setHovered(selected);
  }, [isMobile, selected]);

  // Slide the whole deck on mobile; static on desktop
  const deck = useSpring({
    x: isMobile ? -selected * dims.GAP + dims.GAP : 0,
    config: { tension: 170, friction: 20 },
  });

  return (
    <section className="max-w-7xl mx-auto mt-16">
      <h2 className="text-4xl font-bold text-center gradient-text mb-2">
        INTERACTIVE 3D SOLUTIONS
      </h2>
      <p className="text-center text-lg text-muted mb-6 interactive-muted">
        Engage your audience with cutting-edge immersive experiences
      </p>

      <div
        className="card overflow-hidden relative"
        style={{ height: dims.CANVAS_H }}
      >
        <Canvas dpr={[1, 2]} camera={{ position: dims.CAM_POS, fov: dims.FOV }}>
          <color attach="background" args={["#070B15"]} />
          <fog attach="fog" args={["#070B15", 12, 20]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 6, 8]} intensity={0.4} />

          <Suspense fallback={<Html center>Loading…</Html>}>
            {/* Deck that slides on mobile */}
            <a.group position-x={deck.x}>
              <Card
                idx={0}
                title="3D CONFIGURATOR"
                copy="Build & embed product customisers."
                icon={
                  <SizedWireModel
                    url="models/cube_icon.glb"
                    width={1.4}
                    height={1.4}
                    z={dims.ICON_Z}
                  />
                }
                hovered={hovered}
                setHovered={(i) => !isMobile && setHovered(i)}
                onClickCard={(i) => isMobile && setSelected(i)}
                dims={dims}
              />

              <Card
                idx={1}
                title="WEB DESIGN"
                copy="Responsive, immersive websites."
                icon={
                  <SizedWireModel
                    url="models/laptop_icon.glb"
                    width={1.8}
                    height={1.2}
                    z={dims.ICON_Z}
                  />
                }
                hovered={hovered}
                setHovered={(i) => !isMobile && setHovered(i)}
                onClickCard={(i) => isMobile && setSelected(i)}
                dims={dims}
              />

              <Card
                idx={2}
                title="VIRTUAL REALITY"
                copy="Turn ideas into metaverse spaces."
                icon={
                  <SizedWireModel
                    url="models/vr_icon.glb"
                    width={1.6}
                    height={1.2}
                    z={dims.ICON_Z}
                  />
                }
                hovered={hovered}
                setHovered={(i) => !isMobile && setHovered(i)}
                onClickCard={(i) => isMobile && setSelected(i)}
                dims={dims}
              />
            </a.group>

            {/* Hand only on desktop */}
            {!isMobile && <Hand hovered={hovered} dims={dims} />}
          </Suspense>

          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>

        {/* Mobile dots */}
        {isMobile && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`h-2.5 w-2.5 rounded-full transition
                  ${selected === i ? "bg-accent" : "bg-white/30"}`}
                aria-label={`Show card ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
