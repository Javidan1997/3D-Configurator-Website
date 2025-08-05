// src/components/SpeedChallenge.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  PresentationControls,
  OrbitControls,
  Sparkles,
  Html,
} from "@react-three/drei";
import { useAppStore } from "../store/useAppStore";

/* ——— Game options ——— */
const colors  = ["#308CFF", "#14e3a1", "#f35", "#f5c84b"];
const bodies  = ["Cube", "Pyramid", "Cylinder"]; // changed
const wheels  = ["Thin", "Chunky"];              // changed

/* ——— Reusable primitive shapes ——— */
function BodyGeom({ type }) {
  switch (type) {
    case "Pyramid":
      return <coneGeometry args={[0.7, 0.7, 4]} />;
    case "Cylinder":
      return <cylinderGeometry args={[0.45, 0.45, 0.9, 32]} />;
    default: // Cube
      return <boxGeometry args={[1, 0.5, 0.5]} />;
  }
}

function WheelsGeom({ variant }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
      <torusGeometry args={[0.65, variant === "Thin" ? 0.06 : 0.15, 16, 64]} />
      <meshStandardMaterial color="#999" metalness={0.1} roughness={0.6} />
    </mesh>
  );
}

/* ——— Preview card ——— */
function ConfigPreview({ config, label }) {
  const clr   = config.color  || colors[0];
  const body  = config.body   || bodies[0];
  const wheel = config.wheels || wheels[0];

  return (
    <div className="w-full h-40 bg-[#111] rounded-lg mb-4 relative">
      <Canvas dpr={[1, 1.5]} camera={{ position: [1.6, 1.2, 2], fov: 45 }}>
        <color attach="background" args={["#0B0B12"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={0.5} />
        <Sparkles count={25} scale={3} size={2} speed={1} />

        <Suspense fallback={<Html>…</Html>}>
          <PresentationControls
            global
            rotation={[0.2, 0.4, 0]}
            polar={[-0.3, 0.3]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            speed={1.2}
            zoom={0.8}
          >
            <mesh>
              <BodyGeom type={body} />
              <meshStandardMaterial
                color={clr}
                metalness={0.25}
                roughness={0.5}
              />
            </mesh>
            <WheelsGeom variant={wheel} />
          </PresentationControls>
        </Suspense>

        <OrbitControls enableZoom={false} />
      </Canvas>

      <div className="absolute top-2 left-2 text-xs text-white/80">{label}</div>
    </div>
  );
}

/* ——— Main game component ——— */
export default function SpeedChallenge() {
  const { time, tick, resetGame, target, choice, setChoice } = useAppStore();
  const [running, setRunning] = useState(false);
  const raf = useRef();

  /* timer */
  useEffect(() => {
    if (running) {
      const loop = () => {
        tick();
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf.current);
    }
  }, [running]);

  /* victory */
  useEffect(() => {
    if (
      running &&
      choice.color === target.color &&
      choice.body === target.body &&
      choice.wheels === target.wheels
    ) {
      setRunning(false);
      alert(`🎉 Done in ${time.toFixed(2)} s!`);
    }
  }, [choice, running, time, target]);

  const start = () => {
    resetGame();
    setRunning(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Speed-Match Challenge</h2>
        <div className="text-xl tabular-nums">⏱ {time.toFixed(2)} s</div>
      </div>

      {/* previews */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <ConfigPreview config={target} label="Target" />
        <ConfigPreview config={choice} label="Your Pick" />
      </div>

      {/* controls */}
      <div className="card p-5">
        <div className="text-sm text-muted mb-3">
          Match the target config as fast as possible.
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Color */}
          <div>
            <div className="font-medium mb-1">Color</div>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setChoice("color", c)}
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    background: c,
                    borderColor:
                      choice.color === c ? "#00E0FF" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div>
            <div className="font-medium mb-1">Body</div>
            <div className="flex gap-2">
              {bodies.map((b) => (
                <button
                  key={b}
                  onClick={() => setChoice("body", b)}
                  className={`px-3 py-1 rounded-lg ${
                    choice.body === b
                      ? "bg-accent text-black"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Wheels */}
          <div>
            <div className="font-medium mb-1">Wheels</div>
            <div className="flex gap-2">
              {wheels.map((w) => (
                <button
                  key={w}
                  onClick={() => setChoice("wheels", w)}
                  className={`px-3 py-1 rounded-lg ${
                    choice.wheels === w
                      ? "bg-accent text-black"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={start} className="btn w-full text-center">
          {running ? "Running…" : "Start"}
        </button>
      </div>
    </section>
  );
}
