/*
 * Canvas drawings for the home page zoom-out, one per physical scale. Nothing here is
 * labelled: the drawings are meant to read on their own as the camera pulls back.
 *
 * Each scene is drawn in its own unit space (its main object spans roughly [-1, 1]) and
 * holds the previous scene in a center square of half-size `v.child` (= 1 / k). The
 * caller sets the transform. `v` describes it:
 *   v.px      units per screen pixel (hairlines, fixed-size details)
 *   v.l/r/t/b visible extents in units
 *   v.t0      time in seconds
 *   v.child   half-size of the square that holds the previous scene
 *   v.mouse   pointer position in units, or null
 *   v.dpr     device pixel ratio (for shadow sizes, which ignore the transform)
 *
 * Light comes from the top left throughout; shadows fall to the bottom right.
 */

export const BG = '#05070b'

const rgba = (rgb, a) => `rgba(${rgb}, ${a})`
const CORAL = '255, 98, 84'
const IRIDESCENT = ['#6E5BD8', '#3BA7C0', '#8FC46E', '#E0B252', '#E06A5F', '#B04A8C', '#6E5BD8']

function hash(i, j) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/* ── Textures, generated once ─────────────────────────────────────────────────── */

const tex = {}

function makeCanvas(w, h, paint) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  paint(c.getContext('2d'), w, h)
  return c
}

function noise(w, h, [r, g, b], lo, hi, seed = 1) {
  return makeCanvas(w, h, (ctx) => {
    const img = ctx.createImageData(w, h)
    for (let i = 0; i < w * h; i++) {
      const n = hash(i % w + seed * 13, Math.floor(i / w) + seed * 7)
      img.data[i * 4] = r
      img.data[i * 4 + 1] = g
      img.data[i * 4 + 2] = b
      img.data[i * 4 + 3] = (lo + (hi - lo) * n) * 255
    }
    ctx.putImageData(img, 0, 0)
  })
}

export function textures() {
  if (tex.ready) return tex
  tex.grain = noise(256, 256, [255, 255, 255], 0, 1, 3)
  tex.speck = noise(128, 128, [210, 220, 240], 0, 0.22, 5)
  tex.dark = noise(128, 128, [0, 0, 0], 0, 0.35, 9)
  // Logic "sea" on the die: standard-cell rows with random fill
  tex.logic = makeCanvas(128, 128, (ctx, w, h) => {
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 2) {
        const n = hash(x, y)
        ctx.fillStyle = `rgba(${120 + n * 60}, ${150 + n * 50}, ${170 + n * 40}, ${0.08 + n * 0.22})`
        ctx.fillRect(x, y, 2, 3)
      }
    }
  })
  // SRAM bitcell array
  tex.sram = makeCanvas(16, 16, (ctx) => {
    ctx.fillStyle = 'rgba(150, 140, 230, 0.35)'
    ctx.fillRect(1, 1, 6, 6)
    ctx.fillRect(9, 9, 6, 6)
    ctx.fillStyle = 'rgba(190, 180, 255, 0.55)'
    ctx.fillRect(9, 1, 6, 6)
    ctx.fillRect(1, 9, 6, 6)
  })
  // Brushed aluminum
  tex.brushed = makeCanvas(512, 64, (ctx, w, h) => {
    for (let y = 0; y < h; y++) {
      const n = hash(y, 3)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + n * 0.05})`
      ctx.fillRect(0, y, w, 1)
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = `rgba(0, 0, 0, ${hash(y, k) * 0.05})`
        ctx.fillRect(hash(k, y) * w, y, 40 + hash(y, k + 9) * 120, 1)
      }
    }
  })
  // Perforated grille
  tex.grille = makeCanvas(12, 12, (ctx) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.beginPath()
    ctx.arc(6, 6, 3.6, 0, Math.PI * 2)
    ctx.fill()
  })
  tex.ready = true
  return tex
}

function pattern(ctx, canvas, unitsPerTile) {
  const p = ctx.createPattern(canvas, 'repeat')
  p.setTransform(new DOMMatrix().scale(unitsPerTile / canvas.width))
  return p
}

/* ── Drawing helpers ──────────────────────────────────────────────────────────── */

function rr(ctx, x, y, w, h, r = 0) {
  ctx.beginPath()
  if (r > 0) ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2))
  else ctx.rect(x, y, w, h)
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

// Fill with a top-left-lit gradient, then a thin highlight and shade on the edges.
function lit(ctx, v, x, y, w, h, { r = 0, top, bottom, edge = 0.18, rim = 0.4 }) {
  const g = ctx.createLinearGradient(x, y, x + w * 0.6, y + h)
  g.addColorStop(0, top)
  g.addColorStop(1, bottom)
  rr(ctx, x, y, w, h, r)
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = v.px
  ctx.strokeStyle = `rgba(255, 255, 255, ${edge})`
  ctx.beginPath()
  ctx.moveTo(x + r, y + v.px * 0.5)
  ctx.lineTo(x + w - r, y + v.px * 0.5)
  ctx.moveTo(x + v.px * 0.5, y + r)
  ctx.lineTo(x + v.px * 0.5, y + h - r)
  ctx.stroke()
  ctx.strokeStyle = `rgba(0, 0, 0, ${rim})`
  ctx.beginPath()
  ctx.moveTo(x + r, y + h - v.px * 0.5)
  ctx.lineTo(x + w - r, y + h - v.px * 0.5)
  ctx.moveTo(x + w - v.px * 0.5, y + r)
  ctx.lineTo(x + w - v.px * 0.5, y + h - r)
  ctx.stroke()
}

// Soft contact shadow, offset to the bottom right.
function shadow(ctx, v, x, y, w, h, { r = 0, d = 6, blur = 14, a = 0.55 } = {}) {
  ctx.save()
  ctx.shadowColor = `rgba(0, 0, 0, ${a})`
  ctx.shadowBlur = blur * v.dpr
  ctx.shadowOffsetX = d * v.dpr
  ctx.shadowOffsetY = d * v.dpr
  ctx.fillStyle = 'rgba(0, 0, 0, 1)'
  rr(ctx, x, y, w, h, r)
  ctx.fill()
  ctx.restore()
}

function glow(ctx, x, y, r, rgb, a) {
  if (a <= 0.01) return
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
  g.addColorStop(0, rgba(rgb, a))
  g.addColorStop(0.25, rgba(rgb, a * 0.35))
  g.addColorStop(1, rgba(rgb, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(255, 236, 230, ${Math.min(1, a)})`
  ctx.beginPath()
  ctx.arc(x, y, r * 0.8, 0, Math.PI * 2)
  ctx.fill()
}

