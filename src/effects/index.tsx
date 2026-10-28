import type { FC } from 'react'
import { useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Bubbles, CloudRain, Flame, Orbit, Rainbow, Snowflake, Sparkles, Star, Waves, Zap,
} from 'lucide-react'
import { engine } from '../audio/engine'
import { opts } from '../lib/fields'
import type { Field } from '../lib/fields'
import { useAccent, useCanvas } from '../lib/hooks'
import { usePlayer } from '../store/player'

type S = Record<string, unknown> & { color: string; density: number; speed: number; opacity: number; react: boolean }

type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number; t: number }

type ParticleSpec = {
  spawn: (w: number, h: number, s: S, initial: boolean) => Particle
  step: (p: Particle, w: number, h: number, s: S, beat: number) => boolean // false = respawn
  draw: (ctx: CanvasRenderingContext2D, p: Particle, color: string, s: S, beat: number) => void
  links?: boolean
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/** Generic full-screen particle layer; each effect only describes spawn/step/draw. */
function particleEffect(spec: ParticleSpec): FC<{ settings: S }> {
  return function ParticleLayer({ settings: s }) {
    const accent = useAccent()
    const color = s.color || accent
    const ps = useRef<Particle[]>([])
    const ref = useCanvas((ctx, w, h) => {
      const beat = s.react ? engine.bass() : 0
      const target = Math.round(s.density)
      while (ps.current.length < target) ps.current.push(spec.spawn(w, h, s, true))
      if (ps.current.length > target) ps.current.length = target
      for (let i = 0; i < ps.current.length; i++) {
        const p = ps.current[i]
        if (!spec.step(p, w, h, s, beat)) ps.current[i] = spec.spawn(w, h, s, false)
        spec.draw(ctx, ps.current[i], color, s, beat)
      }
      if (spec.links && s.links) {
        ctx.strokeStyle = color
        ctx.lineWidth = 0.6
        const max = 120
        for (let i = 0; i < ps.current.length; i++) {
          for (let j = i + 1; j < ps.current.length; j++) {
            const a = ps.current[i], b = ps.current[j]
            const d = Math.hypot(a.x - b.x, a.y - b.y)
            if (d < max) {
              ctx.globalAlpha = (1 - d / max) * 0.35
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
            }
          }
        }
        ctx.globalAlpha = 1
      }
    })
    return <canvas ref={ref} className="fx" style={{ opacity: s.opacity }} />
  }
}

const Stars = particleEffect({
  spawn: (w, h) => ({ x: rnd(0, w), y: rnd(0, h), vx: 0, vy: 0, r: rnd(0.4, 1.6), a: 0, t: rnd(0, 100) }),
  step: (p, _w, _h, s) => { p.t += 0.02 * s.speed; return true },
  draw: (ctx, p, color, _s, beat) => {
    ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(p.t)) * (0.7 + beat)
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + beat), 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  },
})

const Particles = particleEffect({
  links: true,
  spawn: (w, h, _s, initial) => ({ x: rnd(0, w), y: initial ? rnd(0, h) : h + 10, vx: rnd(-0.3, 0.3), vy: rnd(-0.6, -0.15), r: rnd(1, 2.6), a: rnd(0.3, 0.9), t: 0 }),
  step: (p, w, _h, s, beat) => {
    p.x += p.vx * s.speed * (1 + beat * 4)
    p.y += p.vy * s.speed * (1 + beat * 4)
    return p.y > -10 && p.x > -10 && p.x < w + 10
  },
  draw: (ctx, p, color, _s, beat) => {
    ctx.globalAlpha = p.a
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + beat * 1.5), 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  },
})

