import type { ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import { useT } from '../i18n'
import type { TKey } from '../i18n'
import { useDesign } from '../store/design'
import { COMMON_DEFAULTS, COMMON_FIELDS, WIDGETS, widgetDef } from '../widgets/registry'
import { BackgroundTab, EffectsTab, PresetsTab, ThemeTab } from './DesignTabs'
import FieldForm from './FieldForm'

function WidgetsTab() {
  const t = useT()
  const addWidget = useDesign((s) => s.addWidget)
  return (
    <div className="tab">
      <p className="muted small">{t('panel.widgetsHint')}</p>
      <div className="widget-list">
        {WIDGETS.map((d) => (
          <button key={d.type} className="widget-card" onClick={() => addWidget(d.type, d.size, {})}>
            <d.icon size={18} />
            <span>
              <strong>{t(`w.${d.type}`)}</strong>
              <small className="muted">{t(`w.${d.type}.d`)}</small>
            </span>
            <Plus size={16} className="muted" />
          </button>
        ))}
      </div>
    </div>
  )
}

function SelectedTab() {
  const t = useT()
  const selected = useDesign((s) => s.widgets.find((w) => w.id === s.selected))
  const update = useDesign((s) => s.updateWidget)
  const remove = useDesign((s) => s.removeWidget)
  const reset = useDesign((s) => s.resetWidget)
  if (!selected) return <div className="tab muted small">{t('panel.selectHint')}</div>
  const def = widgetDef(selected.type)!
  const values = { ...COMMON_DEFAULTS, ...def.defaults, ...selected.settings }
  return (
    <div className="tab">
      <h3><def.icon size={16} /> {t(`w.${def.type}`)}</h3>
      <FieldForm fields={def.fields} values={values} onChange={(p) => update(selected.id, p)} />
      <h4>{t('panel.appearance')}</h4>
      <FieldForm fields={COMMON_FIELDS} values={values} onChange={(p) => update(selected.id, p)} />
      <div className="btn-row">
        <button onClick={() => reset(selected.id)}>{t('panel.reset')}</button>
        <button className="danger" onClick={() => remove(selected.id)}>{t('panel.remove')}</button>
      </div>
    </div>
  )
}

export const TABS: { id: string; label: TKey; render: () => ReactNode }[] = [
  { id: 'widgets', label: 'tab.widgets', render: () => <WidgetsTab /> },
  { id: 'selected', label: 'tab.selected', render: () => <SelectedTab /> },
  { id: 'theme', label: 'tab.theme', render: () => <ThemeTab /> },
  { id: 'background', label: 'tab.background', render: () => <BackgroundTab /> },
  { id: 'effects', label: 'tab.effects', render: () => <EffectsTab /> },
  { id: 'presets', label: 'tab.presets', render: () => <PresetsTab /> },
]

export default function CustomizePanel() {
  const t = useT()
  const open = useDesign((s) => s.panelOpen)
  const tab = useDesign((s) => s.panelTab)
  const close = useDesign((s) => s.closePanel)
  const openPanel = useDesign((s) => s.openPanel)
  if (!open) return null
  const current = TABS.find((x) => x.id === tab) ?? TABS[0]
  return (
    <aside className="customize">
      <header>
        <strong>{t('panel.title')}</strong>
        <button className="icon" onClick={close} title={t('panel.close')}><X size={18} /></button>
      </header>
      <nav className="tabs">
        {TABS.map((x) => (
          <button key={x.id} className={x.id === current.id ? 'active' : ''} onClick={() => openPanel(x.id)}>{t(x.label)}</button>
        ))}
      </nav>
      <div className="customize-body">{current.render()}</div>
    </aside>
  )
}
