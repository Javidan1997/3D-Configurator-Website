import React, { useEffect, useRef } from 'react'

// single source for the neon tint ─ adjust once here
export const NEON = '#12D6FF'

const METRICS = [
  { label: 'conversion rate', value: 35 },
  { label: 'customer engagement', value: 50 },
  { label: 'higher AOV', value: 25 },
]

export default function RoiSnapshot() {
  const gaugeRefs = useRef([])

  /* Animate radial gauges the first time they enter the viewport */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.dataset.active = '1' // CSS will pick this up
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.4 }
    )
    gaugeRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="roi-section">
      <div className="roi-panel">
        {/* ───────── title strip ───────── */}
        <h2 className="roi-title">ROI SNAPSHOT</h2>

        {/* ───────── main grid ───────── */}
        <div className="roi-grid">
          {/* left: animated bar-chart + growth arrow */}
          <svg
            className="roi-bars"
            viewBox="0 0 420 420"
            aria-hidden="true"
            stroke={NEON}
            strokeWidth="2"
            fill="none"
          >
            {/* bars */}
            <g className="bars">
              <rect x="55" y="230" width="55" height="120" rx="3" />
              <rect x="145" y="165" width="55" height="185" rx="3" />
              <rect x="235" y="115" width="55" height="235" rx="3" />
              <rect x="325" y="65" width="55" height="285" rx="3" />
            </g>

            {/* arrow path */}
            <g className="arrow">
              <path d="M70 330 C160 180 260 180 350 60" />
              <polyline points="350 60 325 80 355 85 350 60" />
            </g>
          </svg>

          {/* right: radial gauges */}
          <ul className="roi-metrics">
            {METRICS.map((m, i) => (
              <li key={m.label} className="roi-item">
                <svg
                  ref={(el) => (gaugeRefs.current[i] = el)}
                  className="roi-gauge"
                  viewBox="0 0 120 120"
                  data-value={m.value}
                >
                  <circle className="track" cx="60" cy="60" r="52" />
                  <circle className="progress" cx="60" cy="60" r="52" />
                  <text x="50%" y="50%" dy="7" textAnchor="middle">
                    +{m.value}%
                  </text>
                </svg>
                <span className="roi-label">{m.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