const Snow = particleEffect({
  spawn: (w, h, s, initial) => ({ x: rnd(0, w), y: initial ? rnd(0, h) : -10, vx: 0, vy: rnd(0.4, 1.2), r: rnd(1, 3.2) * (Number(s.size) || 1), a: rnd(0.4, 0.9), t: rnd(0, 6) }),
  step: (p, _w, h, s, beat) => {
    p.t += 0.01
    p.y += p.vy * s.speed * (1 + beat * 2)
    p.x += Math.sin(p.t) * 0.5
    return p.y < h + 10
  },
  draw: (ctx, p, color) => {
    ctx.globalAlpha = p.a
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  },
})

const Rain = particleEffect({
  spawn: (w, h, _s, initial) => ({ x: rnd(-100, w + 100), y: initial ? rnd(0, h) : rnd(-60, -10), vx: 0, vy: rnd(7, 13), r: rnd(10, 22), a: rnd(0.2, 0.55), t: 0 }),
  step: (p, _w, h, s) => {
    const ang = (Number(s.angle) || 0) * (Math.PI / 180)
    p.y += p.vy * s.speed
    p.x += Math.tan(ang) * p.vy * s.speed
    return p.y < h + 30
  },
  draw: (ctx, p, color, s) => {
    const ang = (Number(s.angle) || 0) * (Math.PI / 180)
    ctx.globalAlpha = p.a
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - Math.sin(ang) * p.r, p.y - Math.cos(ang) * p.r); ctx.stroke()
    ctx.globalAlpha = 1
  },
})

const BubblesFx = particleEffect({
  spawn: (w, h, _s, initial) => ({ x: rnd(0, w), y: initial ? rnd(0, h) : h + 40, vx: 0, vy: rnd(0.3, 1), r: rnd(4, 22), a: rnd(0.15, 0.45), t: rnd(0, 6) }),
  step: (p, _w, _h, s, beat) => {
    p.t += 0.02
    p.y -= p.vy * s.speed * (1 + beat * 3)
    p.x += Math.sin(p.t) * 0.4
    return p.y > -40
  },
  draw: (ctx, p, color, _s, beat) => {
    ctx.globalAlpha = p.a
    ctx.strokeStyle = color
    ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + beat * 0.3), 0, Math.PI * 2); ctx.stroke()
    ctx.globalAlpha = p.a * 0.6
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.18, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  },
})

const Fireflies = particleEffect({
  spawn: (w, h) => ({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.5, 0.5), vy: rnd(-0.5, 0.5), r: rnd(1.5, 3), a: 0, t: rnd(0, 6) }),
  step: (p, w, h, s) => {
    p.t += 0.03 * s.speed
    p.vx += rnd(-0.05, 0.05); p.vy += rnd(-0.05, 0.05)
    p.vx = Math.max(-0.8, Math.min(0.8, p.vx)); p.vy = Math.max(-0.8, Math.min(0.8, p.vy))
    p.x += p.vx * s.speed; p.y += p.vy * s.speed
    return p.x > -20 && p.x < w + 20 && p.y > -20 && p.y < h + 20
  },
  draw: (ctx, p, color, _s, beat) => {
    const glow = Math.max(0, Math.sin(p.t)) * (0.6 + beat)
    ctx.globalAlpha = Math.min(1, glow)
    ctx.shadowBlur = 16
    ctx.shadowColor = color
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  },
})

const Meteors = particleEffect({
  spawn: (w, h, _s, initial) => ({ x: rnd(0, w * 1.4), y: initial ? rnd(-h, 0) : rnd(-h, -20), vx: -rnd(6, 11), vy: rnd(4, 7), r: rnd(60, 140), a: rnd(0.4, 1), t: 0 }),
  step: (p, _w, h, s) => { p.x += p.vx * s.speed; p.y += p.vy * s.speed; return p.y < h + 150 && p.x > -150 },
  draw: (ctx, p, color) => {
    const len = Math.hypot(p.vx, p.vy)
    const tx = p.x - (p.vx / len) * p.r, ty = p.y - (p.vy / len) * p.r
    const g = ctx.createLinearGradient(p.x, p.y, tx, ty)
    g.addColorStop(0, color); g.addColorStop(1, 'transparent')
    ctx.globalAlpha = p.a
    ctx.strokeStyle = g; ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(tx, ty); ctx.stroke()
    ctx.globalAlpha = 1
  },
})

