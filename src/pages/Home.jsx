import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLumaEvents } from '../data/lumaEvents'
import { chapters, branchCalendarUrl } from '../data/chaptersPageData'
import { aiComputeMeta } from '../data/aiComputeData'
import { BRANCH_EMAIL, MAILING_LIST_URL } from '../data/homeData'
import { SCENES, ZOOM, C, formatScale } from '../lib/journeyScenes'

/*
 * Home: a "powers of ten" zoom-out. The stage stays pinned while the page scrolls; the
 * camera pulls back from a single transistor to the whole community, and each scale
 * carries one part of the site. Drawing lives in lib/journeyScenes.js.
 */

const N = SCENES.length
const SEGMENT_VH = 130 // scroll distance per scale
const DWELL = 0.42 // share of each segment the camera holds still
const TAIL = 0.5 // extra scroll at the end so the last scale holds before the footer
const BLOOM = 0.55 // strength of the glow pass

const TIME_ZONE = 'America/Los_Angeles'
const dateFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: '2-digit' })

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function isSymposium(ev) {
  return ev.href === aiComputeMeta.lumaUrl
}

// Camera position (in scales) for a scroll position u in [0, N-1], holding still at each scale.
function cameraFor(u) {
  const seg = Math.min(N - 2, Math.floor(u))
  const f = u - seg
  return seg + smooth(DWELL, 1, f)
}

// Opacity of scene i's text for a scroll position u.
function textAlpha(i, u) {
  const fadeIn = i === 0 ? 1 : smooth(i - 0.12, i + 0.02, u)
  const fadeOut = i === N - 1 ? 1 : 1 - smooth(i + DWELL - 0.12, i + DWELL - 0.01, u)
  return fadeIn * fadeOut
}

// Scene layer opacity for camera position z.
function layerAlpha(i, z) {
  const fadeIn = i === 0 ? 1 : smooth(i - 1, i - 0.45, z)
  const fadeOut = 1 - smooth(i + 1.2, i + 1.8, z)
  return fadeIn * fadeOut
}

