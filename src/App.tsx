import { useEffect } from 'react'
import { engine } from './audio/engine'
import Backdrop from './components/Backdrop'
import Board from './components/Board'
import { useLang } from './i18n'
import { loadFont } from './lib/presets'
import CustomizePanel from './components/CustomizePanel'
import Toolbar from './components/Toolbar'
import { useDesign } from './store/design'
import type { Theme } from './store/design'

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

function useThemeVars(theme: Theme) {
  useEffect(() => {
    loadFont(theme.font)
    const r = document.documentElement.style
    r.setProperty('--accent', theme.accent)
    r.setProperty('--accent-rgb', hexToRgb(theme.accent))
    r.setProperty('--text', theme.text)
    r.setProperty('--text-rgb', hexToRgb(theme.text))
    r.setProperty('--panel', `rgba(${hexToRgb(theme.panel)}, ${theme.panelOpacity})`)
    r.setProperty('--blur', `${theme.blur}px`)
    r.setProperty('--radius', `${theme.radius}px`)
    r.setProperty('--font', `'${theme.font}', system-ui, sans-serif`)
    document.body.classList.toggle('no-border', !theme.border)
    document.body.classList.toggle('no-shadow', !theme.shadow)
  }, [theme])
}

/** Publishes the current bass level as --beat (0..1) for CSS animations. */
function useBeatVar() {
  useEffect(() => {
    let raf = 0
    let smooth = 0
    const loop = () => {
      smooth += (engine.bass() - smooth) * 0.35
      document.documentElement.style.setProperty('--beat', smooth.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
}

/** Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z or Ctrl+Y redoes; text fields keep their own undo. */
function useHistoryShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const el = e.target as HTMLElement
      if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
      const key = e.key.toLowerCase()
      const { undo, redo } = useDesign.getState()
      if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function App() {
  const theme = useDesign((s) => s.theme)
  const panelOpen = useDesign((s) => s.panelOpen)
  const lang = useLang((s) => s.lang)
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useThemeVars(theme)
  useBeatVar()
  useHistoryShortcuts()

  return (
    <div className={`app ${panelOpen ? 'with-panel' : ''}`}>
      <Backdrop />
      <main className="stage">
        <Toolbar />
        <Board />
      </main>
      <CustomizePanel />
    </div>
  )
}
