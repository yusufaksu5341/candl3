import type { ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import { useDesign } from '../store/design'
import { COMMON_DEFAULTS, COMMON_FIELDS, WIDGETS, widgetDef } from '../widgets/registry'
import { BackgroundTab, EffectsTab, PresetsTab, ThemeTab } from './DesignTabs'
import FieldForm from './FieldForm'

function WidgetsTab() {
  const addWidget = useDesign((s) => s.addWidget)
  return (
    <div className="tab">
      <p className="muted small">Bir araca tıklayarak sayfana ekle. Düzenleme modunda sürükleyip boyutlandırabilirsin.</p>
      <div className="widget-list">
        {WIDGETS.map((d) => (
          <button key={d.type} className="widget-card" onClick={() => addWidget(d.type, d.size, {})}>
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

function SelectedTab() {
  const selected = useDesign((s) => s.widgets.find((w) => w.id === s.selected))
  const update = useDesign((s) => s.updateWidget)
  const remove = useDesign((s) => s.removeWidget)
  const reset = useDesign((s) => s.resetWidget)
  if (!selected) return <div className="tab muted small">Ayarlarını değiştirmek için düzenleme modunda bir araca tıkla.</div>
  const def = widgetDef(selected.type)!
  const values = { ...COMMON_DEFAULTS, ...def.defaults, ...selected.settings }
  return (
    <div className="tab">
      <h3><def.icon size={16} /> {def.name}</h3>
      <FieldForm fields={def.fields} values={values} onChange={(p) => update(selected.id, p)} />
      <h4>Görünüm</h4>
      <FieldForm fields={COMMON_FIELDS} values={values} onChange={(p) => update(selected.id, p)} />
      <div className="btn-row">
        <button onClick={() => reset(selected.id)}>Varsayılana dön</button>
        <button className="danger" onClick={() => remove(selected.id)}>Kaldır</button>
      </div>
    </div>
  )
}

export const TABS: { id: string; label: string; render: () => ReactNode }[] = [
  { id: 'widgets', label: 'Araçlar', render: () => <WidgetsTab /> },
  { id: 'selected', label: 'Seçili', render: () => <SelectedTab /> },
  { id: 'theme', label: 'Tema', render: () => <ThemeTab /> },
  { id: 'background', label: 'Arka plan', render: () => <BackgroundTab /> },
  { id: 'effects', label: 'Animasyonlar', render: () => <EffectsTab /> },
  { id: 'presets', label: 'Hazır stiller', render: () => <PresetsTab /> },
]

export default function CustomizePanel() {
  const open = useDesign((s) => s.panelOpen)
  const tab = useDesign((s) => s.panelTab)
  const close = useDesign((s) => s.closePanel)
  const openPanel = useDesign((s) => s.openPanel)
  if (!open) return null
  const current = TABS.find((t) => t.id === tab) ?? TABS[0]
  return (
    <aside className="customize">
      <header>
        <strong>Sayfanı tasarla</strong>
        <button className="icon" onClick={close} title="Kapat"><X size={18} /></button>
      </header>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === current.id ? 'active' : ''} onClick={() => openPanel(t.id)}>{t.label}</button>
        ))}
      </nav>
      <div className="customize-body">{current.render()}</div>
    </aside>
  )
}
