// src/components/ShaderLab.jsx
import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Sparkles } from "@react-three/drei";

/* tiny uniform helper */
const useUniforms = (init) => {
  const [u, set] = useState(init);
  return [u, (k, v) => set((s) => ({ ...s, [k]: v }))];
};

/* fancy sphere */
function FancySphere({ hue, distort }) {
  const mesh = useRef();
  const mat  = useRef();

  /* shader tweak (runs once) */
  const matOptions = useMemo(
    () => ({
      onBeforeCompile: (shader) => {
        /* uniforms */
        shader.uniforms.uTime    = { value: 0 };
        shader.uniforms.uHue     = { value: hue };
        shader.uniforms.uDistort = { value: distort };

        /* vertex wobble */
        shader.vertexShader = shader.vertexShader
          .replace(
            "void main() {",
            `
            uniform float uTime;
            uniform float uDistort;
            void main() {
          `
          )
          .replace(
            "#include <begin_vertex>",
            `
            #include <begin_vertex>
            transformed += normal * sin(uTime + position.y * 6.0) * 0.12 * uDistort;
          `
          );

        /* prepend helper + modify fragment main */

      const hslFn = `
      vec3 hsl2rgb(vec3 c){
        vec3 p = abs(fract(c.xxx + vec3(0.,0.666,0.333))*6. - 3.);
        return c.z + c.y*clamp(p-1.,0.,1.)*(1.-abs(2.*c.z-1.));
      }`;

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "void main() {",
          `
          ${hslFn}
          uniform float uHue;
          void main() {
        `
        )
          .replace(
            "#include <dithering_fragment>",
            `
            float fres = pow(1.0 - abs(dot(normalize(vNormal), vec3(0,0,1))), 4.0);
            vec3 col = hsl2rgb(vec3(uHue, 0.75, 0.6));
            gl_FragColor.rgb = mix(gl_FragColor.rgb, col, 0.8);
            gl_FragColor.rgb += fres * 1.2;
            #include <dithering_fragment>
          `
          );

        mat.current.userData.shader = shader;
      },
    }),
    []
  );

  /* animate */
  useFrame((_, dt) => {
    mesh.current.rotation.y += dt * 0.35;
    const sh = mat.current.userData.shader;
    if (sh) {
      sh.uniforms.uTime.value    += dt;
      sh.uniforms.uHue.value      = hue;
      sh.uniforms.uDistort.value  = distort;
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.15, 128, 128]} />
      <meshStandardMaterial
        ref={mat}
        transparent
        metalness={0.35}
        roughness={0.15}
        side={2}
        {...matOptions}
      />
    </mesh>
  );
}

/* main component */
export default function ShaderLab() {
  const [u, set] = useUniforms({ hue: 0.66, distort: 0.4 }); // hue in 0-1

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <h2 className="text-2xl font-semibold mb-2">Shader Lab</h2>

      <div className="grid md:grid-cols-[1fr,320px] gap-4">
        {/* 3-D view */}
        <div className="h-[380px] card overflow-hidden relative">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4] }}>
            <color attach="background" args={["#0B0B12"]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[3, 4, 5]} intensity={1.2} />

            <Grid args={[10, 10]} infiniteGrid fadeDistance={30} cellSize={0.6} color="#242852" />
            <Sparkles count={60} scale={8} size={1} speed={0.4} />

            <Suspense fallback={null}>
              <FancySphere hue={u.hue} distort={u.distort} />
            </Suspense>

            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* sliders */}
        <div className="card p-4">
          <div className="mb-5">
            <label className="block text-sm mb-1">
              Hue: {Math.round(u.hue * 360)}°
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={u.hue}
              onChange={(e) => set("hue", parseFloat(e.target.value))}
              className="w-full accent-cyan-300"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm mb-1">
              Distortion: {u.distort.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={u.distort}
              onChange={(e) => set("distort", parseFloat(e.target.value))}
              className="w-full accent-cyan-300"
            />
          </div>

          <p className="text-sm text-muted">
            Adjust parameters and watch the sphere pulse ⚡
          </p>
        </div>
      </div>
    </section>
  );
}
