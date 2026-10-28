import { useRef } from 'react'
import { Download, Eye, EyeOff, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { COMMON_EFFECT_FIELDS, EFFECTS, effectDef, WIDGET_ANIMS } from '../effects'
import type { Field } from '../lib/fields'
import { opts } from '../lib/fields'
import { saveBlob } from '../lib/blobStore'
import { FONTS, STYLE_PRESETS } from '../lib/presets'
import { DEFAULT_DESIGN, snapshot, uid, useDesign } from '../store/design'
import type { DesignSnapshot } from '../store/design'
import { BG_UPLOAD_KEY, BG_UPLOADED_EVENT } from './Backdrop'
import FieldForm from './FieldForm'

const THEME_FIELDS: Field[] = [
  { key: 'accent', label: 'Vurgu rengi', type: 'color' },
  { key: 'text', label: 'Yazı rengi', type: 'color' },
  { key: 'font', label: 'Yazı tipi', type: 'select', options: FONTS.map((f) => ({ value: f, label: f })) },
  { key: 'panel', label: 'Panel rengi', type: 'color' },
  { key: 'panelOpacity', label: 'Panel saydamlığı', type: 'range', min: 0, max: 1, step: 0.05 },
  { key: 'blur', label: 'Cam bulanıklığı', type: 'range', min: 0, max: 40 },
  { key: 'radius', label: 'Köşe yuvarlaklığı', type: 'range', min: 0, max: 40 },
  { key: 'gap', label: 'Araç aralığı', type: 'range', min: 0, max: 32 },
  { key: 'border', label: 'Kenarlık', type: 'toggle' },
  { key: 'shadow', label: 'Gölge', type: 'toggle' },
  { key: 'widgetAnim', label: 'Araç animasyonu', type: 'select', options: WIDGET_ANIMS },
]

export function ThemeTab() {
  const theme = useDesign((s) => s.theme)
  const setTheme = useDesign((s) => s.setTheme)
  return (
    <div className="tab">
      <FieldForm fields={THEME_FIELDS} values={theme} onChange={(p) => setTheme(p)} />
    </div>
  )
}

const BG_TYPES = opts(['color', 'Düz renk'], ['gradient', 'Renk geçişi'], ['image', 'Görsel / GIF bağlantısı'], ['video', 'Video bağlantısı'], ['upload', 'Dosya yükle'])

export function BackgroundTab() {
  const bg = useDesign((s) => s.background)
  const setBg = useDesign((s) => s.setBackground)
  const file = useRef<HTMLInputElement>(null)

  const fields: Field[] = [{ key: 'type', label: 'Arka plan türü', type: 'select', options: BG_TYPES }]
  if (bg.type === 'gradient') {
    fields.push(
      { key: 'from', label: 'Renk 1', type: 'color' },
      { key: 'to', label: 'Renk 2', type: 'color' },
      { key: 'angle', label: 'Açı', type: 'range', min: 0, max: 360 },
      { key: 'animated', label: 'Hareketli', type: 'toggle' },
    )
  } else {
    fields.push({ key: 'color', label: bg.type === 'color' ? 'Renk' : 'Yedek renk', type: 'color' })
  }
  if (bg.type === 'image' || bg.type === 'video') {
    fields.push({ key: 'url', label: bg.type === 'image' ? 'Görsel bağlantısı' : 'Video bağlantısı (.mp4 / .webm)', type: 'text', placeholder: 'https://…' })
  }
  const after: Field[] = [
    { key: 'dim', label: 'Karartma', type: 'range', min: 0, max: 0.9, step: 0.05 },
    { key: 'blur', label: 'Bulanıklık', type: 'range', min: 0, max: 30 },
    { key: 'beatZoom', label: 'Ritimle yakınlaş', type: 'toggle' },
  ]

  const onFile = async (f?: File) => {
    if (!f) return
    await saveBlob(BG_UPLOAD_KEY, f)
    setBg({ type: 'upload', uploadKind: f.type.startsWith('video') ? 'video' : 'image' })
    window.dispatchEvent(new Event(BG_UPLOADED_EVENT))
  }

  return (
    <div className="tab">
      <FieldForm fields={fields} values={bg} onChange={(p) => setBg(p)} />
      {bg.type === 'upload' && (
        <div className="btn-row">
          <button onClick={() => file.current?.click()}><Upload size={14} /> Görsel, GIF veya video seç</button>
          <input ref={file} type="file" accept="image/*,video/*" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      )}
      <h4>Efektler</h4>
      <FieldForm fields={after} values={bg} onChange={(p) => setBg(p)} />
    </div>
  )
}

export function EffectsTab() {
  const effects = useDesign((s) => s.effects)
  const { addEffect, updateEffect, removeEffect } = useDesign.getState()
  return (
    <div className="tab">
      <p className="muted small">Animasyon katmanları arka planın üstünde, araçların arkasında çalışır. İstediğin kadarını üst üste ekleyebilirsin.</p>
      {effects.length > 0 && <h4>Sayfandakiler</h4>}
      {effects.map((e) => {
        const def = effectDef(e.type)
        if (!def) return null
        const values = { ...def.defaults, ...e.settings }
        return (
          <details key={e.id} className="fx-item">
            <summary>
              <def.icon size={16} />
              <span className="grow">{def.name}</span>
              <button className="icon" title={e.enabled ? 'Gizle' : 'Göster'} onClick={(ev) => { ev.preventDefault(); updateEffect(e.id, { enabled: !e.enabled }) }}>
                {e.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button className="icon" title="Kaldır" onClick={(ev) => { ev.preventDefault(); removeEffect(e.id) }}><Trash2 size={15} /></button>
            </summary>
            <FieldForm
              fields={[...def.fields, ...COMMON_EFFECT_FIELDS]}
              values={values}
              onChange={(p) => updateEffect(e.id, { settings: { ...e.settings, ...p } })}
            />
          </details>
        )
      })}
      <h4>Ekle</h4>
      <div className="widget-list">
        {EFFECTS.map((d) => (
          <button key={d.type} className="widget-card" onClick={() => addEffect(d.type, {})}>
            <d.icon size={18} />
            <span>
              <strong>{d.name}</strong>
              <small className="muted">{d.description}</small>
            </span>
            <Plus size={16} className="muted" />
          </button>
        ))}
      </div>
    </div>
  )
}

function isSnapshot(v: unknown): v is DesignSnapshot {
  const s = v as DesignSnapshot
  return !!s && Array.isArray(s.widgets) && Array.isArray(s.layout) && typeof s.theme === 'object'
}

export function PresetsTab() {
  const { applySnapshot, setTheme, setBackground } = useDesign.getState()
  const file = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'koztech-tasarim.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (f?: File) => {
    if (!f) return
    try {
      const data = JSON.parse(await f.text())
      if (!isSnapshot(data)) throw new Error()
      applySnapshot(data)
    } catch {
      alert('Bu dosya geçerli bir Koztech tasarımı değil.')
    }
  }

  return (
    <div className="tab">
      <p className="muted small">Hazır stiller renkleri, arka planı ve efektleri değiştirir; araçların ve yerleşimin aynı kalır.</p>
      <div className="preset-grid">
        {STYLE_PRESETS.map((p) => {
          const t = { ...DEFAULT_DESIGN.theme, ...p.theme }
          const b = { ...DEFAULT_DESIGN.background, ...p.background }
          const bgCss = b.type === 'gradient' ? `linear-gradient(${b.angle}deg, ${b.from}, ${b.to})` : b.color
          return (
            <button
              key={p.name}
              className="preset"
              style={{ background: bgCss, color: t.text, fontFamily: `'${t.font}', system-ui` }}
              onClick={() => {
                setTheme(t)
                setBackground(b)
                useDesign.setState({ effects: p.effects.map((e) => ({ ...e, id: uid(), enabled: true })) })
              }}
            >
              <span className="preset-swatch" style={{ background: t.accent }} />
              {p.name}
            </button>
          )
        })}
      </div>
      <h4>Tasarımını kaydet</h4>
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button onClick={exportJson}><Download size={14} /> Dışa aktar</button>
        <button onClick={() => file.current?.click()}><Upload size={14} /> İçe aktar</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      <h4>Sıfırla</h4>
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button className="danger" onClick={() => { if (confirm('Tüm tasarım varsayılana dönsün mü?')) applySnapshot(structuredClone(DEFAULT_DESIGN)) }}>
          <RotateCcw size={14} /> Varsayılan tasarım
        </button>
      </div>
    </div>
  )
}
