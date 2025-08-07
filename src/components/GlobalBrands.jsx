import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Html,
  OrbitControls,
  Environment,
  Grid,
  Float,
  Torus,
} from '@react-three/drei'
import * as THREE from 'three'
import { assetUrl } from '../lib/assetUrl'

const NEON = '#12D6FF'

// ------------------- 3-D wheel (procedural wireframe) -------------------
function NeonWheel() {
  return (
    <group>
      {/* outer barrel */}
      <mesh>
        <cylinderGeometry args={[1, 1, 0.6, 48, 1, true]} />
        <meshBasicMaterial
          color={NEON}
          wireframe
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5 spokes – quick torus “spoke” rings */}
      {[...Array(5)].map((_, i) => (
        <Torus
          key={i}
          args={[0.25, 0.03, 16, 32]}
          rotation={[Math.PI / 2, 0, (i * Math.PI * 2) / 5]}
        >
          <meshBasicMaterial color={NEON} wireframe transparent opacity={0.8} />
        </Torus>
      ))}
    </group>
  )
}

// --------------------- brand tile (SVG / PNG) ---------------------------
function BrandTile({ img, alt }) {
  const url = assetUrl(`brands/${img}`)         // e.g. /brands/nike.svg

  return (
    <div className="w-40 h-40 xl:w-48 xl:h-48 flex items-center justify-center rounded-xl neon-border global-brands">
      {/* mask-painted logo */}
      <div
        className="neon-logo w-[70%] h-[70%] select-none pointer-events-none"
        aria-label={alt}
        style={{
          mask:        `url(${url}) center / contain no-repeat`,
          WebkitMask:  `url(${url}) center / contain no-repeat`,
        }}
      />
    </div>
  )
}


// ---------------------- main exported section ---------------------------
export default function GlobalBrands() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-24">
      {/* headline */}
      <h2 className="text-4xl md:text-5xl font-bold text-center gradient-text mb-12 tracking-wide">
        GLOBAL BRANDS USING 3D
      </h2>

      {/* content grid */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* left – logos */}
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          <BrandTile img="nike.svg" alt="Nike" />
          <BrandTile img="shopify.svg" alt="Shopify" />
          <BrandTile img="porsche.svg" alt="Porsche" />
          <BrandTile img="samsung.svg" alt="Samsung" />
        </div>

        {/* right – 3-D wheel inside frame */}
        <div className="relative h-[340px] md:h-[420px]">
          <Canvas
            camera={{ position: [3, 1.8, 4], fov: 32 }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
            className="rounded-xl overflow-hidden"
          >
            {/* subtle BG */}
            <color attach="background" args={['#070B15']} />
            <Environment preset="city" background={false} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[4, 5, 8]} intensity={0.4} />

            {/* floor grid */}
            <Grid
              infiniteGrid
              sectionSize={1}
              cellSize={1}
              cellThickness={0.4}
              sectionThickness={0.6}
              fadeDistance={18}
              fadeStrength={1}
              color={NEON}
            />

            {/* wheel */}
            <Float
              rotationIntensity={0.25}
              speed={1.2}
              floatIntensity={0.6}
            >
              <NeonWheel />
            </Float>

            {/* neon frame */}
            <Html
              transform
              distanceFactor={10}
              className="pointer-events-none"
            >
              <div className="absolute inset-0 rounded-xl border border-[#12D6FF]/60" />
            </Html>

            <OrbitControls autoRotate enableZoom={false} />
          </Canvas>

         
        </div>
      </div>
    </section>
  )
}
