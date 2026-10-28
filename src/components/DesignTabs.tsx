import { useRef } from 'react'
import { Download, Eye, EyeOff, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { COMMON_EFFECT_FIELDS, EFFECTS, effectDef, WIDGET_ANIMS } from '../effects'
import { useT } from '../i18n'
import type { Field } from '../lib/fields'
import { opts } from '../lib/fields'
import { saveBlob } from '../lib/blobStore'
import { FONTS, STYLE_PRESETS } from '../lib/presets'
import { DEFAULT_DESIGN, snapshot, uid, useDesign } from '../store/design'
import type { DesignSnapshot } from '../store/design'
import { BG_UPLOAD_KEY, BG_UPLOADED_EVENT } from './Backdrop'
import FieldForm from './FieldForm'

const THEME_FIELDS: Field[] = [
  { key: 'accent', label: 'th.accent', type: 'color' },
  { key: 'text', label: 'th.text', type: 'color' },
  { key: 'font', label: 'th.font', type: 'select', options: FONTS.map((f) => ({ value: f, label: f })) },
  { key: 'panel', label: 'th.panel', type: 'color' },
  { key: 'panelOpacity', label: 'th.panelOpacity', type: 'range', min: 0, max: 1, step: 0.05 },
  { key: 'blur', label: 'th.blur', type: 'range', min: 0, max: 40 },
  { key: 'radius', label: 'th.radius', type: 'range', min: 0, max: 40 },
  { key: 'gap', label: 'th.gap', type: 'range', min: 0, max: 32 },
  { key: 'border', label: 'th.border', type: 'toggle' },
  { key: 'shadow', label: 'th.shadow', type: 'toggle' },
  { key: 'widgetAnim', label: 'th.widgetAnim', type: 'select', options: WIDGET_ANIMS },
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

const BG_TYPES = opts(['color', 'bg.color'], ['gradient', 'bg.gradient'], ['image', 'bg.image'], ['video', 'bg.video'], ['upload', 'bg.upload'])

export function BackgroundTab() {
  const t = useT()
  const bg = useDesign((s) => s.background)
  const setBg = useDesign((s) => s.setBackground)
  const file = useRef<HTMLInputElement>(null)

  const fields: Field[] = [{ key: 'type', label: 'bg.type', type: 'select', options: BG_TYPES }]
  if (bg.type === 'gradient') {
    fields.push(
      { key: 'from', label: 'f.color1', type: 'color' },
      { key: 'to', label: 'f.color2', type: 'color' },
      { key: 'angle', label: 'f.angle', type: 'range', min: 0, max: 360 },
      { key: 'animated', label: 'bg.animated', type: 'toggle' },
    )
  } else {
    fields.push({ key: 'color', label: bg.type === 'color' ? 'f.color' : 'bg.fallback', type: 'color' })
  }
  if (bg.type === 'image' || bg.type === 'video') {
    fields.push({ key: 'url', label: bg.type === 'image' ? 'f.imageUrl' : 'bg.videoUrl', type: 'text', placeholder: 'https://…' })
  }
  const after: Field[] = [
    { key: 'dim', label: 'bg.dim', type: 'range', min: 0, max: 0.9, step: 0.05 },
    { key: 'blur', label: 'bg.blur', type: 'range', min: 0, max: 30 },
    { key: 'beatZoom', label: 'bg.beatZoom', type: 'toggle' },
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
          <button onClick={() => file.current?.click()}><Upload size={14} /> {t('bg.pick')}</button>
          <input ref={file} type="file" accept="image/*,video/*" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      )}
      <h4>{t('bg.effects')}</h4>
      <FieldForm fields={after} values={bg} onChange={(p) => setBg(p)} />
    </div>
  )
}

export function EffectsTab() {
  const t = useT()
  const effects = useDesign((s) => s.effects)
  const { addEffect, updateEffect, removeEffect } = useDesign.getState()
  return (
    <div className="tab">
      {effects.length > 0 && <h4>{t('fx.onPage')}</h4>}
      {effects.map((e) => {
        const def = effectDef(e.type)
        if (!def) return null
        const values = { ...def.defaults, ...e.settings }
        return (
          <details key={e.id} className="fx-item">
            <summary>
              <def.icon size={16} />
              <span className="grow">{t(`fx.${def.type}`)}</span>
              <button className="icon" title={t(e.enabled ? 'fx.hide' : 'fx.show')} onClick={(ev) => { ev.preventDefault(); updateEffect(e.id, { enabled: !e.enabled }) }}>
                {e.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button className="icon" title={t('panel.remove')} onClick={(ev) => { ev.preventDefault(); removeEffect(e.id) }}><Trash2 size={15} /></button>
            </summary>
            <FieldForm
              fields={[...def.fields, ...COMMON_EFFECT_FIELDS]}
              values={values}
              onChange={(p) => updateEffect(e.id, { settings: { ...e.settings, ...p } })}
            />
          </details>
        )
      })}
      <h4>{t('fx.add')}</h4>
      <div className="widget-list">
        {EFFECTS.map((d) => (
          <button key={d.type} className="widget-card" onClick={() => addEffect(d.type, {})}>
            <d.icon size={18} />
            <span><strong>{t(`fx.${d.type}`)}</strong></span>
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
  const t = useT()
  const { applySnapshot, applyStyle } = useDesign.getState()
  const file = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'koztech-design.json'
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
      alert(t('presets.invalid'))
    }
  }

  return (
    <div className="tab">
      <p className="muted small">{t('presets.hint')}</p>
      <div className="preset-grid">
        {STYLE_PRESETS.map((p) => {
          const th = { ...DEFAULT_DESIGN.theme, ...p.theme }
          const b = { ...DEFAULT_DESIGN.background, ...p.background }
          const bgCss = b.type === 'gradient' ? `linear-gradient(${b.angle}deg, ${b.from}, ${b.to})` : b.color
          return (
            <button
              key={p.id}
              className="preset"
              style={{ background: bgCss, color: th.text, fontFamily: `'${th.font}', system-ui` }}
              onClick={() => applyStyle(th, b, p.effects.map((e) => ({ ...e, id: uid(), enabled: true })))}
            >
              <span className="preset-swatch" style={{ background: th.accent }} />
              {t(`preset.${p.id}`)}
            </button>
          )
        })}
      </div>
      <h4>{t('presets.save')}</h4>
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button onClick={exportJson}><Download size={14} /> {t('presets.export')}</button>
        <button onClick={() => file.current?.click()}><Upload size={14} /> {t('presets.import')}</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      <h4>{t('presets.reset')}</h4>
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button className="danger" onClick={() => { if (confirm(t('presets.confirmReset'))) applySnapshot(structuredClone(DEFAULT_DESIGN)) }}>
          <RotateCcw size={14} /> {t('presets.resetBtn')}
        </button>
      </div>
    </div>
  )
}