// Slow diagonal reflection that sweeps across polished surfaces.
function sweep(ctx, v, x, y, w, h, period = 9, a = 0.08) {
  const f = ((v.t0 / period) % 1) * 2.4 - 0.7
  const cx = x + w * f
  const g = ctx.createLinearGradient(cx - w * 0.25, y, cx + w * 0.25, y + h)
  g.addColorStop(0, 'rgba(255, 255, 255, 0)')
  g.addColorStop(0.5, `rgba(255, 255, 255, ${a})`)
  g.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
}

function iridescence(ctx, x, y, w, h, a, phase = 0) {
  const g = ctx.createLinearGradient(x, y + h, x + w, y)
  IRIDESCENT.forEach((c, i) => g.addColorStop((i / (IRIDESCENT.length - 1) + phase) % 1, c))
  ctx.save()
  ctx.globalAlpha *= a
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

function background(ctx, v, color) {
  ctx.fillStyle = color
  ctx.fillRect(v.l - 1, v.t - 1, v.r - v.l + 2, v.b - v.t + 2)
}

/* ── 0 · Nanosheet transistor, as a false-color electron micrograph ─────────── */

const SHEETS = [-0.3, -0.1, 0.1]
const SHEET_H = 0.078

function fringes(ctx, v, x, y, w, h, angle, spacing, a) {
  ctx.save()
  rr(ctx, x, y, w, h)
  ctx.clip()
  ctx.strokeStyle = `rgba(220, 232, 255, ${a})`
  ctx.lineWidth = v.px
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const R = Math.hypot(w, h)
  const mx = x + w / 2
  const my = y + h / 2
  for (let d = -R; d < R; d += spacing) {
    line(ctx, mx + c * d - s * R, my + s * d + c * R, mx + c * d + s * R, my + s * d - c * R)
  }
  ctx.restore()
}

function drawTransistor(ctx, v) {
  const t = textures()
  const { px, t0 } = v
  const on = 0.5 + 0.5 * Math.sin(t0 * 1.3)

  // Interlayer dielectric above, silicon substrate below
  background(ctx, v, '#141820')
  ctx.fillStyle = '#1b2029'
  ctx.fillRect(v.l - 1, 0.42, v.r - v.l + 2, v.b - 0.42 + 2)
  fringes(ctx, v, -1.4, 0.42, 2.8, 0.9, 0.62, 0.016, 0.05)

  // Source and drain epitaxy: faceted, brighter, with its own lattice
  for (const side of [-1, 1]) {
    const pts = [[0.82, 0.42], [0.82, -0.28], [0.72, -0.45], [0.5, -0.45], [0.43, -0.3], [0.43, 0.42]]
    const facet = () => {
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(side * x, y) : ctx.moveTo(side * x, y)))
      ctx.closePath()
    }
    facet()
    const g = ctx.createLinearGradient(side * 0.43, -0.45, side * 0.82, 0.42)
    g.addColorStop(0, '#2c3442')
    g.addColorStop(1, '#1d232d')
    ctx.fillStyle = g
    ctx.fill()
    ctx.save()
    ctx.clip()
    fringes(ctx, v, side > 0 ? 0.43 : -0.82, -0.45, 0.39, 0.87, 0.95, 0.014, 0.07)
    ctx.restore()
    facet()
    ctx.strokeStyle = 'rgba(190, 210, 240, 0.25)'
    ctx.lineWidth = px
    ctx.stroke()
  }

  // Gate stack wrapping all three sheets (metals image dark in TEM)
  const gate = ctx.createLinearGradient(-0.18, -0.55, 0.18, 0.42)
  gate.addColorStop(0, '#16111a')
  gate.addColorStop(1, '#0b0a10')
  rr(ctx, -0.18, -0.56, 0.36, 0.98, 0.03)
  ctx.fillStyle = gate
  ctx.fill()
  // Work-function metal liner, lit when the gate is on
  ctx.strokeStyle = rgba(CORAL, 0.12 + 0.18 * on)
  ctx.lineWidth = 2 * px
  rr(ctx, -0.168, -0.548, 0.336, 0.96, 0.026)
  ctx.stroke()

  // Outer spacers
  for (const side of [-1, 1]) {
    rr(ctx, side > 0 ? 0.18 : -0.245, -0.56, 0.065, 0.98, 0.01)
    ctx.fillStyle = '#2a303b'
    ctx.fill()
  }

  // Nanosheet channels with inner spacers and a bright high-k rim
  for (const y of SHEETS) {
    for (const side of [-1, 1]) {
      rr(ctx, side > 0 ? 0.18 : -0.245, y - SHEET_H / 2 - 0.045, 0.065, 0.045, 0.012)
      ctx.fillStyle = '#353c49'
      ctx.fill()
    }
    const sg = ctx.createLinearGradient(0, y - SHEET_H / 2, 0, y + SHEET_H / 2)
    sg.addColorStop(0, '#46546a')
    sg.addColorStop(1, '#2a3341')
    rr(ctx, -0.44, y - SHEET_H / 2, 0.88, SHEET_H, 0.018)
    ctx.fillStyle = sg
    ctx.fill()
    fringes(ctx, v, -0.44, y - SHEET_H / 2, 0.88, SHEET_H, Math.PI / 2, 0.011, 0.1)
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)'
    ctx.lineWidth = 1.2 * px
    rr(ctx, -0.172, y - SHEET_H / 2 - 0.012, 0.344, SHEET_H + 0.024, 0.02)
    ctx.stroke()
    // Inversion layer: a faint glow along the channel while the gate is on
    ctx.fillStyle = rgba(CORAL, 0.08 * on)
    ctx.fillRect(-0.44, y - SHEET_H / 2, 0.88, SHEET_H)
  }

  // Contacts and the first metal line
  for (const [x, w, top, bot] of [[-0.69, 0.15, -1.06, -0.45], [0.54, 0.15, -1.06, -0.45], [-0.055, 0.11, -1.06, -0.56]]) {
    lit(ctx, v, x, top, w, bot - top, { top: '#1b1e26', bottom: '#0c0e13', edge: 0.12, rim: 0.5 })
    ctx.strokeStyle = 'rgba(150, 160, 180, 0.35)'
    ctx.lineWidth = px
    rr(ctx, x, top, w, bot - top)
    ctx.stroke()
  }
  ctx.fillStyle = '#0d1016'
  ctx.fillRect(v.l - 1, -1.14, v.r - v.l + 2, 0.08)

  // Electrons drifting source to drain, brighter while the gate is on
  for (let s = 0; s < SHEETS.length; s++) {
    for (let j = 0; j < 7; j++) {
      const f = (t0 * 0.2 + j / 7 + s * 0.11) % 1
      const edge = Math.min(1, f * 7, (1 - f) * 7)
      const wob = Math.sin(t0 * 3 + j * 2.1 + s) * 0.012
      glow(ctx, -0.44 + f * 0.88, SHEETS[s] + wob, 2 * px, CORAL, (0.25 + 0.6 * on) * edge)
    }
  }

  // Micrograph grain
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = pattern(ctx, t.speck, 0.12)
  ctx.fillRect(v.l - 1, v.t - 1, v.r - v.l + 2, v.b - v.t + 2)
  ctx.restore()
}

