import React, { Suspense } from 'react'
import Hero3D from '../components/Hero3D'
import ARQuickPreviewStrip from '../components/ARQuickPreviewStrip'
import SpeedChallenge from '../components/SpeedChallenge'
import ShaderLab from '../components/ShaderLab'
import LightingSandbox from '../components/LightingSandbox'
import InteractiveSolutions from '../components/InteractiveSolutions'
import GlobalBrands from '../components/GlobalBrands'
import RoiSnapshot  from '../components/RoiSnapshot'

export default function Home(){
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 py-12 hero-section">
        <div className="hero-text">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Creative <span className="gradient-text">3D Configurator</span> Websites for Every Business
        </h1>
        <p className="text-muted mt-3 max-w-2xl">Build immersive product experiences with WebGL, AR Quick‑Look, and WebXR. Try the live sections below.</p>
        <div className="mt-6"><a href="#ar" className="btn">Get a Demo</a></div>
        </div>
        <div className="mt-8 hero3d"><Hero3D /></div>
      </section>
      <InteractiveSolutions />
      <ARQuickPreviewStrip />
      <GlobalBrands />
      <ShaderLab />
      <RoiSnapshot />
      <LightingSandbox />
      <SpeedChallenge />

    </div>
  )
}
