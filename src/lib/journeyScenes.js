/*
 * Canvas drawings for the home page zoom-out, one per scale. Each scene is drawn in its
 * own unit space (roughly [-1, 1] on both axes) and holds the previous scene inside its
 * center square of half-size CHILD. The caller sets the transform; `v` describes it:
 *   v.px      units per screen pixel (for hairlines and fixed-size text)
 *   v.l/r/t/b visible extents in units
 *   v.t0      time in seconds
 *   v.focus   0..1, how centered the camera is on this scene (labels fade with it)
 *   v.inner   0..1, opacity of the child scene inside the center square
 *   v.mouse   pointer position in units, or null
 */

export const ZOOM = 7
export const CHILD = 1 / ZOOM

export const C = {
  bg: '#04060a',
  line: '220, 228, 245',
  coral: '255, 92, 80',
  cyan: '94, 234, 212',
  violet: '178, 150, 255',
  amber: '240, 178, 92',
  green: '111, 207, 142',
  teal: '59, 167, 192',
  gold: '226, 182, 110',
}

const rgba = (rgb, a) => `rgba(${rgb}, ${a})`

function hash(i, j) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function rect(ctx, x, y, w, h) {
  ctx.beginPath()
  ctx.rect(x, y, w, h)
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function glowDot(ctx, x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
  g.addColorStop(0, rgba(rgb, a))
  g.addColorStop(1, rgba(rgb, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = rgba('255, 240, 236', Math.min(1, a * 1.4))
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function label(ctx, v, text, x, y, { align = 'left', rgb = C.line, a = 0.55, size = 10 } = {}) {
  const alpha = a * v.focus
  if (alpha < 0.02) return
  ctx.font = `${size * v.px}px "Geist Mono", ui-monospace, monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = rgba(rgb, alpha)
  ctx.fillText(text.toUpperCase().split('').join(' '), x, y)
}

// Leader line from a feature to a label, like the callouts on a datasheet.
function callout(ctx, v, text, fx, fy, lx, ly, opts = {}) {
  const alpha = 0.35 * v.focus
  if (alpha < 0.02) return
  ctx.strokeStyle = rgba(C.line, alpha)
  ctx.lineWidth = v.px
  line(ctx, fx, fy, lx, ly)
  ctx.fillStyle = rgba(C.line, alpha * 2)
  ctx.beginPath()
  ctx.arc(fx, fy, 2 * v.px, 0, Math.PI * 2)
  ctx.fill()
  const right = lx >= fx
  label(ctx, v, text, lx + (right ? 6 : -6) * v.px, ly, { align: right ? 'left' : 'right', ...opts })
}

// Corner ticks around the square that holds the previous scale.
function childFrame(ctx, v, rgb = C.line) {
  const s = CHILD
  const k = s * 0.22
  ctx.strokeStyle = rgba(rgb, 0.5)
  ctx.lineWidth = v.px
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath()
    ctx.moveTo(sx * s, sy * (s - k))
    ctx.lineTo(sx * s, sy * s)
    ctx.lineTo(sx * (s - k), sy * s)
    ctx.stroke()
  }
}

/* ── 0 · Gate-all-around nanosheet transistor, cross-section ─────────────────── */

const SHEETS = [-0.3, -0.1, 0.1]
const SHEET_H = 0.075

function drawTransistor(ctx, v) {
  const { px, t0 } = v
  const pulse = 0.5 + 0.5 * Math.sin(t0 * 1.6)

  // Substrate with hatching
  ctx.fillStyle = rgba(C.line, 0.035)
  rect(ctx, v.l, 0.42, v.r - v.l, v.b - 0.42 + 1)
  ctx.fill()
  ctx.strokeStyle = rgba(C.line, 0.08)
  ctx.lineWidth = px
  for (let x = Math.floor(v.l / 0.06) * 0.06; x < v.r + 1; x += 0.06) line(ctx, x, 0.42, x - 0.5, 0.92)
  ctx.strokeStyle = rgba(C.line, 0.4)
  line(ctx, v.l, 0.42, v.r, 0.42)

  // Source / drain epitaxy
  for (const side of [-1, 1]) {
    const pts = [[0.8, 0.42], [0.8, -0.3], [0.7, -0.44], [0.5, -0.44], [0.44, -0.3], [0.44, 0.42]]
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(side * x, y) : ctx.moveTo(side * x, y)))
    ctx.closePath()
    ctx.fillStyle = rgba(C.cyan, 0.07)
    ctx.fill()
    ctx.strokeStyle = rgba(C.cyan, 0.45)
    ctx.lineWidth = px
    ctx.stroke()
    ctx.fillStyle = rgba(C.cyan, 0.22)
    for (let x = 0.47; x < 0.78; x += 0.035) {
      for (let y = -0.38; y < 0.4; y += 0.035) {
        if (hash(Math.round(x * 100), Math.round(y * 100)) > 0.5) {
          ctx.beginPath()
          ctx.arc(side * x, y, 1.2 * px, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  // Gate stack: metal wrapping every sheet
  ctx.fillStyle = rgba(C.coral, 0.1 + 0.05 * pulse)
  rect(ctx, -0.17, -0.52, 0.34, 0.94)
  ctx.fill()
  ctx.strokeStyle = rgba(C.coral, 0.55)
  ctx.lineWidth = px * 1.2
  ctx.stroke()

  // Spacers
  ctx.fillStyle = rgba(C.line, 0.09)
  for (const side of [-1, 1]) {
    rect(ctx, side > 0 ? 0.17 : -0.24, -0.52, 0.07, 0.94)
    ctx.fill()
  }

  // Nanosheet channels with high-k liner
  for (const y of SHEETS) {
    ctx.fillStyle = rgba(C.cyan, 0.18)
    rect(ctx, -0.46, y - SHEET_H / 2, 0.92, SHEET_H)
    ctx.fill()
    ctx.strokeStyle = rgba(C.cyan, 0.85)
    ctx.lineWidth = px * 1.2
    ctx.stroke()
    ctx.strokeStyle = rgba(C.violet, 0.75)
    ctx.lineWidth = px
    rect(ctx, -0.175, y - SHEET_H / 2 - 0.014, 0.35, SHEET_H + 0.028)
    ctx.stroke()
  }

  // Contacts and first metal
  ctx.fillStyle = rgba(C.gold, 0.12)
  ctx.strokeStyle = rgba(C.gold, 0.6)
  ctx.lineWidth = px
  for (const [x, w, top, bot] of [[-0.68, 0.14, -0.98, -0.44], [0.54, 0.14, -0.98, -0.44], [-0.05, 0.1, -0.98, -0.52]]) {
    rect(ctx, x, top, w, bot - top)
    ctx.fill()
    ctx.stroke()
  }
  ctx.strokeStyle = rgba(C.gold, 0.35)
  line(ctx, v.l, -0.98, v.r, -0.98)

  // Electrons drifting source to drain, brighter while the gate is on
  for (let s = 0; s < SHEETS.length; s++) {
    for (let j = 0; j < 6; j++) {
      const f = (t0 * 0.22 + j / 6 + s * 0.13) % 1
      const x = -0.46 + f * 0.92
      const edge = Math.min(1, f * 6, (1 - f) * 6)
      glowDot(ctx, x, SHEETS[s], 2.2 * px, C.coral, (0.35 + 0.55 * pulse) * edge)
    }
  }

  callout(ctx, v, 'Gate', 0.0, -0.75, 0.3, -0.75, { rgb: C.coral })
  callout(ctx, v, 'Nanosheet ×3', 0.4, SHEETS[0], 0.98, -0.62, { rgb: C.cyan })
  callout(ctx, v, 'High-k', 0.175, SHEETS[2] + 0.05, 0.98, 0.26, { rgb: C.violet })
  callout(ctx, v, 'Source', -0.62, 0.0, -0.98, 0.0)
  callout(ctx, v, 'Drain', 0.62, 0.2, 0.98, 0.42)
  callout(ctx, v, 'Substrate', -0.3, 0.6, -0.98, 0.6)
}

/* ── 1 · Standard-cell layout, top view ──────────────────────────────────────── */

const ROW = 0.32
const POLY = 0.064
const M2 = 0.208

function drawLogic(ctx, v) {
  const { px, t0 } = v
  const inChild = (x, y, pad = 0) => Math.abs(x) < CHILD + pad && Math.abs(y) < CHILD + pad
  const r0 = Math.floor((v.t - ROW / 2) / ROW)
  const r1 = Math.ceil((v.b + ROW / 2) / ROW)
  const c0 = Math.floor(v.l / POLY)
  const c1 = Math.ceil(v.r / POLY)

  // Power rails between rows
  ctx.lineWidth = Math.max(px, 0.012)
  for (let r = r0; r <= r1; r++) {
    const y = r * ROW + ROW / 2
    ctx.strokeStyle = rgba(C.teal, 0.2)
    line(ctx, v.l, y, v.r, y)
  }

  for (let r = r0; r <= r1; r++) {
    const yc = r * ROW
    // Diffusion strips: p on top, n on bottom
    for (const [dy, rgb] of [[-0.075, C.green], [0.075, C.amber]]) {
      ctx.fillStyle = rgba(rgb, 0.05)
      ctx.strokeStyle = rgba(rgb, 0.18)
      ctx.lineWidth = px
      for (let c = c0; c < c1; c += 6) {
        const x = c * POLY
        if (hash(c, r) < 0.12) continue
        const w = POLY * (4 + Math.floor(hash(r, c) * 2))
        if (inChild(x + w / 2, yc + dy, 0.02) || inChild(x, yc + dy, 0.02) || inChild(x + w, yc + dy, 0.02)) continue
        rect(ctx, x, yc + dy - 0.035, w, 0.07)
        ctx.fill()
        ctx.stroke()
      }
    }
    // Poly gates
    ctx.strokeStyle = rgba(C.coral, 0.22)
    ctx.lineWidth = Math.max(px, 0.006)
    for (let c = c0; c <= c1; c++) {
      if (c % 6 === 5 || hash(c * 3, r) < 0.08) continue
      const x = c * POLY + POLY / 2
      if (Math.abs(x) < CHILD + 0.02 && Math.abs(yc) < CHILD + ROW / 2) continue
      line(ctx, x, yc - 0.13, x, yc + 0.13)
    }
    // M1 signal tracks with travelling pulses
    for (const dy of [-0.02, 0.02]) {
      const y = yc + dy
      if (Math.abs(y) < CHILD + 0.02) continue
      ctx.strokeStyle = rgba(C.line, 0.07)
      ctx.lineWidth = px
      line(ctx, v.l, y, v.r, y)
      const speed = 0.12 + hash(r, dy * 100) * 0.1
      const dir = hash(dy * 50, r) > 0.5 ? 1 : -1
      const span = v.r - v.l
      for (let k = 0; k < 3; k++) {
        const f = ((t0 * speed * dir + k / 3 + hash(r, k)) % 1 + 1) % 1
        glowDot(ctx, v.l + f * span, y, 1.6 * px, C.coral, 0.6)
      }
    }
  }

  // M2 verticals and vias
  const m0 = Math.floor(v.l / M2)
  const m1 = Math.ceil(v.r / M2)
  ctx.strokeStyle = rgba(C.violet, 0.16)
  ctx.lineWidth = Math.max(px, 0.006)
  for (let m = m0; m <= m1; m++) {
    const x = m * M2 + M2 / 2
    if (Math.abs(x) < CHILD + 0.03) {
      line(ctx, x, v.t, x, -CHILD - 0.03)
      line(ctx, x, CHILD + 0.03, x, v.b)
    } else line(ctx, x, v.t, x, v.b)
    for (let r = r0; r <= r1; r++) {
      if (hash(m, r * 7) < 0.55) continue
      const y = r * ROW + (hash(r, m) > 0.5 ? 0.02 : -0.02)
      if (inChild(x, y, 0.03)) continue
      ctx.fillStyle = rgba(C.violet, 0.4)
      rect(ctx, x - 0.008, y - 0.008, 0.016, 0.016)
      ctx.fill()
    }
  }

  // Simplified transistor in the center once the zoomed-in drawing has faded
  if (v.inner < 1) {
    const a = 1 - v.inner
    ctx.fillStyle = rgba(C.coral, 0.12 * a)
    rect(ctx, -0.025, -CHILD * 0.8, 0.05, CHILD * 1.6)
    ctx.fill()
    ctx.strokeStyle = rgba(C.cyan, 0.8 * a)
    ctx.lineWidth = px * 1.2
    for (const y of SHEETS) line(ctx, -CHILD * 0.7, y * CHILD, CHILD * 0.7, y * CHILD)
  }
  childFrame(ctx, v, C.coral)
  label(ctx, v, '1 transistor', CHILD + 8 * px, -CHILD + 6 * px, { rgb: C.coral, a: 0.8 })
  label(ctx, v, 'Standard cells · M1 · M2 · poly', v.l + 28 * px, v.b - 28 * px, { a: 0.4 })
}

/* ── 2 · Die floorplan; the four blocks are the chapters ─────────────────────── */

export const DIE_BLOCKS = [
  { id: 'mtt-s', label: 'MTT-S · RF', rgb: C.teal, x: -0.86, y: -0.86, w: 0.62, h: 0.62, kind: 'spiral' },
  { id: 'pes', label: 'PES · Power', rgb: C.amber, x: 0.24, y: -0.86, w: 0.62, h: 0.62, kind: 'fingers' },
  { id: 'eds', label: 'EDS · Devices', rgb: C.violet, x: -0.86, y: 0.24, w: 0.62, h: 0.62, kind: 'sram' },
  { id: 'pels', label: 'PELS · Converters', rgb: C.green, x: 0.24, y: 0.24, w: 0.62, h: 0.62, kind: 'stage' },
]

function drawSpiral(ctx, v, b) {
  const cx = b.x + b.w / 2
  const cy = b.y + b.h / 2
  ctx.strokeStyle = rgba(b.rgb, 0.75)
  ctx.lineWidth = Math.max(v.px * 1.2, 0.012)
  ctx.beginPath()
  let s = b.w * 0.4
  ctx.moveTo(cx - s, cy - s)
  for (let turn = 0; turn < 5; turn++) {
    ctx.lineTo(cx + s, cy - s)
    ctx.lineTo(cx + s, cy + s)
    s -= 0.022
    ctx.lineTo(cx - s, cy + s)
    ctx.lineTo(cx - s, cy - s + 0.022)
    s -= 0.022
  }
  ctx.stroke()
}

function drawFingers(ctx, v, b) {
  ctx.fillStyle = rgba(b.rgb, 0.12)
  ctx.strokeStyle = rgba(b.rgb, 0.55)
  ctx.lineWidth = v.px
  for (let i = 0; i < 14; i++) {
    const x = b.x + 0.06 + i * 0.037
    rect(ctx, x, b.y + 0.08, 0.018, b.h - 0.16)
    ctx.fill()
    ctx.stroke()
  }
  rect(ctx, b.x + 0.04, b.y + 0.05, b.w - 0.08, 0.03)
  ctx.stroke()
  rect(ctx, b.x + 0.04, b.y + b.h - 0.08, b.w - 0.08, 0.03)
  ctx.stroke()
}

function drawSram(ctx, v, b) {
  const n = 16
  const cell = (b.w - 0.1) / n
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const on = hash(i, j + Math.floor(v.t0 * 1.5) * 3) > 0.82
      ctx.fillStyle = rgba(b.rgb, on ? 0.7 : 0.1)
      rect(ctx, b.x + 0.05 + i * cell + cell * 0.15, b.y + 0.05 + j * cell + cell * 0.15, cell * 0.7, cell * 0.7)
      ctx.fill()
    }
  }
}

function drawStage(ctx, v, b) {
  ctx.strokeStyle = rgba(b.rgb, 0.6)
  ctx.lineWidth = Math.max(v.px, 0.01)
  for (let i = 0; i < 9; i++) {
    const y = b.y + 0.08 + i * 0.055
    const left = i % 2 === 0
    line(ctx, left ? b.x + 0.06 : b.x + 0.14, y, left ? b.x + b.w - 0.14 : b.x + b.w - 0.06, y)
  }
  ctx.fillStyle = rgba(b.rgb, 0.18)
  for (const [px, py] of [[0.08, 0.6], [0.3, 0.6], [0.52, 0.6]]) {
    rect(ctx, b.x + px - 0.04, b.y + py - 0.06 + 0.06, 0.08, 0.06)
    ctx.fill()
    ctx.stroke()
  }
}

function drawDie(ctx, v) {
  const { px, t0 } = v
  const pitch = 1.96

  // Neighboring dies on the wafer
  ctx.strokeStyle = rgba(C.line, 0.07)
  ctx.lineWidth = px
  for (let i = Math.floor(v.l / pitch) - 1; i <= Math.ceil(v.r / pitch) + 1; i++) {
    for (let j = Math.floor(v.t / pitch) - 1; j <= Math.ceil(v.b / pitch) + 1; j++) {
      if (!i && !j) continue
      rect(ctx, i * pitch - 0.94, j * pitch - 0.94, 1.88, 1.88)
      ctx.stroke()
    }
  }

  // Die, seal ring, pad ring
  ctx.fillStyle = 'rgba(12, 14, 22, 0.9)'
  rect(ctx, -0.94, -0.94, 1.88, 1.88)
  ctx.fill()
  ctx.strokeStyle = rgba(C.line, 0.5)
  ctx.stroke()
  ctx.strokeStyle = rgba(C.line, 0.18)
  rect(ctx, -0.915, -0.915, 1.83, 1.83)
  ctx.stroke()
  ctx.fillStyle = rgba(C.gold, 0.35)
  for (let k = -0.86; k <= 0.86; k += 0.06) {
    for (const [x, y] of [[k, -0.94], [k, 0.9], [-0.94, k], [0.9, k]]) {
      rect(ctx, x + 0.006, y + 0.006, 0.028, 0.028)
      ctx.fill()
    }
  }

  // Glue logic: faint rows between blocks
  ctx.strokeStyle = rgba(C.line, 0.06)
  for (let y = -0.86; y < 0.86; y += 0.018) {
    if (Math.abs(y) > 0.2) continue
    line(ctx, -0.86, y, -CHILD - 0.02, y)
    line(ctx, CHILD + 0.02, y, 0.86, y)
  }
  for (let x = -0.86; x < 0.86; x += 0.018) {
    if (Math.abs(x) > 0.2) continue
    line(ctx, x, -0.86, x, -CHILD - 0.02)
    line(ctx, x, CHILD + 0.02, x, 0.86)
  }

  for (const b of DIE_BLOCKS) {
    const g = ctx.createRadialGradient(b.x + b.w / 2, b.y + b.h / 2, 0, b.x + b.w / 2, b.y + b.h / 2, b.w * 0.8)
    g.addColorStop(0, rgba(b.rgb, 0.12))
    g.addColorStop(1, rgba(b.rgb, 0))
    ctx.fillStyle = g
    rect(ctx, b.x, b.y, b.w, b.h)
    ctx.fill()
    ctx.strokeStyle = rgba(b.rgb, 0.6)
    ctx.lineWidth = px
    ctx.stroke()
    if (b.kind === 'spiral') drawSpiral(ctx, v, b)
    else if (b.kind === 'fingers') drawFingers(ctx, v, b)
    else if (b.kind === 'sram') drawSram(ctx, v, b)
    else drawStage(ctx, v, b)
    label(ctx, v, b.label, b.x + 10 * px, b.y + 12 * px, { rgb: b.rgb, a: 0.95 })
  }

  // Buses from the logic core to each block, with data moving along them
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x1 = dx * CHILD
    const y1 = dy * CHILD
    const x2 = dx * 0.24
    const y2 = dy * 0.24
    ctx.strokeStyle = rgba(C.line, 0.25)
    ctx.lineWidth = px
    line(ctx, x1, y1, x2, y2)
    const f = (t0 * 0.5 + (dx + 2) * 0.1 + (dy + 2) * 0.23) % 1
    glowDot(ctx, x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 2 * px, C.coral, 0.8)
  }

  if (v.inner < 1) {
    const a = 1 - v.inner
    ctx.strokeStyle = rgba(C.coral, 0.3 * a)
    ctx.lineWidth = px
    for (let y = -CHILD; y < CHILD; y += CHILD / 5) line(ctx, -CHILD, y, CHILD, y)
  }
  childFrame(ctx, v, C.coral)
  label(ctx, v, 'Logic core', CHILD + 8 * px, -CHILD + 6 * px, { rgb: C.coral, a: 0.8 })
}

/* ── 3 · Package: interposer, HBM, substrate ─────────────────────────────────── */

function drawPackage(ctx, v) {
  const { px, t0 } = v

  ctx.fillStyle = 'rgba(30, 22, 17, 0.9)'
  ctx.beginPath()
  ctx.roundRect(-0.95, -0.95, 1.9, 1.9, 0.06)
  ctx.fill()
  ctx.strokeStyle = rgba(C.amber, 0.35)
  ctx.lineWidth = px
  ctx.stroke()
  ctx.fillStyle = rgba(C.amber, 0.28)
  for (let x = -0.9; x <= 0.9; x += 0.05) {
    for (let y = -0.9; y <= 0.9; y += 0.05) {
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) continue
      ctx.beginPath()
      ctx.arc(x, y, 1.3 * px, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Decoupling caps
  ctx.fillStyle = rgba(C.gold, 0.35)
  for (let i = -3; i <= 3; i++) {
    for (const s of [-1, 1]) {
      rect(ctx, i * 0.12 - 0.02, s * 0.72 - 0.01, 0.04, 0.02)
      ctx.fill()
      rect(ctx, s * 0.72 - 0.01, i * 0.12 - 0.02, 0.02, 0.04)
      ctx.fill()
    }
  }

  // Interposer
  ctx.fillStyle = 'rgba(28, 28, 44, 0.95)'
  rect(ctx, -0.46, -0.36, 0.92, 0.72)
  ctx.fill()
  ctx.strokeStyle = rgba(C.violet, 0.5)
  ctx.stroke()
  ctx.strokeStyle = rgba(C.violet, 0.08)
  for (let x = -0.46; x < 0.46; x += 0.02) line(ctx, x, -0.36, x, 0.36)
  for (let y = -0.36; y < 0.36; y += 0.02) line(ctx, -0.46, y, 0.46, y)

  // Iridescent glow under the compute die
  const sheen = ctx.createConicGradient
    ? ctx.createConicGradient(t0 * 0.3, 0, 0)
    : ctx.createRadialGradient(0, 0, 0, 0, 0, 0.3)
  const stops = ['#6E5BD8', '#3BA7C0', '#8FC46E', '#E0B252', '#E06A5F', '#B04A8C', '#6E5BD8']
  stops.forEach((c, i) => sheen.addColorStop(i / (stops.length - 1), c))
  ctx.save()
  ctx.globalAlpha *= 0.32
  ctx.fillStyle = sheen
  ctx.beginPath()
  ctx.arc(0, 0, CHILD * 1.9, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = C.bg
  rect(ctx, -CHILD, -CHILD, CHILD * 2, CHILD * 2)
  ctx.fill()

  // HBM stacks
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const x = sx > 0 ? 0.22 : -0.36
      const y = sy > 0 ? 0.03 : -0.27
      ctx.fillStyle = 'rgba(44, 42, 58, 0.95)'
      rect(ctx, x, y, 0.14, 0.24)
      ctx.fill()
      ctx.strokeStyle = rgba(C.cyan, 0.45)
      ctx.stroke()
      ctx.strokeStyle = rgba(C.cyan, 0.16)
      for (let k = 1; k < 8; k++) line(ctx, x, y + k * 0.03, x + 0.14, y + k * 0.03)
      const f = (t0 * 0.7 + sx * 0.2 + sy * 0.35 + 1) % 1
      const ex = sx > 0 ? 0.22 : -0.22
      glowDot(ctx, ex + (sx > 0 ? -1 : 1) * f * (0.22 - CHILD), y + 0.12, 1.8 * px, C.cyan, 0.8)
    }
  }

  childFrame(ctx, v, C.coral)
  label(ctx, v, 'Compute die', CHILD + 8 * px, -CHILD - 10 * px, { rgb: C.coral, a: 0.8 })
  callout(ctx, v, 'HBM', -0.29, -0.27, -0.6, -0.5, { rgb: C.cyan })
  callout(ctx, v, 'Interposer', 0.46, 0.3, 0.8, 0.5, { rgb: C.violet })
  callout(ctx, v, 'Substrate', -0.8, 0.8, -1.05, 1.0, { rgb: C.amber })
}

/* ── 4 · Board: past speakers on the silkscreen ──────────────────────────────── */

export const BOARD_CHIPS = [
  { name: 'Wozniak', x: -0.78, y: -0.66, w: 0.34, h: 0.2 },
  { name: 'Hennessy', x: 0.42, y: -0.7, w: 0.36, h: 0.22 },
  { name: 'Bechtolsheim', x: -0.92, y: 0.0, w: 0.46, h: 0.2 },
  { name: 'Shih', x: 0.52, y: -0.12, w: 0.26, h: 0.2 },
  { name: 'Feldman', x: -0.58, y: 0.5, w: 0.32, h: 0.2 },
  { name: 'Kurian', x: 0.3, y: 0.46, w: 0.3, h: 0.2 },
  { name: 'Ho', x: -0.12, y: -0.78, w: 0.22, h: 0.16 },
]

function route(ctx, x1, y1, x2, y2) {
  // Orthogonal trace with a 45° chamfer, as a PCB router would draw it
  const dx = x2 - x1
  const dy = y2 - y1
  const d = Math.min(Math.abs(dx), Math.abs(dy))
  const pts = [[x1, y1], [x1 + Math.sign(dx) * (Math.abs(dx) - d), y1], [x2, y2]]
  if (Math.abs(dy) > Math.abs(dx)) {
    pts[1] = [x1, y1 + Math.sign(dy) * (Math.abs(dy) - d)]
  }
  return pts
}

function along(pts, f) {
  const segs = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    segs.push(l)
    total += l
  }
  let d = f * total
  for (let i = 1; i < pts.length; i++) {
    if (d <= segs[i - 1]) {
      const k = segs[i - 1] ? d / segs[i - 1] : 0
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]
    }
    d -= segs[i - 1]
  }
  return pts[pts.length - 1]
}

function drawBoard(ctx, v) {
  const { px, t0 } = v

  ctx.fillStyle = 'rgba(8, 18, 16, 0.96)'
  ctx.beginPath()
  ctx.roundRect(-1.08, -0.98, 2.16, 1.96, 0.04)
  ctx.fill()
  ctx.strokeStyle = rgba(C.green, 0.3)
  ctx.lineWidth = px
  ctx.stroke()

  // Ground pour texture
  ctx.strokeStyle = rgba(C.green, 0.05)
  for (let k = -2; k < 2; k += 0.03) line(ctx, k, -0.98, k + 0.6, 0.98)

  // Mounting holes
  for (const [x, y] of [[-1, -0.9], [1, -0.9], [-1, 0.9], [1, 0.9]]) {
    ctx.strokeStyle = rgba(C.gold, 0.5)
    ctx.beginPath()
    ctx.arc(x, y, 0.035, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Traces from the package to each chip, with signals
  for (const [i, c] of BOARD_CHIPS.entries()) {
    const tx = c.x + c.w / 2
    const ty = c.y + (c.y < 0 ? c.h : 0)
    const sx = Math.sign(tx) * CHILD * 0.6
    const sy = Math.sign(ty) * CHILD
    for (const off of [-0.012, 0, 0.012]) {
      const pts = route(ctx, sx + off, sy, tx + off, ty)
      ctx.strokeStyle = rgba(C.gold, 0.32)
      ctx.lineWidth = Math.max(px, 0.004)
      ctx.beginPath()
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.stroke()
    }
    const f = (t0 * 0.35 + i * 0.17) % 1
    const [gx, gy] = along(route(ctx, sx, sy, tx, ty), f)
    glowDot(ctx, gx, gy, 2 * px, C.gold, 0.85)
  }

  // Chips with speaker names on the silkscreen
  for (const c of BOARD_CHIPS) {
    ctx.fillStyle = 'rgba(14, 14, 18, 0.98)'
    rect(ctx, c.x, c.y, c.w, c.h)
    ctx.fill()
    ctx.strokeStyle = rgba(C.line, 0.3)
    ctx.stroke()
    ctx.fillStyle = rgba(C.gold, 0.45)
    const pins = Math.floor(c.w / 0.03)
    for (let p = 0; p < pins; p++) {
      rect(ctx, c.x + 0.015 + p * 0.03, c.y - 0.014, 0.012, 0.014)
      ctx.fill()
      rect(ctx, c.x + 0.015 + p * 0.03, c.y + c.h, 0.012, 0.014)
      ctx.fill()
    }
    ctx.fillStyle = rgba(C.line, 0.35)
    ctx.beginPath()
    ctx.arc(c.x + 0.025, c.y + 0.025, 0.008, 0, Math.PI * 2)
    ctx.fill()
    label(ctx, v, c.name, c.x + c.w / 2, c.y + c.h / 2, { align: 'center', rgb: C.gold, a: 1, size: 13 })
  }

  // Passives
  ctx.fillStyle = rgba(C.amber, 0.4)
  for (let i = 0; i < 26; i++) {
    const x = (hash(i, 3) * 2 - 1) * 1.0
    const y = (hash(i, 7) * 2 - 1) * 0.9
    if (Math.abs(x) < 0.3 && Math.abs(y) < 0.3) continue
    if (BOARD_CHIPS.some((c) => x > c.x - 0.04 && x < c.x + c.w + 0.04 && y > c.y - 0.04 && y < c.y + c.h + 0.04)) continue
    rect(ctx, x, y, 0.03, 0.014)
    ctx.fill()
  }

  childFrame(ctx, v, C.coral)
  label(ctx, v, 'IEEE Stanford · Rev 2026', -1.04, 0.94, { a: 0.4 })
}

/* ── 5 · Community: the board becomes one node in a network ──────────────────── */

const NODES = Array.from({ length: 170 }, (_, i) => ({
  x: (hash(i, 1) * 2 - 1) * 3.4,
  y: (hash(i, 2) * 2 - 1) * 2.2,
  r: 1 + hash(i, 3) * 1.8,
  ph: hash(i, 4) * 6.28,
  sp: 0.15 + hash(i, 5) * 0.25,
}))

function drawNetwork(ctx, v) {
  const { px, t0, mouse } = v
  const pos = NODES.map((n) => {
    let x = n.x + Math.sin(t0 * n.sp + n.ph) * 0.08
    let y = n.y + Math.cos(t0 * n.sp * 0.8 + n.ph) * 0.08
    if (mouse) {
      const dx = x - mouse.x
      const dy = y - mouse.y
      const d = Math.hypot(dx, dy)
      if (d < 0.6 && d > 0.001) {
        const k = (0.6 - d) / 0.6
        x += (dx / d) * k * 0.12
        y += (dy / d) * k * 0.12
      }
    }
    return [x, y]
  })
  pos.push([0, 0])

  const link = 0.5
  ctx.lineWidth = px
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      const d = Math.hypot(pos[i][0] - pos[j][0], pos[i][1] - pos[j][1])
      if (d < link) {
        ctx.strokeStyle = rgba(C.coral, (1 - d / link) * 0.35)
        line(ctx, pos[i][0], pos[i][1], pos[j][0], pos[j][1])
      }
    }
    if (mouse) {
      const d = Math.hypot(pos[i][0] - mouse.x, pos[i][1] - mouse.y)
      if (d < 0.7) {
        ctx.strokeStyle = rgba('255, 140, 130', (1 - d / 0.7) * 0.5)
        line(ctx, pos[i][0], pos[i][1], mouse.x, mouse.y)
      }
    }
  }
  NODES.forEach((n, i) => {
    const a = 0.45 + 0.3 * Math.sin(t0 * 1.2 + n.ph)
    glowDot(ctx, pos[i][0], pos[i][1], n.r * px, C.coral, a)
  })

  // The board we came from, now a single bright node
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, CHILD * 2.2)
  halo.addColorStop(0, rgba(C.coral, 0.25))
  halo.addColorStop(1, rgba(C.coral, 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(0, 0, CHILD * 2.2, 0, Math.PI * 2)
  ctx.fill()
}

export const SCENES = [
  { id: 'transistor', name: 'Transistor', scale: 12e-9, draw: drawTransistor },
  { id: 'logic', name: 'Logic', scale: 1.5e-6, draw: drawLogic },
  { id: 'die', name: 'Die', scale: 8e-3, draw: drawDie },
  { id: 'package', name: 'Package', scale: 4.5e-2, draw: drawPackage },
  { id: 'board', name: 'Board', scale: 0.25, draw: drawBoard },
  { id: 'community', name: 'Community', scale: 1500, draw: drawNetwork },
]

export function formatScale(m) {
  if (m < 1e-6) return `${(m * 1e9).toFixed(m < 1e-7 ? 0 : 0)} nm`
  if (m < 1e-3) return `${(m * 1e6).toFixed(m < 1e-5 ? 1 : 0)} µm`
  if (m < 1e-2) return `${(m * 1e3).toFixed(1)} mm`
  if (m < 1) return `${(m * 100).toFixed(m < 0.1 ? 1 : 0)} cm`
  if (m < 1000) return `${m.toFixed(0)} m`
  return `${(m / 1000).toFixed(1)} km`
}
