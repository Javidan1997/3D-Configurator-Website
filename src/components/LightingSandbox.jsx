import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Html, useGLTF, Center  } from "@react-three/drei";
import { useAppStore } from "../store/useAppStore";
import { assetUrl } from '../lib/assetUrl';
function Helmet({ rotation }) {
  const { scene } = useGLTF(assetUrl("models/coupe.glb"));
  return (
    <primitive
      object={scene}
      scale={1.7}
      rotation={[0, rotation, 0]}
      position={[0, -1.1, 0]}
    />
  );
}

export default function LightingSandbox() {
  /* Zustand state */
  const env      = useAppStore((s) => s.env);
  const setEnv   = useAppStore((s) => s.setEnv);
  const rot      = useAppStore((s) => s.lightRotation);
  const setRot   = useAppStore((s) => s.setLightRotation);

  const presets  = ["studio", "warehouse", "apartment", "city", "park", "lobby"];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <h2 className="text-2xl font-semibold mb-4">Global Lighting Sandbox</h2>

      {/* live viewport */}
          <div className="card overflow-hidden mb-4 h-[420px]">
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.5, 5], fov: 73 }}>

          <color attach="background" args={["#0B0B12"]} />
          <ambientLight intensity={0.25} />
          {/* sun */}
          <directionalLight
            position={[Math.sin(rot) * 5, 3, Math.cos(rot) * 5]}
            intensity={1.4}
          />

          <Suspense fallback={<Html center>Loading…</Html>}>
            <Environment preset={env} background blur={0.4} />

            {/* Center keeps the model’s pivot at the real centre and returns its size */}
            <Center disableY>
              <Helmet rotation={rot} />
            </Center>
          </Suspense>


          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* controls */}
      <div className="card p-4 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">
            Sun rotation: {Math.round(rot * 57.3)}°
          </label>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.01"
            value={rot}
            onChange={(e) => setRot(parseFloat(e.target.value))}
            className="w-full accent-cyan-300"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Environment preset</label>
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            className="w-full bg-white/10 rounded-lg px-3 py-2 sandbox-select" 
          >
            {presets.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
