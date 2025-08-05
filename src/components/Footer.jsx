import React from 'react'
import { Link } from 'react-router-dom'
export default function Footer(){
  return (
    <footer className="bg-surface/60 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-semibold gradient-text">Creative 3D Configurators</div>
          <p className="text-sm text-muted mt-2">Your product, in 3D—anywhere.</p>
        </div>
        <div className="text-sm grid grid-cols-2 gap-2">
          <Link to="/solutions" className="link">Solutions</Link>
          <Link to="/technology" className="link">Technology</Link>
          <Link to="/pricing" className="link">Pricing</Link>
          <Link to="/docs" className="link">Docs</Link>
        </div>
        <div className="text-sm text-muted">
          © 2025 • <a className="link" href="#">Privacy</a> • <a className="link" href="#">Terms</a>
          <div className="mt-2"><a className="link" href="#">LinkedIn</a> · <a className="link" href="#">X</a> · <a className="link" href="#">Behance</a></div>
        </div>
      </div>
    </footer>
  )
}
