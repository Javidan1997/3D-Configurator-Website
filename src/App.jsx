import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import XRPlayground from './pages/XRPlayground'
import VRShowroom from './pages/VRShowroom'
import Solutions from './pages/Solutions'
import Technology from './pages/Technology'
import Pricing from './pages/Pricing'
import Blog from './pages/Blog'
import Docs from './pages/Docs'
import Contact from './pages/Contact'

export default function App(){
  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/xr" element={<XRPlayground />} />
          <Route path="/vr" element={<VRShowroom />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
