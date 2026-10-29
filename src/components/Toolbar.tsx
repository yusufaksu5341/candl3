import { Check, Coffee, Globe, Palette, Pencil, Redo2, Undo2 } from 'lucide-react'
import { LANGS, useLang, useT } from '../i18n'
import type { Lang } from '../i18n'
import { useDesign } from '../store/design'

const BMC_URL = 'https://www.buymeacoffee.com/aksu3797f'
const BMC_BUTTON = 'https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=aksu3797f&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff'

export default function Toolbar() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  const editMode = useDesign((s) => s.editMode)
  const setEditMode = useDesign((s) => s.setEditMode)
  const openPanel = useDesign((s) => s.openPanel)
  const panelOpen = useDesign((s) => s.panelOpen)
  const canUndo = useDesign((s) => s.past.length > 0)
  const canRedo = useDesign((s) => s.future.length > 0)
  const { undo, redo } = useDesign.getState()
  return (
    <div className={`toolbar ${panelOpen ? 'shifted' : ''}`}>
      <span className="brand">candl<b>3</b></span>
      <label className="lang" title={t('app.language')}>
        <Globe size={15} />
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>
      <div className="history">
        <button className="icon-btn" onClick={undo} disabled={!canUndo} title={t('app.undo')}><Undo2 size={16} /></button>
        <button className="icon-btn" onClick={redo} disabled={!canRedo} title={t('app.redo')}><Redo2 size={16} /></button>
      </div>
      <button className={editMode ? 'primary' : ''} onClick={() => setEditMode(!editMode)}>
        {editMode ? <Check size={16} /> : <Pencil size={16} />}
        <span>{t(editMode ? 'app.done' : 'app.edit')}</span>
      </button>
      <button onClick={() => openPanel()}>
        <Palette size={16} />
        <span>{t('app.customize')}</span>
      </button>
      <a className="bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer" title={t('app.support')} aria-label={t('app.support')}>
        <img src={BMC_BUTTON} alt="Buy me a coffee" />
        <Coffee size={18} />
      </a>
    </div>
  )
}
