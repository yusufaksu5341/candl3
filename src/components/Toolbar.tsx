import { Check, Palette, Pencil } from 'lucide-react'
import { useDesign } from '../store/design'

export default function Toolbar() {
  const editMode = useDesign((s) => s.editMode)
  const setEditMode = useDesign((s) => s.setEditMode)
  const openPanel = useDesign((s) => s.openPanel)
  const panelOpen = useDesign((s) => s.panelOpen)
  return (
    <div className={`toolbar ${panelOpen ? 'shifted' : ''}`}>
      <span className="brand">Koztech<b>Music</b></span>
      <button className={editMode ? 'primary' : ''} onClick={() => setEditMode(!editMode)} title="Düzenleme modu">
        {editMode ? <Check size={16} /> : <Pencil size={16} />}
        <span>{editMode ? 'Bitti' : 'Düzenle'}</span>
      </button>
      <button onClick={() => openPanel()} title="Özelleştir">
        <Palette size={16} />
        <span>Özelleştir</span>
      </button>
    </div>
  )
}