/* ── 1 · Interconnect: copper lines over the transistor layer ────────────────── */

const M1 = 0.034
const M2 = 0.1

function drawLogic(ctx, v) {
  const { px, t0, child: c } = v
  background(ctx, v, '#0a0d13')

  const inSlot = (x, y, pad = 0) => Math.abs(x) < c + pad && Math.abs(y) < c + pad

  // Device layer, seen dimly through the dielectric
  const rowH = 2 * c + 0.02
  const r0 = Math.floor(v.t / rowH) - 1
  const r1 = Math.ceil(v.b / rowH) + 1
  for (let r = r0; r <= r1; r++) {
    const yc = r * rowH
    for (let x = Math.floor(v.l / 0.05) * 0.05; x < v.r; x += 0.05) {
      if (inSlot(x, yc, 0.03)) continue
      ctx.fillStyle = 'rgba(70, 90, 120, 0.12)'
      ctx.fillRect(x, yc - 0.06, 0.042, 0.12)
      ctx.fillStyle = 'rgba(120, 60, 60, 0.12)'
      ctx.fillRect(x + 0.018, yc - 0.09, 0.008, 0.18)
    }
  }

  // M2: wider vertical copper, segmented
  for (let m = Math.floor(v.l / M2) - 1; m <= Math.ceil(v.r / M2) + 1; m++) {
    const x = m * M2
    let y = Math.floor(v.t / 0.4) * 0.4 - 0.4
    while (y < v.b) {
      const len = 0.25 + hash(m, Math.round(y * 10)) * 0.9
      const gap = 0.05 + hash(Math.round(y * 10), m) * 0.12
      const y2 = y + len
      const segs = Math.abs(x) < c + 0.03 ? [[y, Math.min(y2, -c - 0.03)], [Math.max(y, c + 0.03), y2]] : [[y, y2]]
      for (const [a, b] of segs) {
        if (b <= a) continue
        const g = ctx.createLinearGradient(x - 0.008, 0, x + 0.008, 0)
        g.addColorStop(0, 'rgba(150, 100, 66, 0.3)')
        g.addColorStop(0.35, 'rgba(196, 144, 100, 0.38)')
        g.addColorStop(1, 'rgba(90, 56, 36, 0.3)')
        ctx.fillStyle = g
        ctx.fillRect(x - 0.008, a, 0.016, b - a)
      }
      y = y2 + gap
    }
  }

  // M1: dense horizontal copper with vias down to the devices
  for (let k = Math.floor(v.t / M1) - 1; k <= Math.ceil(v.b / M1) + 1; k++) {
    const y = k * M1
    let x = Math.floor(v.l / 0.3) * 0.3 - 0.3
    while (x < v.r) {
      const len = 0.08 + hash(k, Math.round(x * 20)) * 0.5
      const gap = 0.02 + hash(Math.round(x * 20), k) * 0.06
      const x2 = x + len
      const segs = Math.abs(y) < c + 0.02 ? [[x, Math.min(x2, -c - 0.02)], [Math.max(x, c + 0.02), x2]] : [[x, x2]]
      for (const [a, b] of segs) {
        if (b <= a) continue
        ctx.fillStyle = 'rgba(140, 92, 60, 0.36)'
        ctx.fillRect(a, y - 0.006, b - a, 0.012)
        ctx.fillStyle = 'rgba(240, 200, 160, 0.22)'
        ctx.fillRect(a, y - 0.006, b - a, Math.min(0.003, px))
        if (hash(k * 3, Math.round(a * 50)) > 0.55 && !inSlot(a + 0.01, y, 0.02)) {
          ctx.fillStyle = 'rgba(230, 205, 170, 0.5)'
          ctx.fillRect(a + 0.004, y - 0.005, 0.01, 0.01)
        }
      }
      x = x2 + gap
    }
  }

  // Signals: short bright packets riding a few of the M1 tracks
  for (let n = 0; n < 14; n++) {
    const k = Math.round((hash(n, 1) * 2 - 1) * 30)
    const y = k * M1
    if (Math.abs(y) < c + 0.02 || y < v.t || y > v.b) continue
    const span = v.r - v.l
    const f = ((t0 * (0.08 + hash(n, 2) * 0.1) + hash(n, 3)) % 1)
    const x = v.l + f * span
    const g = ctx.createLinearGradient(x - 0.12, 0, x, 0)
    g.addColorStop(0, rgba(CORAL, 0))
    g.addColorStop(1, rgba(CORAL, 0.75))
    ctx.fillStyle = g
    ctx.fillRect(x - 0.12, y - 0.006, 0.12, 0.012)
    glow(ctx, x, y, 2.2 * px, CORAL, 0.7)
  }

  // The transistor from above: three stacked sheets under one gate, with contacts.
  // It takes over from the cross-section as that fades.
  rr(ctx, -c, -c, 2 * c, 2 * c)
  ctx.fillStyle = '#10141c'
  ctx.fill()
  ctx.fillStyle = 'rgba(110, 130, 160, 0.55)'
  ctx.fillRect(-c * 0.9, -c * 0.28, c * 1.8, c * 0.56)
  ctx.fillStyle = 'rgba(30, 22, 30, 0.95)'
  ctx.fillRect(-c * 0.16, -c * 0.85, c * 0.32, c * 1.7)
  ctx.strokeStyle = rgba(CORAL, 0.35 + 0.25 * Math.sin(t0 * 1.3))
  ctx.lineWidth = px * 1.5
  ctx.strokeRect(-c * 0.16, -c * 0.85, c * 0.32, c * 1.7)
  ctx.fillStyle = 'rgba(30, 34, 44, 1)'
  for (const x of [-0.62, 0.42]) ctx.fillRect(x * c, -c * 0.2, c * 0.2, c * 0.4)
}

/* ── 2 · Die shot; the four corner blocks carry the chapter colors ────────────── */

export const DIE_BLOCKS = [
  { id: 'mtt-s', rgb: '59, 167, 192', x: -0.88, y: -0.88, w: 0.6, h: 0.6, kind: 'rf' },
  { id: 'pes', rgb: '224, 178, 82', x: 0.28, y: -0.88, w: 0.6, h: 0.6, kind: 'power' },
  { id: 'eds', rgb: '155, 135, 245', x: -0.88, y: 0.28, w: 0.6, h: 0.6, kind: 'sram' },
  { id: 'pels', rgb: '111, 207, 142', x: 0.28, y: 0.28, w: 0.6, h: 0.6, kind: 'converter' },
]

function copper(ctx, x1, y1, x2, y2, a = 0.7) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2)
  g.addColorStop(0, `rgba(150, 98, 62, ${a})`)
  g.addColorStop(0.5, `rgba(186, 132, 90, ${a})`)
  g.addColorStop(1, `rgba(96, 60, 38, ${a})`)
  return g
}

