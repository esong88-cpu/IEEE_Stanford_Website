/*
 * Exploded view of an AI accelerator package (from the AI Compute design): substrate,
 * microbumps, interposer, compute die with HBM stacks, heat spreader, and a system
 * board above. Pure CSS 3D; styles live under "AI Compute (S2S)" in index.css.
 */

// 300×300 plane. x, y, w, d in px; t = thickness; z = height.
const SLABS = [
  { x: 0, y: 0, w: 300, d: 300, t: 14, z: 0, top: 'f-sub', side: 'sub' },
  { x: 38, y: 38, w: 224, d: 224, t: 0, z: 58, top: 'f-bump', side: 'none' },
  { x: 38, y: 38, w: 224, d: 224, t: 8, z: 96, top: 'f-int', side: 'int' },
  { x: 54, y: 62, w: 42, d: 70, t: 30, z: 142, top: 'f-hbm', side: 'hbm' },
  { x: 54, y: 168, w: 42, d: 70, t: 30, z: 142, top: 'f-hbm', side: 'hbm' },
  { x: 106, y: 66, w: 92, d: 168, t: 10, z: 142, top: 'f-die', side: 'die' },
  { x: 208, y: 62, w: 42, d: 70, t: 30, z: 142, top: 'f-hbm', side: 'hbm' },
  { x: 208, y: 168, w: 42, d: 70, t: 30, z: 142, top: 'f-hbm', side: 'hbm' },
  { x: 30, y: 30, w: 240, d: 240, t: 6, z: 232, top: 'f-lid', side: 'lid' },
  { x: -10, y: -10, w: 320, d: 320, t: 0, z: 318, top: 'f-sys', side: 'none' },
]
// Breathing phase per layer group (substrate, bumps, interposer, dies, lid, system)
const PHASE = [0, 1, 2, 3, 3, 3, 3, 3, 4, 5]
const GUIDES = [{ x: 38, y: 38 }, { x: 262, y: 38 }, { x: 38, y: 262 }, { x: 262, y: 262 }]
// Callouts beside each layer (top in px within the art box)
const LABELS = [
  { text: 'Systems', top: 168, line: 80, color: '#E06A5F' },
  { text: 'Heat spreader', top: 246, line: 64, color: '#A8A29A' },
  { text: 'Compute die · HBM', top: 318, line: 44, color: '#C9B6F2' },
  { text: 'Silicon interposer', top: 364, line: 56, color: '#A8A29A' },
  { text: 'Microbumps', top: 400, line: 80, color: '#E6A472' },
  { text: 'Package substrate', top: 456, line: 64, color: '#A8A29A' },
]

export default function PackageArt({ labels = true, className = '' }) {
  return (
    <div
      className={`s2s-scene-wrap ${className}`}
      role="img"
      aria-label="Exploded view of an AI accelerator package: substrate, microbumps, silicon interposer, compute die with HBM stacks, heat spreader, and a system board above"
    >
      <div className="s2s-hero-glow" aria-hidden="true" />
      <div className="s2s-scene">
        <div className="s2s-rig">
          <div className="s2s-floor" />
          {GUIDES.map((g) => (
            <div key={`${g.x}-${g.y}`} className="s2s-guide" style={{ left: g.x, top: g.y }} />
          ))}
          {SLABS.map((s, i) => (
            <div
              key={i}
              className="s2s-p3 s2s-slab"
              style={{ left: s.x, top: s.y, width: s.w, height: s.d, transform: `translateZ(${s.z}px)` }}
            >
              <div className="s2s-p3 s2s-breathe" style={{ animationDelay: `${(-PHASE[i] * 0.55).toFixed(2)}s` }}>
                {s.side !== 'none' && (
                  <>
                    <div className={`s2s-face-left s-${s.side}-l`} style={{ width: s.t }} />
                    <div className={`s2s-face-front s-${s.side}-f`} style={{ height: s.t }} />
                  </>
                )}
                <div className={`s2s-face-top ${s.top}`} style={{ transform: `translateZ(${s.t}px)` }} />
              </div>
            </div>
          ))}
          <div className="s2s-rise" />
        </div>
      </div>
      {labels &&
        LABELS.map((l) => (
          <div key={l.text} className="s2s-callout" aria-hidden="true" style={{ top: l.top }}>
            <span className="s2s-callout-line" style={{ width: l.line }} />
            <span style={{ color: l.color }}>{l.text}</span>
          </div>
        ))}
    </div>
  )
}
