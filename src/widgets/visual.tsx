import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { engine, EQ_BANDS, EQ_PRESETS } from '../audio/engine'
import { useT } from '../i18n'
import { useAccent, useCanvas } from '../lib/hooks'
import { usePlayer } from '../store/player'
import type { WidgetProps } from './types'

/** Empty color setting means "follow the theme accent". */
function useColor(c: string) {
  const accent = useAccent()
  return c || accent
}

/** Log-spaced bucketing of FFT bins so bass doesn't hog the whole display. */
function buckets(data: Uint8Array, count: number, maxBin = data.length * 0.7) {
  const out = new Array<number>(count)
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.pow(maxBin, i / count))
    const b = Math.max(a + 1, Math.floor(Math.pow(maxBin, (i + 1) / count)))
    let sum = 0
    for (let j = a; j < b; j++) sum += data[j] ?? 0
    out[i] = sum / (b - a) / 255
  }
  return out
}

function useImage(src?: string) {
  const [img, setImg] = useState<HTMLImageElement>()
  useEffect(() => {
    setImg(undefined)
    if (!src) return
    const i = new Image()
    i.onload = () => setImg(i)
    i.src = src
  }, [src])
  return img
}

/* ---------------- Equalizer ---------------- */

export const eqDefaults = { showPresets: true, showLabels: true }