function drawRf(ctx, v, b) {
  const cx = b.x + b.w / 2
  const cy = b.y + b.h / 2
  ctx.lineWidth = 0.028
  ctx.strokeStyle = copper(ctx, b.x, b.y, b.x + b.w, b.y + b.h, 0.75)
  ctx.lineJoin = 'miter'
  ctx.beginPath()
  let s = b.w * 0.38
  ctx.moveTo(cx - s, cy - s)
  for (let turn = 0; turn < 4; turn++) {
    ctx.lineTo(cx + s, cy - s)
    ctx.lineTo(cx + s, cy + s)
    s -= 0.036
    ctx.lineTo(cx - s, cy + s)
    ctx.lineTo(cx - s, cy - s + 0.036)
    s -= 0.036
  }
  ctx.stroke()
  ctx.lineWidth = v.px
  ctx.strokeStyle = 'rgba(255, 230, 200, 0.3)'
  ctx.stroke()
}

function drawPower(ctx, v, b) {
  for (let i = 0; i < 18; i++) {
    const x = b.x + 0.05 + i * 0.029
    ctx.fillStyle = i % 2 ? 'rgba(60, 50, 40, 0.8)' : copper(ctx, x, 0, x + 0.016, 0, 0.6)
    ctx.fillRect(x, b.y + 0.09, 0.016, b.h - 0.18)
  }
  for (const y of [b.y + 0.04, b.y + b.h - 0.08]) {
    ctx.fillStyle = copper(ctx, b.x, y, b.x + b.w, y + 0.04, 0.8)
    ctx.fillRect(b.x + 0.04, y, b.w - 0.08, 0.04)
  }
}

function drawSram(ctx, v, b) {
  const t = textures()
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const bx = b.x + 0.04 + x * (b.w / 2 - 0.01)
    const by = b.y + 0.04 + y * (b.h / 2 - 0.01)
    ctx.fillStyle = pattern(ctx, t.sram, 0.012)
    ctx.fillRect(bx, by, b.w / 2 - 0.07, b.h / 2 - 0.07)
  }
  // Decoders between the four arrays, with an access sweeping across
  ctx.fillStyle = 'rgba(120, 110, 200, 0.25)'
  ctx.fillRect(b.x + b.w / 2 - 0.02, b.y + 0.04, 0.04, b.h - 0.08)
  ctx.fillRect(b.x + 0.04, b.y + b.h / 2 - 0.02, b.w - 0.08, 0.04)
  const row = Math.floor((v.t0 * 6) % 20)
  ctx.fillStyle = 'rgba(200, 190, 255, 0.35)'
  ctx.fillRect(b.x + 0.04, b.y + 0.04 + row * 0.026, b.w - 0.08, 0.008)
}

function drawConverter(ctx, v, b) {
  for (let i = 0; i < 8; i++) {
    const y = b.y + 0.07 + i * 0.058
    const left = i % 2 === 0
    ctx.fillStyle = copper(ctx, b.x, y, b.x + b.w, y + 0.03, 0.65)
    ctx.fillRect(left ? b.x + 0.05 : b.x + 0.12, y, b.w - 0.17, 0.03)
  }
  for (let i = 0; i < 3; i++) {
    const x = b.x + 0.07 + i * 0.17
    lit(ctx, v, x, b.y + b.h - 0.11, 0.12, 0.08, { top: 'rgba(236, 200, 140, 0.85)', bottom: 'rgba(150, 110, 60, 0.85)', r: 0.01 })
  }
}

function dieBody(ctx, v, { cheap = false } = {}) {
  const t = textures()
  // Substrate silicon with the logic sea
  ctx.fillStyle = '#121620'
  ctx.fillRect(-0.94, -0.94, 1.88, 1.88)
  if (!cheap) {
    ctx.fillStyle = pattern(ctx, t.logic, 0.09)
    ctx.fillRect(-0.9, -0.9, 1.8, 1.8)
  }
  for (const b of DIE_BLOCKS) {
    ctx.fillStyle = '#0d1018'
    ctx.fillRect(b.x, b.y, b.w, b.h)
    const g = ctx.createRadialGradient(b.x + b.w / 2, b.y + b.h / 2, 0, b.x + b.w / 2, b.y + b.h / 2, b.w * 0.75)
    g.addColorStop(0, rgba(b.rgb, 0.2))
    g.addColorStop(1, rgba(b.rgb, 0.04))
    ctx.fillStyle = g
    ctx.fillRect(b.x, b.y, b.w, b.h)
    if (cheap) continue
    if (b.kind === 'rf') drawRf(ctx, v, b)
    else if (b.kind === 'power') drawPower(ctx, v, b)
    else if (b.kind === 'sram') drawSram(ctx, v, b)
    else drawConverter(ctx, v, b)
    ctx.strokeStyle = rgba(b.rgb, 0.35)
    ctx.lineWidth = v.px
    ctx.strokeRect(b.x, b.y, b.w, b.h)
  }
  // Pad ring and seal ring
  for (let k = -0.86; k <= 0.86; k += 0.055) {
    for (const [x, y] of [[k, -0.925], [k, 0.885], [-0.925, k], [0.885, k]]) {
      ctx.fillStyle = 'rgba(170, 140, 96, 0.55)'
      ctx.fillRect(x, y, 0.04, 0.04)
    }
  }
  ctx.strokeStyle = 'rgba(200, 210, 230, 0.35)'
  ctx.lineWidth = v.px
  ctx.strokeRect(-0.94, -0.94, 1.88, 1.88)
  ctx.strokeRect(-0.932, -0.932, 1.864, 1.864)
  // Thin-film color and a moving reflection, as on a real die
  iridescence(ctx, -0.94, -0.94, 1.88, 1.88, 0.55, (v.t0 * 0.01) % 1)
  sweep(ctx, v, -0.94, -0.94, 1.88, 1.88, 11, 0.07)
}

function drawDie(ctx, v) {
  const { px, t0, child: c } = v
  background(ctx, v, '#07090e')

  // Neighbouring dies on the wafer, separated by scribe lines
  const pitch = 1.98
  for (let i = Math.floor(v.l / pitch) - 1; i <= Math.ceil(v.r / pitch) + 1; i++) {
    for (let j = Math.floor(v.t / pitch) - 1; j <= Math.ceil(v.b / pitch) + 1; j++) {
      if (!i && !j) continue
      ctx.save()
      ctx.translate(i * pitch, j * pitch)
      ctx.globalAlpha *= 0.5
      dieBody(ctx, v, { cheap: true })
      ctx.restore()
    }
  }
  dieBody(ctx, v)

  // Buses from the core out to each block, with data moving along them
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    for (const off of [-0.02, 0, 0.02]) {
      ctx.strokeStyle = 'rgba(230, 180, 130, 0.25)'
      ctx.lineWidth = Math.max(px, 0.006)
      line(ctx, dx * c + off, dy * c, dx * 0.28 + off, dy * 0.28)
    }
    const f = (t0 * 0.45 + (dx + 2) * 0.1 + (dy + 2) * 0.23) % 1
    glow(ctx, dx * (c + (0.28 - c) * f), dy * (c + (0.28 - c) * f), 2 * px, CORAL, 0.8)
  }

  // Core region, where the interconnect we came from sits
  ctx.fillStyle = '#0d1118'
  ctx.fillRect(-c, -c, 2 * c, 2 * c)
}

