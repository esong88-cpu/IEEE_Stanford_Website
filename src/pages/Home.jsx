import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLumaEvents } from '../data/lumaEvents'
import { chapters, branchCalendarUrl } from '../data/chaptersPageData'
import { aiComputeMeta } from '../data/aiComputeData'
import { BRANCH_EMAIL, MAILING_LIST_URL } from '../data/homeData'
import { SCENES, BG, textures, formatLength } from '../lib/journeyScenes'

/*
 * Home: a "powers of ten" zoom-out. The stage fills the viewport and each scroll, swipe or
 * arrow key flies the camera one scale out (or in), from one transistor to the things this
 * hardware runs. Each scale carries one part of the site. Drawing lives in lib/journeyScenes.js.
 */

const N = SCENES.length
const FLIGHT_MS = 1400 // one scale to the next
const EXTRA_MS = 350 // added per extra scale when jumping several at once
const WHEEL_STEP = 24 // wheel delta that counts as a deliberate scroll
const WHEEL_QUIET_MS = 200 // a gesture ends once the wheel (and trackpad momentum) goes quiet
const SWIPE_PX = 40
const BLOOM = 0.85
const MAX_DPR = 1.5
const IDLE_FPS = 30 // once scrolling settles, the slow pulses don't need 60fps
const GRAIN = 0.05
const SCALE_BAR_PX = 72

const SECTIONS = ['Home', 'Events', 'Chapters', 'Symposium', 'Speakers', 'Partner', 'Join']
const PAST_SPEAKERS = ['Steve Wozniak', 'John Hennessy', 'Andy Bechtolsheim', 'Andrew Feldman', 'George Kurian', 'Richard Ho']

// Log-zoom position of each scene: scene i is k_i times larger than scene i-1.
const LOG = SCENES.reduce((acc, s, i) => [...acc, i ? acc[i - 1] + Math.log(s.k) : 0], [])