export default function Home() {
  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const panelRefs = useRef([])
  const railRefs = useRef([])
  const scaleRef = useRef(null)
  const cueRef = useRef(null)

  const luma = useLumaEvents()
  const events = useMemo(() => {
    const up = luma.status === 'ready' ? luma.upcoming : []
    return [...up.filter(isSymposium), ...up.filter((ev) => !isSymposium(ev))].slice(0, 4)
  }, [luma])

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const track = trackRef.current
    if (!canvas || !stage || !track) return
    const ctx = canvas.getContext('2d')
    // Half-resolution buffer for the bloom pass; skipped where canvas filters are unsupported.
    const glow = document.createElement('canvas')
    const gctx = glow.getContext('2d')
    const canBloom = typeof gctx.filter === 'string'
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let uTarget = 0
    let u = 0
    let z = 0
    let t0 = 0
    let last = performance.now()
    let raf
    const mouse = { x: 0, y: 0, in: false }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = stage.clientWidth
      h = stage.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      glow.width = Math.max(1, Math.round(w / 2))
      glow.height = Math.max(1, Math.round(h / 2))
    }

    function readScroll() {
      const rect = track.getBoundingClientRect()
      const span = track.offsetHeight - stage.offsetHeight
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0
      uTarget = p * (N - 1 + TAIL)
    }

    function layout() {
      return w >= 820
        ? { cx: w * 0.64, cy: h * 0.5, R: Math.min(h * 0.4, w * 0.27) }
        : { cx: w * 0.5, cy: h * 0.64, R: Math.min(w * 0.44, h * 0.28) }
    }

    function draw() {
      const { cx, cy, R } = layout()
      // A touch of parallax from the pointer
      const ccx = cx + (mouse.in ? (mouse.x - cx) * -0.012 : 0)
      const ccy = cy + (mouse.in ? (mouse.y - cy) * -0.012 : 0)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalAlpha = 1
      ctx.fillStyle = C.bg
      ctx.fillRect(0, 0, w, h)

      const alphas = SCENES.map((_, i) => layerAlpha(i, z))
      for (let i = N - 1; i >= 0; i--) {
        const a = alphas[i]
        if (a < 0.005) continue
        const S = R * Math.pow(ZOOM, i - z) // pixels per unit for this scene
        if (S < R / Math.pow(ZOOM, 2.2)) continue
        const v = {
          px: 1 / S,
          t0,
          l: -ccx / S,
          r: (w - ccx) / S,
          t: -ccy / S,
          b: (h - ccy) / S,
          focus: 1 - Math.min(1, Math.abs(z - i) * 1.6),
          inner: i > 0 ? alphas[i - 1] : 0,
          mouse: mouse.in ? { x: (mouse.x - ccx) / S, y: (mouse.y - ccy) / S } : null,
        }
        const transform = () => ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * ccx, dpr * ccy)
        if (z <= i) {
          ctx.save()
          transform()
          ctx.globalAlpha = a
          SCENES[i].draw(ctx, v)
          ctx.restore()
          continue
        }
        // Past this scene, it shrinks into its parent's center square: the part outside
        // that square fades out while the square itself stays opaque.
        const outside = 1 - smooth(i, i + 0.55, z)
        if (outside > 0.01) {
          ctx.save()
          transform()
          ctx.globalAlpha = a * outside
          SCENES[i].draw(ctx, v)
          ctx.restore()
        }
        ctx.save()
        transform()
        ctx.globalAlpha = a
        ctx.beginPath()
        ctx.rect(-1, -1, 2, 2)
        ctx.clip()
        ctx.fillStyle = C.bg
        ctx.fillRect(-1, -1, 2, 2)
        SCENES[i].draw(ctx, v)
        ctx.restore()
      }

      // Bloom: blur a downscaled copy and add it back so glowing parts read as light
      if (canBloom) {
        gctx.globalCompositeOperation = 'copy'
        gctx.filter = 'blur(6px)'
        gctx.drawImage(canvas, 0, 0, glow.width, glow.height)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = BLOOM
        ctx.drawImage(glow, 0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }

      // Vignette keeps the eye on the drawing
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const vg = ctx.createRadialGradient(ccx, ccy, R * 0.9, ccx, ccy, Math.max(w, h) * 0.8)
      vg.addColorStop(0, 'rgba(4, 6, 10, 0)')
      vg.addColorStop(1, 'rgba(4, 6, 10, 0.88)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)

      // Overlays, rail and scale readout follow the same scroll position
      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const a = textAlpha(i, u)
        el.style.opacity = a.toFixed(3)
        el.style.transform = `translate3d(0, ${((1 - a) * 18).toFixed(1)}px, 0)`
        el.style.visibility = a < 0.02 ? 'hidden' : 'visible'
        el.style.pointerEvents = a > 0.6 ? 'auto' : 'none'
      })
      const active = Math.round(z)
      railRefs.current.forEach((el, i) => el?.classList.toggle('is-active', i === active))
      if (scaleRef.current) {
        const lo = Math.min(N - 2, Math.floor(z))
        const f = z - lo
        const m = Math.exp(Math.log(SCENES[lo].scale) * (1 - f) + Math.log(SCENES[lo + 1].scale) * f)
        scaleRef.current.textContent = `≈ ${formatScale(m)}`
      }
      if (cueRef.current) cueRef.current.style.opacity = (1 - smooth(0.05, 0.25, u)).toFixed(3)
    }

    function frame(now) {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!still) t0 += dt
      const k = still ? 1 : 1 - Math.exp(-dt * 6)
      u += (uTarget - u) * k
      if (Math.abs(uTarget - u) < 1e-4) u = uTarget
      z += (cameraFor(u) - z) * k
      draw()
    }

    const onMove = (e) => {
      const rect = stage.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.in = true
    }
    const onLeave = () => {
      mouse.in = false
    }

    resize()
    readScroll()
    u = uTarget
    z = cameraFor(u)
    const ro = new ResizeObserver(() => {
      resize()
      readScroll()
    })
    ro.observe(stage)
    window.addEventListener('scroll', readScroll, { passive: true })
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      stage.addEventListener('mousemove', onMove)
      stage.addEventListener('mouseleave', onLeave)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', readScroll)
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  function jumpTo(i) {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return
    const span = track.offsetHeight - stage.offsetHeight
    const top = track.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + (i / (N - 1 + TAIL)) * span, behavior: 'smooth' })
  }

  const setPanel = (i) => (el) => {
    panelRefs.current[i] = el
  }

  return (
    <div className="jr">
      <div ref={trackRef} className="jr-track" style={{ height: `calc(${(N - 1 + TAIL) * SEGMENT_VH}vh + 100svh)` }}>
        <div ref={stageRef} className="jr-stage">
          <canvas ref={canvasRef} className="jr-canvas" aria-hidden="true" />
          <div className="jr-scrim" aria-hidden="true" />

          <div className="jr-panels">
            <section ref={setPanel(0)} className="jr-panel" aria-label="Introduction">
              <p className="jr-eyebrow">Stanford IEEE Student Branch · est. 2001</p>
              <h1 className="jr-title">
                Hardware, software, <span>and systems.</span>
              </h1>
              <Link to={aiComputeMeta.path} className="jr-pill">
                <span className="jr-pill-dot" aria-hidden="true" />
                <span className="jr-pill-when">Nov 13</span>
                <span>
                  AI Compute Orchestration <em>S2S</em>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </section>

            <section ref={setPanel(1)} className="jr-panel" aria-label="Upcoming events">
              <p className="jr-eyebrow">Upcoming</p>
              <ul className="jr-events">
                {luma.status === 'loading' && <li className="jr-muted">Loading…</li>}
                {luma.status === 'error' && (
                  <li>
                    <a href={branchCalendarUrl} target="_blank" rel="noreferrer">See the Luma calendar ↗</a>
                  </li>
                )}
                {events.map((ev) => (
                  <li key={ev.id}>
                    <a href={ev.href} target="_blank" rel="noreferrer" className={isSymposium(ev) ? 'is-featured' : ''}>
                      <span className="jr-date">{dateFmt.format(ev.date)}</span>
                      <span className="jr-event-title">{ev.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <Link to="/events" className="jr-link">All events →</Link>
            </section>

            <section ref={setPanel(2)} className="jr-panel" aria-label="Chapters">
              <p className="jr-eyebrow">Chapters</p>
              <ul className="jr-chapters">
                {chapters.map((ch) => (
                  <li key={ch.id}>
                    <Link to={ch.chapterPage.path} style={{ '--accent': ch.accent }}>
                      <span className="jr-chapter-short">{ch.short}</span>
                      <span className="jr-chapter-name">{ch.summaryTitle.split('—')[1]?.trim()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section ref={setPanel(3)} className="jr-panel" aria-label="AI Compute symposium">
              <p className="jr-eyebrow jr-eyebrow--violet">Nov 13 · Allen 101X</p>
              <h2 className="jr-serif">
                AI Compute Orchestration <em>S2S</em>
              </h2>
              <div className="jr-actions">
                <a href={aiComputeMeta.lumaUrl} target="_blank" rel="noreferrer" className="jr-btn jr-btn--primary">
                  Register
                </a>
                <Link to={aiComputeMeta.path} className="jr-btn">Program</Link>
              </div>
            </section>

            <section ref={setPanel(4)} className="jr-panel" aria-label="Speakers and partners">
              <p className="jr-eyebrow">On the board</p>
              <h2 className="jr-h2">Past speakers</h2>
              <div className="jr-actions">
                <Link to="/events" className="jr-btn">Archive</Link>
                <a href={`mailto:${BRANCH_EMAIL}?subject=${encodeURIComponent('Speaking at Stanford IEEE')}`} className="jr-btn">
                  Speak or sponsor
                </a>
              </div>
            </section>

            <section ref={setPanel(5)} className="jr-panel" aria-label="Get involved">
              <h2 className="jr-h2 jr-h2--lg">Get involved</h2>
              <div className="jr-actions">
                <a href={MAILING_LIST_URL} target="_blank" rel="noreferrer" className="jr-btn jr-btn--primary">
                  Mailing list
                </a>
                <a href={branchCalendarUrl} target="_blank" rel="noreferrer" className="jr-btn">Luma ↗</a>
                <Link to="/team" className="jr-btn">Team</Link>
              </div>
            </section>
          </div>

          <nav className="jr-rail" aria-label="Zoom level">
            {SCENES.map((s, i) => (
              <button key={s.id} type="button" ref={(el) => (railRefs.current[i] = el)} onClick={() => jumpTo(i)}>
                <span className="jr-rail-name">{s.name}</span>
                <span className="jr-rail-tick" aria-hidden="true" />
              </button>
            ))}
          </nav>

          <div className="jr-hud" aria-hidden="true">
            <span className="jr-hud-label">Scale</span>
            <span ref={scaleRef} className="jr-hud-value">≈ 12 nm</span>
          </div>
          <div ref={cueRef} className="jr-cue" aria-hidden="true">
            <span>Scroll to zoom out</span>
            <span className="jr-cue-line" />
          </div>
        </div>
      </div>
    </div>
  )
}