/* ── 3 · Package: interposer, HBM stacks, substrate and capacitors ────────────── */

function smdCap(ctx, v, x, y, w, h) {
  ctx.fillStyle = '#5e4c36'
  ctx.fillRect(x + w * 0.2, y, w * 0.6, h)
  ctx.fillStyle = '#8d9199'
  ctx.fillRect(x, y, w * 0.22, h)
  ctx.fillRect(x + w * 0.78, y, w * 0.22, h)
}

function drawPackage(ctx, v) {
  const t = textures()
  const { px, t0, child: c } = v
  background(ctx, v, '#05070b')

  // Organic substrate
  shadow(ctx, v, -0.96, -0.96, 1.92, 1.92, { r: 0.04, d: 10, blur: 30, a: 0.7 })
  lit(ctx, v, -0.96, -0.96, 1.92, 1.92, { r: 0.04, top: '#26332b', bottom: '#162019', edge: 0.12 })
  ctx.fillStyle = pattern(ctx, t.dark, 0.2)
  rr(ctx, -0.96, -0.96, 1.92, 1.92, 0.04)
  ctx.fill()

  // Capacitor clusters along the interposer edges, as on a real package
  for (let i = 0; i < 16; i++) {
    for (let row = 0; row < 3; row++) {
      const x = -0.56 + i * 0.072
      smdCap(ctx, v, x, -0.56 - row * 0.04, 0.036, 0.018)
      smdCap(ctx, v, x, 0.5 + row * 0.04, 0.036, 0.018)
    }
  }
  for (let j = 0; j < 11; j++) {
    for (let col = 0; col < 3; col++) {
      const y = -0.4 + j * 0.075
      smdCap(ctx, v, -0.7 - col * 0.06, y, 0.036, 0.018)
      smdCap(ctx, v, 0.66 + col * 0.06, y, 0.036, 0.018)
    }
  }
  // Fiducials in the corners
  ctx.fillStyle = 'rgba(190, 196, 206, 0.6)'
  for (const [x, y] of [[-0.86, -0.86], [0.86, 0.86]]) {
    ctx.beginPath()
    ctx.arc(x, y, 0.015, 0, Math.PI * 2)
    ctx.fill()
  }

  // Silicon interposer with routing visible under the surface
  shadow(ctx, v, -0.58, -0.44, 1.16, 0.88, { d: 4, blur: 14, a: 0.6 })
  lit(ctx, v, -0.58, -0.44, 1.16, 0.88, { top: '#3a3f4a', bottom: '#22262e', edge: 0.25 })
  ctx.strokeStyle = 'rgba(200, 210, 230, 0.05)'
  ctx.lineWidth = px
  for (let y = -0.42; y < 0.44; y += 0.012) line(ctx, -0.56, y, 0.56, y)
  iridescence(ctx, -0.58, -0.44, 1.16, 0.88, 0.3, 0.2)

  // HBM stacks: dark, glossy, with a faint data flow toward the die
  const hbm = [[-0.54, -0.4], [-0.54, 0.02], [0.33, -0.4], [0.33, 0.02]]
  for (const [i, [x, y]] of hbm.entries()) {
    shadow(ctx, v, x, y, 0.21, 0.38, { d: 5, blur: 10, a: 0.7 })
    lit(ctx, v, x, y, 0.21, 0.38, { top: '#2a2d36', bottom: '#111319', edge: 0.3, r: 0.006 })
    sweep(ctx, v, x, y, 0.21, 0.38, 7 + i, 0.1)
    const toward = x < 0 ? 1 : -1
    const f = (t0 * 0.8 + i * 0.27) % 1
    const sx = x < 0 ? x + 0.21 : x
    glow(ctx, sx + toward * f * (Math.abs(sx) - c), y + 0.19, 1.8 * px, '120, 220, 255', 0.6 * Math.sin(f * Math.PI))
  }

  // Underfill fillet around the die, then the die slot itself
  rr(ctx, -c - 0.025, -c - 0.025, 2 * c + 0.05, 2 * c + 0.05, 0.02)
  ctx.fillStyle = 'rgba(190, 170, 140, 0.18)'
  ctx.fill()
  ctx.save()
  ctx.scale(c, c)
  dieBody(ctx, { ...v, px: v.px / c }, { cheap: true })
  ctx.restore()
  sweep(ctx, v, -0.96, -0.96, 1.92, 1.92, 13, 0.035)
}

/* ── 4 · Board: package, power stage, memory and connectors ───────────────────── */

function trace(ctx, v, pts, a = 0.5) {
  ctx.strokeStyle = `rgba(52, 84, 70, ${a})`
  ctx.lineWidth = Math.max(v.px * 1.5, 0.006)
  ctx.lineJoin = 'round'
  ctx.beginPath()
  pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.stroke()
  ctx.strokeStyle = `rgba(150, 190, 170, ${a * 0.18})`
  ctx.lineWidth = v.px
  ctx.stroke()
}

function along(pts, f) {
  let total = 0
  const segs = pts.slice(1).map((p, i) => {
    const l = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])
    total += l
    return l
  })
  let d = f * total
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const k = segs[i] ? d / segs[i] : 0
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]
    }
    d -= segs[i]
  }
  return pts[pts.length - 1]
}

// Trace bundles from the package to its neighbours, routed with 45° bends
function boardRoutes(c) {
  const routes = []
  for (let k = 0; k < 6; k++) {
    const y = -c * 0.7 + k * c * 0.28
    routes.push([[c, y], [0.38, y], [0.46, y - 0.08 + k * 0.012], [0.52, y - 0.08 + k * 0.012]])
  }
  for (let k = 0; k < 5; k++) {
    const x = -c * 0.6 + k * c * 0.3
    routes.push([[x, c], [x, 0.4], [x - 0.08, 0.48], [x - 0.08, 0.7]])
  }
  for (let k = 0; k < 4; k++) {
    const y = -c * 0.5 + k * c * 0.33
    routes.push([[-c, y], [-0.34, y], [-0.42, y - 0.1], [-0.42, -0.62]])
  }
  return routes
}