const TIME_ZONE = 'America/Los_Angeles'
const dateFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: '2-digit' })

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function isSymposium(ev) {
  return ev.href === aiComputeMeta.lumaUrl
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// Limit a scene's visible extents to a square of half-size r around its center.
function cropView(v, r) {
  return { ...v, l: Math.max(v.l, -r), r: Math.min(v.r, r), t: Math.max(v.t, -r), b: Math.min(v.b, r) }
}

function logZoomAt(z) {
  const lo = Math.min(N - 2, Math.floor(z))
  return LOG[lo] + (z - lo) * (LOG[lo + 1] - LOG[lo])
}

// Only the scene being left and the one being reached show text; the old one fades out as
// the camera leaves and the new one fades in as it arrives.
function textAlpha(i, u, from, to) {
  if (i !== from && i !== to) return 0
  return 1 - smooth(0.04, 0.3, Math.abs(u - i))
}

function layerAlpha(i, z) {
  const fadeIn = i === 0 ? 1 : smooth(i - 1, i - 0.45, z)
  // The cross-section hands off to the top-down view drawn by the next scene.
  const fadeOut = i === 0 ? 1 - smooth(0.5, 0.92, z) : 1 - smooth(i + 1.2, i + 1.8, z)
  return fadeIn * fadeOut
}

export default function Home() {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const panelRefs = useRef([])
  const railRefs = useRef([])
  const scaleRef = useRef(null)
  const cueRef = useRef(null)
  const jumpRef = useRef(null)
  const goRef = useRef(() => {})

  const luma = useLumaEvents()
  const events = useMemo(() => {
    const up = luma.status === 'ready' ? luma.upcoming : []
    return [...up.filter(isSymposium), ...up.filter((ev) => !isSymposium(ev))].slice(0, 4)
  }, [luma])
  const nextEvent = luma.status === 'ready' ? luma.upcoming[0] : null

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const ctx = canvas.getContext('2d')
    const tex = textures()
    // Half-resolution buffer for the bloom pass; skipped where canvas filters are unsupported.
    const glowBuf = document.createElement('canvas')
    const gctx = glowBuf.getContext('2d')
    const canBloom = typeof gctx.filter === 'string'
    const grain = ctx.createPattern(tex.grain, 'repeat')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let visible = true

    let w = 0
    let h = 0
    let dpr = 1
    // u is the camera position in scenes; a flight eases it from one scene to another
    let u = 0
    let from = 0
    let to = 0
    let flight = null
    let t0 = 0
    let last = performance.now()
    let raf
    let lastDraw = 0

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      w = stage.clientWidth
      h = stage.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      glowBuf.width = Math.max(1, Math.round(w / 4))
      glowBuf.height = Math.max(1, Math.round(h / 4))
    }

    function go(i) {
      const next = Math.max(0, Math.min(N - 1, i))
      if (next === to || flight) return
      from = to
      to = next
      if (still) {
        u = to
        from = to
        return
      }
      const dur = FLIGHT_MS + EXTRA_MS * (Math.abs(to - from) - 1)
      flight = { a: u, b: to, start: performance.now(), dur }
    }
    goRef.current = go

    function layout() {
      return w >= 820
        ? { cx: w * 0.64, cy: h * 0.5, R: Math.min(h * 0.4, w * 0.27) }
        : { cx: w * 0.5, cy: h * 0.64, R: Math.min(w * 0.44, h * 0.28) }
    }

    function draw() {
      if (!w || !h) return // not laid out yet
      const { cx: ccx, cy: ccy, R } = layout()
      const z = u
      const Lz = logZoomAt(z)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalAlpha = 1
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, w, h)

      const alphas = SCENES.map((_, i) => layerAlpha(i, z))
      for (let i = N - 1; i >= 0; i--) {
        const a = alphas[i]
        if (a < 0.005 || LOG[i] - Lz < -Math.log(80)) continue
        const S = R * Math.exp(LOG[i] - Lz) // pixels per unit for this scene
        const v = {
          px: 1 / S,
          t0,
          dpr,
          l: -ccx / S,
          r: (w - ccx) / S,
          t: -ccy / S,
          b: (h - ccy) / S,
          child: i ? 1 / SCENES[i].k : 0,
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
        // Past this scene, it shrinks into its parent's slot: the part outside the slot
        // fades out while the slot itself stays opaque.
        // Both passes only draw what can show, or the dense layers cost hundreds of ms per frame.
        const outside = 1 - smooth(i, i + 0.55, z)
        if (outside > 0.01) {
          ctx.save()
          transform()
          ctx.globalAlpha = a * outside
          SCENES[i].draw(ctx, cropView(v, 4))
          ctx.restore()
        }
        ctx.save()
        transform()
        ctx.globalAlpha = a
        ctx.beginPath()
        ctx.rect(-1, -1, 2, 2)
        ctx.clip()
        SCENES[i].draw(ctx, cropView(v, 1))
        ctx.restore()
      }

      // Bloom: blur a downscaled copy and add it back so lit parts read as light
      if (canBloom) {
        gctx.globalCompositeOperation = 'copy'
        // Contrast first acts as a threshold, so only bright features bloom
        gctx.filter = 'brightness(0.8) contrast(5) blur(3.5px)'
        gctx.drawImage(canvas, 0, 0, glowBuf.width, glowBuf.height)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = BLOOM
        ctx.drawImage(glowBuf, 0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }

      // Vignette, then film grain
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const vg = ctx.createRadialGradient(ccx, ccy, R * 0.9, ccx, ccy, Math.max(w, h) * 0.8)
      vg.addColorStop(0, 'rgba(5, 7, 11, 0)')
      vg.addColorStop(1, 'rgba(5, 7, 11, 0.9)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)
      if (!still) {
        grain.setTransform(new DOMMatrix().translate(Math.random() * 256, Math.random() * 256))
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = GRAIN
        ctx.fillStyle = grain
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }

      // Overlays, rail and scale bar follow the same scroll position
      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const a = textAlpha(i, u, from, to)
        el.style.opacity = a.toFixed(3)
        el.style.transform = `translate3d(0, ${((1 - a) * 18).toFixed(1)}px, 0)`
        el.style.visibility = a < 0.02 ? 'hidden' : 'visible'
        el.style.pointerEvents = a > 0.6 ? 'auto' : 'none'
      })
      railRefs.current.forEach((el, i) => el?.classList.toggle('is-active', i === to))
      if (scaleRef.current) {
        const lo = Math.min(N - 2, Math.floor(z))
        const f = z - lo
        const mpp = (i) => SCENES[i].size / (2 * R * Math.exp(LOG[i] - Lz))
        const m = Math.exp(Math.log(mpp(lo)) * (1 - f) + Math.log(mpp(lo + 1)) * f) * SCALE_BAR_PX
        scaleRef.current.textContent = formatLength(m)
      }
      if (cueRef.current) {
        const show = 1 - smooth(0.05, 0.25, u)
        cueRef.current.style.opacity = show.toFixed(3)
        cueRef.current.style.pointerEvents = show > 0.5 ? 'auto' : 'none'
      }
      // The jump button hides while the events are on screen
      if (jumpRef.current) {
        const show = 1 - textAlpha(1, u, from, to)
        jumpRef.current.style.opacity = show.toFixed(3)
        jumpRef.current.style.pointerEvents = show > 0.5 ? 'auto' : 'none'
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!still) t0 += dt
      if (flight) {
        const p = Math.min(1, (now - flight.start) / flight.dur)
        u = flight.a + (flight.b - flight.a) * easeInOut(p)
        if (p === 1) {
          u = flight.b
          from = to
          flight = null
        }
      }
      if (!visible) return
      if (!flight && now - lastDraw < 1000 / IDLE_FPS - 2) return
      lastDraw = now
      draw()
    }

    // One wheel gesture moves one scene. Trackpads keep sending momentum events for a while,
    // so a new step needs the wheel to go quiet first.
    let wheelAcc = 0
    let wheelBusy = false
    let wheelTimer
    function onWheel(e) {
      if (e.ctrlKey) return // pinch zoom
      e.preventDefault()
      clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => {
        wheelBusy = false
        wheelAcc = 0
      }, WHEEL_QUIET_MS)
      if (wheelBusy) return
      if (flight) {
        wheelBusy = true
        return
      }
      wheelAcc += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      if (Math.abs(wheelAcc) < WHEEL_STEP) return
      go(to + Math.sign(wheelAcc))
      wheelBusy = true
      wheelAcc = 0
    }

    let touchY = null
    function onTouchStart(e) {
      touchY = e.touches.length === 1 ? e.touches[0].clientY : null
    }
    function onTouchMove(e) {
      if (touchY !== null) e.preventDefault()
    }
    function onTouchEnd(e) {
      if (touchY === null) return
      const dy = touchY - e.changedTouches[0].clientY
      touchY = null
      if (Math.abs(dy) >= SWIPE_PX) go(to + Math.sign(dy))
    }

    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      const step = { ArrowDown: 1, PageDown: 1, ' ': e.shiftKey ? -1 : 1, ArrowUp: -1, PageUp: -1 }[e.key]
      if (step) go(to + step)
      else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(N - 1)
      else return
      e.preventDefault()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(stage)
    // Stop drawing while the stage is off screen
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(stage)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    stage.addEventListener('touchstart', onTouchStart, { passive: true })
    stage.addEventListener('touchmove', onTouchMove, { passive: false })
    stage.addEventListener('touchend', onTouchEnd)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      clearTimeout(wheelTimer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      stage.removeEventListener('touchstart', onTouchStart)
      stage.removeEventListener('touchmove', onTouchMove)
      stage.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const jumpTo = (i) => goRef.current(i)

  const setPanel = (i) => (el) => {
    panelRefs.current[i] = el
  }

  return (
    <div className="jr">
      <div ref={stageRef} className="jr-stage">
        <canvas ref={canvasRef} className="jr-canvas" aria-hidden="true" />
        <div className="jr-scrim" aria-hidden="true" />

        <div className="jr-panels">
          <section ref={setPanel(0)} className="jr-panel" aria-label="Introduction">
            <h1 className="jr-title">
              Stanford IEEE <span>Student Branch</span>
            </h1>
            {nextEvent && (
              <a href={nextEvent.href} target="_blank" rel="noreferrer" className="jr-pill">
                <span className="jr-pill-dot" aria-hidden="true" />
                <span className="jr-pill-when">{dateFmt.format(nextEvent.date)}</span>
                <span>{nextEvent.title}</span>
                <span aria-hidden="true">→</span>
              </a>
            )}
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
                    <span className="jr-chapter-short">{ch.short.replace('-', '')}</span>
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

          <section ref={setPanel(4)} className="jr-panel" aria-label="Past speakers">
            <p className="jr-eyebrow">Past speakers</p>
            <ul className="jr-names">
              {PAST_SPEAKERS.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <Link to="/events" className="jr-link">Event archive →</Link>
          </section>

          <section ref={setPanel(5)} className="jr-panel" aria-label="Speakers and sponsors">
            <h2 className="jr-h2">For speakers and sponsors</h2>
            <div className="jr-actions">
              <a href={`mailto:${BRANCH_EMAIL}?subject=${encodeURIComponent('Speaking at Stanford IEEE')}`} className="jr-btn jr-btn--primary">
                Email us
              </a>
              <Link to="/team" className="jr-btn">Meet the officers</Link>
            </div>
          </section>

          <section ref={setPanel(6)} className="jr-panel" aria-label="Get involved">
            <h2 className="jr-h2 jr-h2--lg">Get involved</h2>
            <div className="jr-actions">
              <a href={MAILING_LIST_URL} target="_blank" rel="noreferrer" className="jr-btn jr-btn--primary">
                Mailing list
              </a>
              <a href={branchCalendarUrl} target="_blank" rel="noreferrer" className="jr-btn">Luma ↗</a>
              <Link to="/chapters" className="jr-btn">Chapters</Link>
            </div>
          </section>
        </div>

        <nav className="jr-rail" aria-label="Sections">
          {SECTIONS.map((name, i) => (
            <button key={name} type="button" ref={(el) => (railRefs.current[i] = el)} onClick={() => jumpTo(i)}>
              <span className="jr-rail-name">{name}</span>
              <span className="jr-rail-tick" aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div className="jr-scalebar" aria-hidden="true">
          <span className="jr-scalebar-line" style={{ width: SCALE_BAR_PX }} />
          <span ref={scaleRef} className="jr-scalebar-value">40 nm</span>
        </div>
        <button ref={jumpRef} type="button" className="jr-jump" onClick={() => jumpTo(1)}>
          <span className="jr-jump-dot" aria-hidden="true" />
          Upcoming events
        </button>
        <button ref={cueRef} type="button" className="jr-cue" onClick={() => jumpTo(1)} aria-label="Scroll down">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