function Rings({ settings: s }: { settings: S }) {
  const accent = useAccent()
  const color = s.color || accent
  const rings = useRef<{ r: number; a: number }[]>([])
  const last = useRef(0)
  const ref = useCanvas((ctx, w, h, t) => {
    const bass = engine.bass()
    const threshold = 0.85 - (Number(s.sensitivity) || 0.5) * 0.4
    if (bass > threshold && t - last.current > 220) {
      rings.current.push({ r: 20, a: Math.min(1, bass) })
      last.current = t
    }
    // a slow idle ring keeps the layer alive when nothing is playing
    if (!usePlayer.getState().playing && t - last.current > 2400) {
      rings.current.push({ r: 20, a: 0.4 }); last.current = t
    }
    const max = Math.hypot(w, h) / 2
    ctx.strokeStyle = color
    rings.current = rings.current.filter((ring) => {
      ring.r += 3 * s.speed
      ring.a *= 0.985
      ctx.globalAlpha = ring.a * (1 - ring.r / max)
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(w / 2, h / 2, ring.r, 0, Math.PI * 2); ctx.stroke()
      return ring.r < max && ring.a > 0.02
    })
    ctx.globalAlpha = 1
  })
  return <canvas ref={ref} className="fx" style={{ opacity: s.opacity }} />
}

function Aurora({ settings: s }: { settings: S }) {
  const accent = useAccent()
  const colors = [s.color || accent, String(s.color2 || '#00d4ff'), String(s.color3 || '#ff6ec7')]
  const ref = useCanvas((ctx, w, h, t) => {
    const beat = s.react ? engine.bass() : 0
    ctx.globalCompositeOperation = 'lighter'
    colors.forEach((c, i) => {
      const k = t * 0.00012 * s.speed + i * 2.1
      const x = w * (0.5 + 0.35 * Math.sin(k * 1.3))
      const y = h * (0.5 + 0.3 * Math.cos(k))
      const r = Math.max(w, h) * (0.35 + beat * 0.15)
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, c + '88'); g.addColorStop(1, c + '00')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    })
    ctx.globalCompositeOperation = 'source-over'
  })
  return <canvas ref={ref} className="fx" style={{ opacity: s.opacity }} />
}

function Floor({ settings: s }: { settings: S }) {
  const accent = useAccent()
  const color = s.color || accent
  const ref = useCanvas((ctx, w, h) => {
    const d = engine.frequency()
    const n = Math.round(Number(s.density) || 64)
    const bw = w / n
    const maxH = h * (Number(s.height) || 0.25)
    const g = ctx.createLinearGradient(0, h, 0, h - maxH)
    g.addColorStop(0, color); g.addColorStop(1, color + '00')
    ctx.fillStyle = g
    for (let i = 0; i < n; i++) {
      const v = (d[Math.floor((i / n) * d.length * 0.6)] ?? 0) / 255
      const bh = v * maxH
      ctx.fillRect(i * bw + 1, h - bh, bw - 2, bh)
    }
  })
  return <canvas ref={ref} className="fx" style={{ opacity: s.opacity }} />
}

export type EffectDef = {
  type: string
  name: string
  description: string
  icon: LucideIcon
  defaults: Record<string, unknown>
  fields: Field[]
  component: FC<{ settings: S }>
}

const base = { color: '', opacity: 0.8, speed: 1, react: true }
const color: Field = { key: 'color', label: 'Renk', type: 'color' }
const density = (max: number): Field => ({ key: 'density', label: 'Yoğunluk', type: 'range', min: 5, max })
const speed: Field = { key: 'speed', label: 'Hız', type: 'range', min: 0.1, max: 4, step: 0.1 }
const react: Field = { key: 'react', label: 'Müziğe tepki', type: 'toggle' }