function choke(ctx, v, x, y, s) {
  shadow(ctx, v, x, y, s, s, { r: s * 0.12, d: 5, blur: 8, a: 0.65 })
  lit(ctx, v, x, y, s, s, { r: s * 0.12, top: '#5b5f66', bottom: '#2c2f35', edge: 0.3 })
  ctx.fillStyle = 'rgba(20, 22, 26, 0.6)'
  rr(ctx, x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.4, s * 0.06)
  ctx.fill()
}

function canCap(ctx, v, x, y, r) {
  shadow(ctx, v, x - r, y - r, 2 * r, 2 * r, { r, d: 5, blur: 8, a: 0.65 })
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r)
  g.addColorStop(0, '#e2e5ea')
  g.addColorStop(0.6, '#9aa0aa')
  g.addColorStop(1, '#4c5058')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(40, 44, 52, 0.7)'
  ctx.lineWidth = Math.max(v.px, r * 0.08)
  line(ctx, x - r * 0.55, y, x + r * 0.55, y)
  line(ctx, x, y - r * 0.55, x, y + r * 0.55)
}

function dimm(ctx, v, x, y, w, h) {
  ctx.fillStyle = '#0b0c0f'
  ctx.fillRect(x - 0.012, y - 0.01, w + 0.024, h + 0.02)
  shadow(ctx, v, x, y, w, h, { d: 6, blur: 10, a: 0.6 })
  lit(ctx, v, x, y, w, h, { top: '#1d4a3a', bottom: '#12302a', edge: 0.2 })
  for (let k = 0; k < 8; k++) {
    lit(ctx, v, x + w * 0.15, y + 0.02 + k * (h - 0.04) / 8, w * 0.7, (h - 0.04) / 8 - 0.012, { top: '#202228', bottom: '#0e0f12', edge: 0.18 })
  }
}

function drawBoard(ctx, v) {
  const t = textures()
  const { px, t0, child: c } = v
  background(ctx, v, '#05070b')

  // Board with solder mask
  shadow(ctx, v, -1, -1, 2, 2, { r: 0.03, d: 12, blur: 40, a: 0.8 })
  lit(ctx, v, -1, -1, 2, 2, { r: 0.03, top: '#13241e', bottom: '#0b1612', edge: 0.12 })
  ctx.fillStyle = pattern(ctx, t.dark, 0.3)
  rr(ctx, -1, -1, 2, 2, 0.03)
  ctx.fill()

  const routes = boardRoutes(c)
  for (const r of routes) trace(ctx, v, r)
  // Background routing across the rest of the board
  for (let k = 0; k < 22; k++) {
    const y = -0.92 + k * 0.085
    if (Math.abs(y) < 0.5) continue
    trace(ctx, v, [[-0.95, y], [-0.6 + hash(k, 1) * 0.3, y], [-0.5 + hash(k, 1) * 0.3, y + 0.05], [0.9, y + 0.05]], 0.3)
  }

  // Power stage: chokes and capacitor cans along the top and left
  for (let k = 0; k < 7; k++) choke(ctx, v, -0.72 + k * 0.13, -0.86, 0.1)
  for (let k = 0; k < 7; k++) canCap(ctx, v, -0.67 + k * 0.13, -0.64, 0.035)
  for (let k = 0; k < 5; k++) choke(ctx, v, -0.92, -0.42 + k * 0.13, 0.1)

  // Memory on the right
  for (let k = 0; k < 4; k++) dimm(ctx, v, 0.56 + k * 0.095, -0.82, 0.06, 1.12)

  // Edge connector and small parts
  for (let k = 0; k < 30; k++) {
    ctx.fillStyle = 'rgba(214, 176, 112, 0.85)'
    ctx.fillRect(-0.7 + k * 0.03, 0.94, 0.018, 0.06)
  }
  lit(ctx, v, 0.08, 0.64, 0.16, 0.16, { top: '#1c1e24', bottom: '#0c0d10', edge: 0.2 })
  lit(ctx, v, -0.28, 0.66, 0.1, 0.1, { top: '#1c1e24', bottom: '#0c0d10', edge: 0.2 })
  for (let i = 0; i < 60; i++) {
    const x = (hash(i, 3) * 2 - 1) * 0.92
    const y = (hash(i, 7) * 2 - 1) * 0.92
    if (Math.abs(x) < 0.32 && Math.abs(y) < 0.32) continue
    if (x > 0.5 || y < -0.55) continue
    smdCap(ctx, v, x, y, 0.03, 0.016)
  }
  for (const [x, y] of [[-0.94, -0.94], [0.94, -0.94], [-0.94, 0.94], [0.94, 0.94]]) {
    ctx.strokeStyle = 'rgba(200, 205, 215, 0.6)'
    ctx.lineWidth = 0.012
    ctx.beginPath()
    ctx.arc(x, y, 0.028, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Signals along the bundles
  routes.forEach((r, i) => {
    const f = (t0 * 0.3 + hash(i, 4)) % 1
    const [x, y] = along(r, f)
    glow(ctx, x, y, 1.8 * px, '255, 196, 120', 0.7 * Math.sin(f * Math.PI))
  })

  // Package footprint with a lid shadow, then the slot
  shadow(ctx, v, -c, -c, 2 * c, 2 * c, { d: 8, blur: 18, a: 0.75 })
  ctx.fillStyle = '#1d2a22'
  ctx.fillRect(-c, -c, 2 * c, 2 * c)
}

/* ── 5 · Server chassis, from above ───────────────────────────────────────────── */

function fan(ctx, v, x, y, s, angle) {
  shadow(ctx, v, x, y, s, s, { r: s * 0.06, d: 5, blur: 10, a: 0.6 })
  lit(ctx, v, x, y, s, s, { r: s * 0.06, top: '#1c1f25', bottom: '#0e1014', edge: 0.2 })
  const cx = x + s / 2
  const cy = y + s / 2
  const R = s * 0.44
  ctx.fillStyle = '#07080b'
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  for (let k = 0; k < 7; k++) {
    ctx.rotate((Math.PI * 2) / 7)
    ctx.beginPath()
    ctx.moveTo(R * 0.25, 0)
    ctx.quadraticCurveTo(R * 0.7, R * 0.12, R * 0.95, R * 0.42)
    ctx.quadraticCurveTo(R * 0.6, R * 0.38, R * 0.22, R * 0.18)
    ctx.closePath()
    ctx.fillStyle = 'rgba(70, 76, 88, 0.85)'
    ctx.fill()
  }
  ctx.restore()
  const hub = ctx.createRadialGradient(cx - R * 0.08, cy - R * 0.08, 0, cx, cy, R * 0.26)
  hub.addColorStop(0, '#4a4f59')
  hub.addColorStop(1, '#1a1c21')
  ctx.fillStyle = hub
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.26, 0, Math.PI * 2)
  ctx.fill()
}

function drawServer(ctx, v) {
  const t = textures()
  const { px, t0, child: c } = v
  background(ctx, v, '#05070b')

  // Chassis floor in brushed metal, with raised walls
  const W = 1.5
  const H = 1.0
  shadow(ctx, v, -W, -H, 2 * W, 2 * H, { r: 0.02, d: 14, blur: 50, a: 0.85 })
  lit(ctx, v, -W, -H, 2 * W, 2 * H, { r: 0.02, top: '#2a2e35', bottom: '#181b20', edge: 0.25 })
  ctx.fillStyle = pattern(ctx, t.brushed, 1.2)
  ctx.fillRect(-W, -H, 2 * W, 2 * H)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 0.02
  ctx.strokeRect(-W + 0.01, -H + 0.01, 2 * W - 0.02, 2 * H - 0.02)

  // Drive bays across the front, activity LEDs blinking
  for (let k = 0; k < 10; k++) {
    const x = -W + 0.08 + k * 0.29
    lit(ctx, v, x, 0.8, 0.26, 0.17, { top: '#24272e', bottom: '#14161a', edge: 0.2, r: 0.01 })
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
    for (let g = 0; g < 4; g++) ctx.fillRect(x + 0.03, 0.83 + g * 0.03, 0.2, 0.01)
    const blink = hash(k, Math.floor(t0 * (4 + hash(k, 2) * 6))) > 0.4
    glow(ctx, x + 0.22, 0.94, 1.6 * px, blink ? '120, 255, 170' : '80, 160, 255', blink ? 0.9 : 0.4)
  }

  // Fan wall behind the drives
  for (let k = 0; k < 7; k++) fan(ctx, v, -1.4 + k * 0.4, 0.46, 0.3, t0 * (9 + k * 0.4))

  // Airflow from the front of the chassis to the back
  for (let k = 0; k < 40; k++) {
    const x = -W + 0.1 + hash(k, 1) * (2 * W - 0.2)
    const f = (t0 * (0.1 + hash(k, 2) * 0.08) + hash(k, 3)) % 1
    const y = 0.42 - f * 1.3
    if (Math.abs(x) < c + 0.05 && Math.abs(y) < c + 0.05) continue
    ctx.strokeStyle = `rgba(160, 200, 255, ${0.12 * Math.sin(f * Math.PI)})`
    ctx.lineWidth = px
    line(ctx, x, y, x, y + 0.06)
  }

  // Power supplies at the back right, second board at the back left
  for (let k = 0; k < 2; k++) {
    const x = 0.62 + k * 0.42
    shadow(ctx, v, x, -0.94, 0.36, 0.62, { d: 6, blur: 12, a: 0.6 })
    lit(ctx, v, x, -0.94, 0.36, 0.62, { top: '#30343c', bottom: '#1a1d22', edge: 0.25, r: 0.01 })
    ctx.fillStyle = pattern(ctx, t.grille, 0.022)
    ctx.fillRect(x + 0.03, -0.9, 0.3, 0.16)
  }
  shadow(ctx, v, -1.4, -0.92, 0.6, 0.58, { d: 6, blur: 12, a: 0.6 })
  lit(ctx, v, -1.4, -0.92, 0.6, 0.58, { top: '#13241e', bottom: '#0b1612', edge: 0.12 })
  for (let k = 0; k < 4; k++) lit(ctx, v, -1.34 + k * 0.13, -0.86, 0.09, 0.09, { top: '#5b5f66', bottom: '#2c2f35', edge: 0.3, r: 0.01 })

  // Cables
  ctx.strokeStyle = 'rgba(10, 11, 14, 0.9)'
  ctx.lineWidth = 0.022
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of [[0.8, -0.32, c, -c * 0.4], [1.2, -0.32, c, c * 0.5], [-1.1, -0.34, -c, 0]]) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.bezierCurveTo(x1, y1 + 0.2, x2 + (x1 > 0 ? 0.25 : -0.25), y2, x2, y2)
    ctx.stroke()
  }
  ctx.lineCap = 'butt'

  // Board slot
  shadow(ctx, v, -c, -c, 2 * c, 2 * c, { d: 8, blur: 20, a: 0.75 })
  ctx.fillStyle = '#10201a'
  ctx.fillRect(-c, -c, 2 * c, 2 * c)
}

