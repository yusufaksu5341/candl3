import { Check, Globe, Palette, Pencil } from 'lucide-react'
import { LANGS, useLang, useT } from '../i18n'
import type { Lang } from '../i18n'
import { useDesign } from '../store/design'

export default function Toolbar() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  const editMode = useDesign((s) => s.editMode)
  const setEditMode = useDesign((s) => s.setEditMode)
  const openPanel = useDesign((s) => s.openPanel)
  const panelOpen = useDesign((s) => s.panelOpen)
  return (
    <div className={`toolbar ${panelOpen ? 'shifted' : ''}`}>
      <span className="brand">Koztech<b>Music</b></span>
      <label className="lang" title={t('app.language')}>
        <Globe size={15} />
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>
      <button className={editMode ? 'primary' : ''} onClick={() => setEditMode(!editMode)}>
        {editMode ? <Check size={16} /> : <Pencil size={16} />}
        <span>{t(editMode ? 'app.done' : 'app.edit')}</span>
      </button>
      <button onClick={() => openPanel()}>
        <Palette size={16} />
        <span>{t('app.customize')}</span>
      </button>
    </div>
  )
}