export const COMMON_EFFECT_FIELDS: Field[] = [{ key: 'opacity', label: 'Görünürlük', type: 'range', min: 0.05, max: 1, step: 0.05 }]

export const EFFECTS: EffectDef[] = [
  { type: 'stars', name: 'Yıldızlar', description: 'Parıldayan yıldızlar', icon: Star, component: Stars,
    defaults: { ...base, color: '#ffffff', density: 120, opacity: 0.6 }, fields: [color, density(400), speed, react] },
  { type: 'particles', name: 'Parçacıklar', description: 'Yükselen ışık noktaları', icon: Sparkles, component: Particles,
    defaults: { ...base, density: 70, links: true }, fields: [color, density(200), speed, { key: 'links', label: 'Bağlantı çizgileri', type: 'toggle' }, react] },
  { type: 'snow', name: 'Kar', description: 'Yavaşça düşen kar taneleri', icon: Snowflake, component: Snow,
    defaults: { ...base, color: '#ffffff', density: 140, size: 1, react: false }, fields: [color, density(400), speed, { key: 'size', label: 'Tane boyutu', type: 'range', min: 0.5, max: 3, step: 0.1 }, react] },
  { type: 'rain', name: 'Yağmur', description: 'Yağmur damlaları', icon: CloudRain, component: Rain,
    defaults: { ...base, color: '#a8c5ff', density: 160, angle: 10, opacity: 0.6, react: false }, fields: [color, density(500), speed, { key: 'angle', label: 'Açı', type: 'range', min: -40, max: 40 }] },
  { type: 'bubbles', name: 'Baloncuklar', description: 'Yükselen baloncuklar', icon: Bubbles, component: BubblesFx,
    defaults: { ...base, density: 40 }, fields: [color, density(120), speed, react] },
  { type: 'fireflies', name: 'Ateş Böcekleri', description: 'Parlayıp sönen ışıklar', icon: Flame, component: Fireflies,
    defaults: { ...base, color: '#ffd166', density: 45 }, fields: [color, density(150), speed, react] },
  { type: 'meteors', name: 'Kayan Yıldızlar', description: 'Gökyüzünden kayan yıldızlar', icon: Zap, component: Meteors,
    defaults: { ...base, color: '#ffffff', density: 6, react: false }, fields: [color, density(30), speed] },
  { type: 'rings', name: 'Ritim Halkaları', description: 'Baslarda merkezden yayılan halkalar', icon: Orbit, component: Rings,
    defaults: { ...base, sensitivity: 0.5, opacity: 0.6 }, fields: [color, speed, { key: 'sensitivity', label: 'Hassasiyet', type: 'range', min: 0, max: 1, step: 0.05 }] },
  { type: 'aurora', name: 'Aurora', description: 'Hareketli renkli ışık bulutları', icon: Rainbow, component: Aurora,
    defaults: { ...base, color2: '#00d4ff', color3: '#ff6ec7', opacity: 0.35 }, fields: [
      { key: 'color', label: 'Renk 1', type: 'color' }, { key: 'color2', label: 'Renk 2', type: 'color' }, { key: 'color3', label: 'Renk 3', type: 'color' }, speed, react] },
  { type: 'floor', name: 'Alt Spektrum', description: 'Ekranın altında müzikle dans eden çubuklar', icon: Waves, component: Floor,
    defaults: { ...base, density: 64, height: 0.25, opacity: 0.5 }, fields: [color, { key: 'density', label: 'Çubuk sayısı', type: 'range', min: 16, max: 160 }, { key: 'height', label: 'Yükseklik', type: 'range', min: 0.05, max: 0.8, step: 0.05 }] },
]

export const effectDef = (type: string) => EFFECTS.find((e) => e.type === type)

export const WIDGET_ANIMS = opts(['none', 'Yok'], ['float', 'Süzülme'], ['pulse', 'Ritimle büyüme'], ['glow', 'Ritimle parlama'], ['tilt', 'Sallanma'])