/* ── 6 · What it all runs ─────────────────────────────────────────────────────── */

// Devices around the server, as positions in this scene's units
export const DEVICES = [
  { kind: 'phone', x: -0.9, y: -0.62 },
  { kind: 'laptop', x: 0.05, y: -0.9 },
  { kind: 'switch', x: 1.05, y: -0.55 },
  { kind: 'rack', x: 1.25, y: 0.38 },
  { kind: 'car', x: -0.25, y: 0.9 },
  { kind: 'satellite', x: -1.05, y: 0.42 },
  { kind: 'headset', x: 0.7, y: 0.92 },
]

function deviceStroke(ctx, v, a) {
  ctx.strokeStyle = `rgba(232, 238, 248, ${a})`
  ctx.lineWidth = 1.4 * v.px
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
}

function deviceFill(ctx, x, y, w, h, r) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, 'rgba(40, 46, 58, 0.9)')
  g.addColorStop(1, 'rgba(14, 16, 22, 0.9)')
  rr(ctx, x, y, w, h, r)
  ctx.fillStyle = g
  ctx.fill()
}

function drawDevice(ctx, v, d, s, a) {
  ctx.save()
  ctx.translate(d.x, d.y)
  ctx.scale(s, s)
  const vv = { ...v, px: v.px / s }
  deviceStroke(ctx, vv, a)
  switch (d.kind) {
    case 'phone':
      deviceFill(ctx, -0.07, -0.14, 0.14, 0.28, 0.025)
      ctx.stroke()
      ctx.fillStyle = `rgba(110, 140, 220, ${0.25 * a})`
      rr(ctx, -0.058, -0.122, 0.116, 0.244, 0.016)
      ctx.fill()
      line(ctx, -0.02, -0.128, 0.02, -0.128)
      break
    case 'laptop':
      deviceFill(ctx, -0.16, -0.12, 0.32, 0.2, 0.012)
      ctx.stroke()
      ctx.fillStyle = `rgba(110, 140, 220, ${0.22 * a})`
      ctx.fillRect(-0.145, -0.105, 0.29, 0.17)
      ctx.beginPath()
      ctx.moveTo(-0.2, 0.1)
      ctx.lineTo(0.2, 0.1)
      ctx.lineTo(0.18, 0.125)
      ctx.lineTo(-0.18, 0.125)
      ctx.closePath()
      ctx.stroke()
      break
    case 'switch':
      deviceFill(ctx, -0.2, -0.04, 0.4, 0.08, 0.008)
      ctx.stroke()
      for (let k = 0; k < 12; k++) {
        ctx.strokeRect(-0.17 + k * 0.026, -0.018, 0.018, 0.016)
        const lit = hash(k, Math.floor(v.t0 * 5)) > 0.5
        ctx.fillStyle = lit ? `rgba(120, 255, 170, ${a})` : `rgba(255, 255, 255, ${0.1 * a})`
        ctx.fillRect(-0.168 + k * 0.026, 0.012, 0.006, 0.006)
      }
      break
    case 'rack':
      deviceFill(ctx, -0.09, -0.24, 0.18, 0.48, 0.008)
      ctx.stroke()
      for (let k = 0; k < 10; k++) {
        line(ctx, -0.075, -0.21 + k * 0.045, 0.075, -0.21 + k * 0.045)
        const on = hash(k, Math.floor(v.t0 * 3)) > 0.35
        ctx.fillStyle = on ? `rgba(120, 190, 255, ${a})` : `rgba(255, 255, 255, ${0.08 * a})`
        ctx.fillRect(0.05, -0.2 + k * 0.045, 0.008, 0.008)
      }
      break
    case 'car':
      ctx.beginPath()
      ctx.moveTo(-0.22, 0.03)
      ctx.lineTo(-0.2, -0.02)
      ctx.quadraticCurveTo(-0.1, -0.03, -0.06, -0.08)
      ctx.lineTo(0.08, -0.08)
      ctx.quadraticCurveTo(0.13, -0.03, 0.21, -0.015)
      ctx.lineTo(0.22, 0.03)
      ctx.closePath()
      ctx.fillStyle = 'rgba(30, 36, 46, 0.9)'
      ctx.fill()
      ctx.stroke()
      for (const x of [-0.13, 0.13]) {
        ctx.beginPath()
        ctx.arc(x, 0.035, 0.032, 0, Math.PI * 2)
        ctx.fillStyle = '#0a0b0e'
        ctx.fill()
        ctx.stroke()
      }
      glow(ctx, 0.21, -0.005, 1.6 * vv.px, '255, 240, 200', 0.6 * a)
      break
    case 'satellite':
      deviceFill(ctx, -0.04, -0.05, 0.08, 0.1, 0.006)
      ctx.stroke()
      for (const side of [-1, 1]) {
        ctx.fillStyle = `rgba(70, 100, 180, ${0.45 * a})`
        ctx.fillRect(side > 0 ? 0.06 : -0.2, -0.035, 0.14, 0.07)
        ctx.strokeRect(side > 0 ? 0.06 : -0.2, -0.035, 0.14, 0.07)
        line(ctx, side * 0.04, 0, side * 0.06, 0)
        for (let k = 1; k < 4; k++) line(ctx, side > 0 ? 0.06 + k * 0.035 : -0.2 + k * 0.035, -0.035, side > 0 ? 0.06 + k * 0.035 : -0.2 + k * 0.035, 0.035)
      }
      break
    case 'headset':
      ctx.beginPath()
      ctx.moveTo(-0.13, -0.04)
      ctx.quadraticCurveTo(0, -0.08, 0.13, -0.04)
      ctx.lineTo(0.13, 0.04)
      ctx.quadraticCurveTo(0.06, 0.05, 0.03, 0.02)
      ctx.quadraticCurveTo(0, 0.0, -0.03, 0.02)
      ctx.quadraticCurveTo(-0.06, 0.05, -0.13, 0.04)
      ctx.closePath()
      ctx.fillStyle = 'rgba(30, 36, 46, 0.9)'
      ctx.fill()
      ctx.stroke()
      break
    default:
  }
  ctx.restore()
}

