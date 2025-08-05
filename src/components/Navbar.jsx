// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const cx = (...c) => c.filter(Boolean).join(" ");
const NavItem = ({ to, children, onNavigate }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cx(
        "px-3 py-2 rounded-lg hover:bg-white/5",
        isActive && "text-accent"
      )
    }
    onClick={onNavigate}
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on ESC and click outside the panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    // prevent body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onNavigate = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-primary/70 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-wide">
          <span className="gradient-text">Creative 3D</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavItem to="/xr">XR Playground</NavItem>
          <NavItem to="/vr">VR Showroom</NavItem>
          <NavItem to="/solutions">Solutions</NavItem>
          <NavItem to="/technology">Technology</NavItem>
          <NavItem to="/pricing">Pricing</NavItem>
          <NavItem to="/docs">Docs</NavItem>
          <NavItem to="/contact">Contact</NavItem>
          <a href="#ar" className="btn ml-2">Try in AR</a>
        </nav>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          {/* hamburger icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white/90">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Panel */}
          <div
            ref={panelRef}
            className="absolute right-0 top-0 h-full w-80 max-w-[82%] bg-primary/95 border-l border-white/10 shadow-2xl
                       animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
              <span className="font-semibold tracking-wide gradient-text">Creative 3D</span>
              <button
                className="p-2 rounded-lg hover:bg-white/5"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                {/* X icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <nav className="p-3 flex flex-col gap-1 text-base">
              <NavItem to="/xr" onNavigate={onNavigate}>XR Playground</NavItem>
              <NavItem to="/vr" onNavigate={onNavigate}>VR Showroom</NavItem>
              <NavItem to="/solutions" onNavigate={onNavigate}>Solutions</NavItem>
              <NavItem to="/technology" onNavigate={onNavigate}>Technology</NavItem>
              <NavItem to="/pricing" onNavigate={onNavigate}>Pricing</NavItem>
              <NavItem to="/docs" onNavigate={onNavigate}>Docs</NavItem>
              <NavItem to="/contact" onNavigate={onNavigate}>Contact</NavItem>

              <a
                href="#ar"
                onClick={onNavigate}
                className="btn mt-2"
              >
                Try in AR
              </a>
            </nav>

            {/* Footer/CTA */}
            <div className="mt-auto p-4 text-xs text-white/60">
              © {new Date().getFullYear()} Creative 3D
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
