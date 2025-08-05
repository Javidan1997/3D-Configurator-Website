// src/components/ARQuickPreviewStrip.jsx

import React, { useRef } from "react";
import { assetUrl } from '../lib/assetUrl';
// Three items with only glb + usdz—no poster PNG
const items = [
  { name: "Sneaker", glb: "models/sneaker.glb", usdz: "models/sneaker.usdz" },
  { name: "Chair",   glb: "models/chair.glb",   usdz: "models/chair.usdz" },
  { name: "Helmet",  glb: "models/helmet.glb",  usdz: "models/helmet.usdz" },
];

export default function ARQuickPreviewStrip() {
  return (
    <section id="ar" className="max-w-7xl mx-auto px-4 mt-12">
      <h2 className="text-2xl font-semibold mb-4">AR Quick-Preview</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map(({ name, glb, usdz }) => (
          <Card key={name} name={name} glb={glb} usdz={usdz} />
        ))}
      </div>
    </section>
  );
}

function Card({ name, glb, usdz }) {
  const mvRef = useRef();

  const handleAR = () => {
    // activateAR() works even if the AR icon isn't visible
    mvRef.current?.activateAR();
  };

  return (
    <div className="card p-4 flex flex-col">
      {/* model-viewer loaded globally from CDN */}
      <model-viewer
        ref={mvRef}
        src={glb}
        ios-src={usdz}
        alt={name}
        environment-image="neutral"
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        exposure="1"
        style={{
          width: "100%",
          height: "260px",
          borderRadius: "0.75rem",
          background: "rgba(0,0,0,0.1)",
        }}
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="font-medium">{name}</div>
        <button onClick={handleAR} className="btn px-4 py-2 text-sm">
          View in AR
        </button>
      </div>
    </div>
  );
}