function drawWorld(ctx, v) {
  const { px, t0, child: c, mouse } = v
  background(ctx, v, BG)

  // Faint globe grid behind everything
  ctx.strokeStyle = 'rgba(120, 150, 200, 0.06)'
  ctx.lineWidth = px
  for (let k = 1; k <= 6; k++) {
    ctx.beginPath()
    ctx.ellipse(0, 3.2, 3.6, 0.4 * k, 0, Math.PI, 2 * Math.PI)
    ctx.stroke()
  }
  for (let k = -6; k <= 6; k++) {
    ctx.beginPath()
    ctx.ellipse(0, 3.2, Math.abs(k) * 0.6, 2.4, 0, Math.PI, 2 * Math.PI)
    ctx.stroke()
  }

  // Links from the server out to every device, carrying data both ways
  for (const [i, d] of DEVICES.entries()) {
    const near = mouse ? Math.max(0, 1 - Math.hypot(d.x - mouse.x, d.y - mouse.y) / 0.5) : 0
    const mx = d.x * 0.5 + (hash(i, 1) - 0.5) * 0.3
    const my = d.y * 0.5 + (hash(i, 2) - 0.5) * 0.3
    ctx.strokeStyle = rgba(CORAL, 0.18 + 0.3 * near)
    ctx.lineWidth = px * (1 + near)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(mx, my, d.x, d.y)
    ctx.stroke()
    for (let k = 0; k < 2; k++) {
      let f = (t0 * 0.35 + i * 0.17 + k * 0.5) % 1
      if (k) f = 1 - f
      const x = 2 * (1 - f) * f * mx + f * f * d.x
      const y = 2 * (1 - f) * f * my + f * f * d.y
      glow(ctx, x, y, 2 * px, CORAL, 0.8 * Math.sin(f * Math.PI))
    }
    const bob = Math.sin(t0 * 0.8 + i) * 0.012
    drawDevice(ctx, v, { ...d, y: d.y + bob }, 1 + near * 0.12, 0.55 + 0.45 * near)
  }

  // The server we came from, glowing at the center
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, c * 3)
  halo.addColorStop(0, rgba(CORAL, 0.22))
  halo.addColorStop(1, rgba(CORAL, 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(0, 0, c * 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1f2329'
  ctx.fillRect(-c, -c * 0.67, 2 * c, c * 1.33)
}

/*
 * k: how many times larger this scene's frame is than the previous scene's, so each
 * scene holds the previous one in a center square of half-size 1/k.
 * size: rough physical width of the frame, for the scale bar.
 */
export const SCENES = [
  { id: 'transistor', k: 1, size: 60e-9, draw: drawTransistor },
  { id: 'logic', k: 6, size: 0.4e-6, draw: drawLogic },
  { id: 'die', k: 8, size: 2.2e-2, draw: drawDie },
  { id: 'package', k: 3.4, size: 7.5e-2, draw: drawPackage },
  { id: 'board', k: 4, size: 0.3, draw: drawBoard },
  { id: 'server', k: 2.6, size: 0.9, draw: drawServer },
  { id: 'world', k: 5.5, size: 1.2e7, draw: drawWorld },
]

export function formatLength(m) {
  if (m < 1e-6) return `${Math.round(m * 1e9)} nm`
  if (m < 1e-3) return `${+(m * 1e6).toPrecision(2)} µm`
  if (m < 1e-2) return `${+(m * 1e3).toPrecision(2)} mm`
  if (m < 1) return `${+(m * 100).toPrecision(2)} cm`
  if (m < 1000) return `${+m.toPrecision(2)} m`
  return `${Math.round(m / 1000).toLocaleString('en-US')} km`
}
