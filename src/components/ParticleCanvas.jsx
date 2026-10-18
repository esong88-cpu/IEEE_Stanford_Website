import { useEffect, useRef } from 'react'

const GRID = 28 // dot grid spacing
const LINK = 140 // max distance for particle–particle lines
const REACH = 220 // cursor influence radius

/**
 * Hero background: a faint dot grid that lights up around the cursor, plus a drifting
 * particle network whose nodes link to the cursor. Listens on `targetRef` (the hero
 * section) so the content above the canvas stays clickable.
 */
export default function ParticleCanvas({ targetRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let pts = []
    const mouse = { x: -9999, y: -9999 }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const nw = canvas.clientWidth
      const nh = canvas.clientHeight
      if (!nw || !nh) return
      // Scale particles instead of re-seeding, so mobile URL-bar resizes don't jump.
      if (w && h) {
        for (const p of pts) {
          p.x *= nw / w
          p.y *= nh / h
        }
      }
      w = nw
      h = nh
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const n = Math.min(110, Math.round((w * h) / 13000))
      while (pts.length < n) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.4 + 0.6,
          phase: Math.random() * Math.PI * 2,
        })
      }
      pts.length = n
    }

    function drawGrid() {
      for (let gx = GRID / 2; gx < w; gx += GRID) {
        for (let gy = GRID / 2; gy < h; gy += GRID) {
          const dx = gx - mouse.x
          const dy = gy - mouse.y
          const d = Math.sqrt(dx * dx + dy * dy)
          const k = d < REACH ? 1 - d / REACH : 0
          const a = 0.09 + k * 0.95
          const s = 1.2 + k * 1.8
          ctx.fillStyle = k
            ? `rgba(255, ${Math.round(200 - k * 110)}, ${Math.round(190 - k * 110)}, ${a})`
            : `rgba(255, 255, 255, ${a})`
          // Lit dots lean slightly toward the cursor.
          ctx.fillRect(gx - s / 2 - dx * k * 0.12, gy - s / 2 - dy * k * 0.12, s, s)
        }
      }
    }

    function step() {
      for (const p of pts) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 14000 && d2 > 1) {
          const d = Math.sqrt(d2)
          const f = ((118 - d) / 118) * 0.12
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
        }
        const spd = Math.hypot(p.vx, p.vy)
        if (spd > 1.4) {
          p.vx = (p.vx / spd) * 1.4
          p.vy = (p.vy / spd) * 1.4
        }
        p.vx *= 0.995
        p.vy *= 0.995
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        else if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        else if (p.y > h + 10) p.y = -10
      }
    }

    function drawNetwork(t) {
      ctx.lineWidth = 0.7
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK) {
            ctx.strokeStyle = `rgba(220, 70, 64, ${(1 - d / LINK) * 0.42})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y)
        if (md < REACH) {
          ctx.strokeStyle = `rgba(255, 120, 110, ${(1 - md / REACH) * 0.55})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }
      for (const p of pts) {
        const alpha = 0.55 + Math.sin(t * 1.3 + p.phase) * 0.2
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        g.addColorStop(0, `rgba(230, 70, 64, ${alpha * 0.5})`)
        g.addColorStop(1, 'rgba(230, 70, 64, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(255, 170, 160, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h)
      if (mouse.x > -999) {
        const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, REACH * 1.3)
        halo.addColorStop(0, 'rgba(255, 70, 60, 0.16)')
        halo.addColorStop(1, 'rgba(255, 70, 60, 0)')
        ctx.fillStyle = halo
        ctx.fillRect(mouse.x - REACH * 1.3, mouse.y - REACH * 1.3, REACH * 2.6, REACH * 2.6)
      }
      drawGrid()
      drawNetwork(t)
    }

    let raf
    let t = 0
    function frame() {
      raf = requestAnimationFrame(frame)
      if (!w) return
      t += 0.016
      step()
      draw(t)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const target = targetRef?.current || canvas
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      if (still) draw(0)
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
      if (still) draw(0)
    }
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (finePointer) {
      target.addEventListener('mousemove', onMove)
      target.addEventListener('mouseleave', onLeave)
    }

    if (still) draw(0)
    else frame()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      target.removeEventListener('mousemove', onMove)
      target.removeEventListener('mouseleave', onLeave)
    }
  }, [targetRef])

  return <canvas ref={canvasRef} className="home-hero-canvas" aria-hidden />
}