export function EqualizerWidget({ settings: s }: WidgetProps<typeof eqDefaults>) {
  const t = useT()
  const eq = usePlayer((p) => p.eq)
  const { setEq, setEqAll } = usePlayer.getState()
  const preset = Object.entries(EQ_PRESETS).find(([, g]) => g.every((v, i) => v === eq[i]))?.[0] ?? ''
  return (
    <div className="eq">
      {s.showPresets && (
        <select className="eq-preset" value={preset} onChange={(e) => setEqAll(EQ_PRESETS[e.target.value])}>
          {!preset && <option value="">{t('eq.custom')}</option>}
          {Object.keys(EQ_PRESETS).map((k) => <option key={k} value={k}>{t(`eq.${k}`)}</option>)}
        </select>
      )}
      <div className="eq-bands">
        {EQ_BANDS.map((f, i) => (
          <div key={f} className="eq-band">
            {s.showLabels && <span className="small muted">{eq[i] > 0 ? '+' : ''}{eq[i]}</span>}
            <input
              type="range" min={-12} max={12} step={1} value={eq[i]}
              onChange={(e) => setEq(i, Number(e.target.value))}
              onDoubleClick={() => setEq(i, 0)}
              style={{ '--pct': `${((eq[i] + 12) / 24) * 100}%` } as CSSProperties}
            />
            {s.showLabels && <span className="small muted">{f >= 1000 ? `${f / 1000}k` : f}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Spectrum bars ---------------- */

export const barsDefaults = { count: 48, color: '', color2: '#ff6ec7', gradient: true, mirror: false, rounded: true, gap: 3, peaks: true }

export function BarsWidget({ settings: s }: WidgetProps<typeof barsDefaults>) {
  const color = useColor(s.color)
  const peaks = useRef<number[]>([])
  const ref = useCanvas((ctx, w, h) => {
    const vals = buckets(engine.frequency(), s.count)
    const bw = Math.max(1, (w - s.gap * (s.count - 1)) / s.count)
    let fill: string | CanvasGradient = color
    if (s.gradient) {
      const g = ctx.createLinearGradient(0, h, 0, 0)
      g.addColorStop(0, color)
      g.addColorStop(1, s.color2)
      fill = g
    }
    ctx.fillStyle = fill
    vals.forEach((v, i) => {
      const bh = Math.max(2, v * h * (s.mirror ? 0.5 : 1))
      const x = i * (bw + s.gap)
      const y = s.mirror ? h / 2 - bh : h - bh
      const hh = s.mirror ? bh * 2 : bh
      ctx.beginPath()
      if (s.rounded) ctx.roundRect(x, y, bw, hh, Math.min(bw / 2, 6))
      else ctx.rect(x, y, bw, hh)
      ctx.fill()
      if (s.peaks && !s.mirror) {
        const p = Math.max(bh, (peaks.current[i] ?? 0) - h * 0.008)
        peaks.current[i] = p
        ctx.fillRect(x, h - p - 4, bw, 2)
      }
    })
  })
  return <canvas ref={ref} className="viz" />
}

/* ---------------- Waveform ---------------- */

export const waveDefaults = { color: '', width: 2, glow: true, fill: false }

export function WaveWidget({ settings: s }: WidgetProps<typeof waveDefaults>) {
  const color = useColor(s.color)
  const ref = useCanvas((ctx, w, h) => {
    const d = engine.waveform()
    ctx.lineWidth = s.width
    ctx.strokeStyle = color
    ctx.shadowBlur = s.glow ? 14 : 0
    ctx.shadowColor = color
    ctx.beginPath()
    const step = d.length / w
    for (let x = 0; x < w; x++) {
      const v = d[Math.floor(x * step)] / 128 - 1
      const y = h / 2 + v * h * 0.45
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    if (s.fill) {
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath()
      ctx.globalAlpha = 0.15; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1
    }
  })
  return <canvas ref={ref} className="viz" />
}

/* ---------------- Music circle ---------------- */

export const circleDefaults = { count: 96, color: '', color2: '#ff6ec7', cover: true, rotate: true, style: 'bars', pulse: true }

export function CircleWidget({ settings: s }: WidgetProps<typeof circleDefaults>) {
  const color = useColor(s.color)
  const track = usePlayer((p) => p.queue[p.index])
  const img = useImage(s.cover ? track?.cover : undefined)
  const angle = useRef(0)
  const ref = useCanvas((ctx, w, h) => {
    const vals = buckets(engine.frequency(), s.count)
    const bass = engine.bass()
    const cx = w / 2, cy = h / 2
    const base = Math.min(w, h) * 0.26 * (s.pulse ? 1 + bass * 0.12 : 1)
    const maxLen = Math.min(w, h) * 0.22
    if (s.rotate && usePlayer.getState().playing) angle.current += 0.003 + bass * 0.01

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle.current)
    const g = ctx.createLinearGradient(-base - maxLen, 0, base + maxLen, 0)
    g.addColorStop(0, color)
    g.addColorStop(1, s.color2)
    ctx.strokeStyle = g
    ctx.fillStyle = g
    ctx.lineCap = 'round'
    ctx.lineWidth = Math.max(2, (Math.PI * 2 * base) / s.count * 0.55)

    if (s.style === 'wave') {
      ctx.beginPath()
      vals.forEach((v, i) => {
        const a = (i / s.count) * Math.PI * 2
        const r = base + 6 + v * maxLen
        const x = Math.cos(a) * r, y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.lineWidth = 2.5
      ctx.globalAlpha = 0.9
      ctx.stroke()
      ctx.globalAlpha = 0.2
      ctx.fill()
      ctx.globalAlpha = 1
    } else {
      vals.forEach((v, i) => {
        const a = (i / s.count) * Math.PI * 2
        const r1 = base + 6
        const r2 = r1 + 3 + v * maxLen
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1)
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2)
        ctx.stroke()
      })
    }

    ctx.beginPath()
    ctx.arc(0, 0, base, 0, Math.PI * 2)
    ctx.closePath()
    if (img) {
      ctx.save()
      ctx.clip()
      ctx.drawImage(img, -base, -base, base * 2, base * 2)
      ctx.restore()
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fill()
    }
    ctx.restore()
  })
  return <canvas ref={ref} className="viz" />
}

/* ---------------- Vinyl ---------------- */

export const vinylDefaults = { speed: 1, arm: true, react: true, label: '' }

export function VinylWidget({ settings: s }: WidgetProps<typeof vinylDefaults>) {
  const color = useColor(s.label)
  const track = usePlayer((p) => p.queue[p.index])
  const img = useImage(track?.cover)
  const angle = useRef(0)
  const arm = useRef(0)
  const ref = useCanvas((ctx, w, h) => {
    const playing = usePlayer.getState().playing
    const bass = s.react ? engine.bass() : 0
    if (playing) angle.current += 0.025 * s.speed
    arm.current += ((playing ? 1 : 0) - arm.current) * 0.06
    const r = Math.min(w, h) * 0.42 * (1 + bass * 0.04)
    const cx = w / 2 - (s.arm ? r * 0.08 : 0), cy = h / 2

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle.current)
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = '#0d0d0f'; ctx.fill()
    for (let i = 0; i < 18; i++) {
      ctx.beginPath()
      ctx.arc(0, 0, r * (0.42 + i * 0.031), 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${i % 3 === 0 ? 0.07 : 0.03})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
    // light sheen
    const sheen = ctx.createLinearGradient(-r, -r, r, r)
    sheen.addColorStop(0.35, 'rgba(255,255,255,0)')
    sheen.addColorStop(0.5, 'rgba(255,255,255,0.08)')
    sheen.addColorStop(0.65, 'rgba(255,255,255,0)')
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = sheen; ctx.fill()

    const lr = r * 0.34
    ctx.beginPath(); ctx.arc(0, 0, lr, 0, Math.PI * 2); ctx.closePath()
    if (img) { ctx.save(); ctx.clip(); ctx.drawImage(img, -lr, -lr, lr * 2, lr * 2); ctx.restore() }
    else { ctx.fillStyle = color; ctx.fill() }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.03, 0, Math.PI * 2); ctx.fillStyle = '#ddd'; ctx.fill()
    ctx.restore()

    if (s.arm) {
      const px = cx + r * 1.05, py = cy - r * 0.85
      const a = 0.35 + arm.current * 0.33
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(a)
      ctx.strokeStyle = '#c9c9cf'; ctx.lineWidth = Math.max(2, r * 0.025); ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 1.1); ctx.lineTo(-r * 0.08, r * 1.25); ctx.stroke()
      ctx.fillStyle = '#9a9aa2'; ctx.fillRect(-r * 0.06 - 4, r * 1.2, r * 0.09, r * 0.12)
      ctx.beginPath(); ctx.arc(0, 0, r * 0.07, 0, Math.PI * 2); ctx.fillStyle = '#55555c'; ctx.fill()
      ctx.restore()
    }
  })
  return <canvas ref={ref} className="viz" />
}

/* ---------------- VU meter ---------------- */

export const vuDefaults = { color: '', segments: 24, vertical: false }

export function VuWidget({ settings: s }: WidgetProps<typeof vuDefaults>) {
  const color = useColor(s.color)
  const level = useRef([0, 0])
  const ref = useCanvas((ctx, w, h) => {
    const d = engine.waveform()
    // Approximate L/R by splitting the buffer; real stereo would need a splitter node.
    const half = d.length / 2
    const rms = [0, 1].map((c) => {
      let sum = 0
      for (let i = c * half; i < (c + 1) * half; i++) { const v = d[i] / 128 - 1; sum += v * v }
      return Math.min(1, Math.sqrt(sum / half) * 2.6)
    })
    level.current = level.current.map((l, i) => (rms[i] > l ? rms[i] : l * 0.92))
    const n = s.segments
    for (let c = 0; c < 2; c++) {
      for (let i = 0; i < n; i++) {
        const lit = i / n < level.current[c]
        const hot = i / n > 0.85 ? '#ff5470' : i / n > 0.65 ? '#ffd166' : color
        ctx.fillStyle = lit ? hot : 'rgba(255,255,255,0.07)'
        if (s.vertical) {
          const sw = w / 2 - 6, sh = h / n - 2
          ctx.fillRect(c * (w / 2) + 3, h - (i + 1) * (h / n), sw, sh)
        } else {
          const sw = w / n - 2, sh = h / 2 - 6
          ctx.fillRect(i * (w / n), c * (h / 2) + 3, sw, sh)
        }
      }
    }
  })
  return <canvas ref={ref} className="viz" />
}
