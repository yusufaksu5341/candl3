import { t } from '../i18n'
import { snapshot, useDesign } from '../store/design'
import type { DesignSnapshot } from '../store/design'

function isSnapshot(v: unknown): v is DesignSnapshot {
  const s = v as DesignSnapshot
  return !!s && Array.isArray(s.widgets) && Array.isArray(s.layout) && typeof s.theme === 'object'
}

/** Downloads the whole page (widgets, layout, look, animations) as a JSON file. */
export function exportBackup() {
  const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'candl3-design.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function importBackup(f?: File) {
  if (!f) return
  try {
    const data = JSON.parse(await f.text())
    if (!isSnapshot(data)) throw new Error()
    useDesign.getState().applySnapshot(data)
  } catch {
    alert(t('presets.invalid'))
  }
}
