import { useEffect, useRef, useState } from 'react'
import { Check, Coffee, Download, Globe, HardDrive, Palette, Pencil, Redo2, Undo2, Upload } from 'lucide-react'
import { LANGS, useLang, useT } from '../i18n'
import type { Lang } from '../i18n'
import { exportBackup, importBackup } from '../lib/backup'
import { useDesign } from '../store/design'

const BMC_URL = 'https://www.buymeacoffee.com/aksu3797f'
const BMC_BUTTON = 'https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=aksu3797f&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff'

/** Tells people their page is kept in this browser and offers a whole-page backup to move it elsewhere. */
function SavedMenu() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const file = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div className="saved" ref={box}>
      <button className="saved-btn" onClick={() => setOpen(!open)} aria-expanded={open} title={t('app.saved')}>
        <HardDrive size={15} />
        <span>{t('app.saved')}</span>
      </button>
      {open && (
        <div className="saved-pop" role="dialog" aria-label={t('app.saved')}>
          <p>{t('backup.info')}</p>
          <button onClick={() => { exportBackup(); setOpen(false) }}><Download size={14} /> {t('backup.export')}</button>
          <button onClick={() => file.current?.click()}><Upload size={14} /> {t('backup.import')}</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { void importBackup(e.target.files?.[0]); e.target.value = ''; setOpen(false) }} />
        </div>
      )}
    </div>
  )
}

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
      <SavedMenu />
      <a className="bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer" title={t('app.support')} aria-label={t('app.support')}>
        <img src={BMC_BUTTON} alt="Buy me a coffee" />
        <Coffee size={18} />
      </a>
    </div>
  )
}
