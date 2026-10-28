import type { Field } from '../lib/fields'

type Props = {
  fields: Field[]
  values: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

export default function FieldForm({ fields, values, onChange }: Props) {
  return (
    <div className="form">
      {fields.map((f) => {
        const v = values[f.key]
        switch (f.type) {
          case 'toggle':
            return (
              <label key={f.key} className="row toggle">
                <span>{f.label}</span>
                <input type="checkbox" checked={Boolean(v)} onChange={(e) => onChange({ [f.key]: e.target.checked })} />
              </label>
            )
          case 'color':
            return (
              <label key={f.key} className="row">
                <span>{f.label}</span>
                <input type="color" value={String(v ?? '#ffffff')} onChange={(e) => onChange({ [f.key]: e.target.value })} />
              </label>
            )
          case 'range':
            return (
              <label key={f.key} className="field">
                <span className="row"><span>{f.label}</span><span className="muted">{String(v)}</span></span>
                <input
                  type="range" min={f.min} max={f.max} step={f.step ?? 1} value={Number(v ?? f.min)}
                  onChange={(e) => onChange({ [f.key]: Number(e.target.value) })}
                />
              </label>
            )
          case 'select':
            return (
              <label key={f.key} className="field">
                <span>{f.label}</span>
                <select value={String(v)} onChange={(e) => onChange({ [f.key]: e.target.value })}>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            )
          case 'text':
            return (
              <label key={f.key} className="field">
                <span>{f.label}</span>
                <input type="text" value={String(v ?? '')} placeholder={f.placeholder} onChange={(e) => onChange({ [f.key]: e.target.value })} />
              </label>
            )
          case 'textarea':
            return (
              <label key={f.key} className="field">
                <span>{f.label}</span>
                <textarea rows={3} value={String(v ?? '')} placeholder={f.placeholder} onChange={(e) => onChange({ [f.key]: e.target.value })} />
              </label>
            )
        }
      })}
    </div>
  )
}
