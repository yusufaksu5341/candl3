import { useEffect, useState } from 'react'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import { Copy, Settings2, Trash2 } from 'lucide-react'
import { useT } from '../i18n'
import { COLS, maxRows, ROWS_PER_SCREEN, useDesign } from '../store/design'
import type { WidgetInstance } from '../store/design'
import { COMMON_DEFAULTS, widgetDef } from '../widgets/registry'

const Grid = WidthProvider(GridLayout)
const MOBILE = 760
const TOOLBAR_H = 52

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < MOBILE)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < MOBILE)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return mobile
}

function useViewportHeight() {
  const [h, setH] = useState(() => window.innerHeight)
  useEffect(() => {
    const onResize = () => setH(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return h
}

function WidgetFrame({ w }: { w: WidgetInstance }) {
  const t = useT()
  const def = widgetDef(w.type)
  const editMode = useDesign((s) => s.editMode)
  const selected = useDesign((s) => s.selected === w.id)
  const themeAnim = useDesign((s) => s.theme.widgetAnim)
  const { selectWidget, removeWidget, duplicateWidget } = useDesign.getState()
  if (!def) return null

  const settings = { ...COMMON_DEFAULTS, ...def.defaults, ...w.settings } as Record<string, unknown> & typeof COMMON_DEFAULTS
  const anim = settings.anim === 'theme' ? themeAnim : settings.anim
  const Comp = def.component
  const cls = ['widget', settings.panel ? 'has-panel' : 'no-panel', `anim-${anim}`, selected && 'selected'].filter(Boolean).join(' ')

  return (
    <div className={cls} onMouseDown={() => editMode && selectWidget(w.id)}>
      <div className="widget-body" style={{ padding: settings.padding }}>
        <Comp id={w.id} settings={settings} />
      </div>
      {editMode && (
        <div className="widget-tools no-drag">
          <span className="widget-name">{t(`w.${def.type}`)}</span>
          <button title={t('widget.settings')} onClick={() => selectWidget(w.id)}><Settings2 size={14} /></button>
          <button title={t('widget.duplicate')} onClick={() => duplicateWidget(w.id)}><Copy size={14} /></button>
          <button title={t('widget.remove')} onClick={() => removeWidget(w.id)}><Trash2 size={14} /></button>
        </div>
      )}
    </div>
  )
}

export default function Board() {
  const widgets = useDesign((s) => s.widgets)
  const layout = useDesign((s) => s.layout)
  const gap = useDesign((s) => s.theme.gap)
  const editMode = useDesign((s) => s.editMode)
  const setLayout = useDesign((s) => s.setLayout)
  const page = useDesign((s) => s.page)
  const mobile = useIsMobile()
  const viewport = useViewportHeight()
  // Rows are sized so ROWS_PER_SCREEN rows exactly fill one screen below the toolbar.
  const screenH = Math.max(320, viewport - TOOLBAR_H)
  const rowHeight = Math.max(8, (screenH - gap * (ROWS_PER_SCREEN + 1)) / ROWS_PER_SCREEN)
  const rows = maxRows(page)

  if (mobile) {
    const ordered = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)
    return (
      <div className="board-mobile" style={{ gap }}>
        {ordered.map((l) => {
          const w = widgets.find((x) => x.id === l.i)
          return w ? (
            <div key={w.id} style={{ height: Math.max(140, l.h * 30) }}>
              <WidgetFrame w={w} />
            </div>
          ) : null
        })}
      </div>
    )
  }

  return (
    <Grid
      className={`board ${editMode ? 'editing' : ''}`}
      style={{ minHeight: screenH * page.screens }}
      layout={layout.map((l) => {
        const min = widgetDef(widgets.find((w) => w.id === l.i)?.type ?? '')?.minSize
        return { ...l, minW: min?.w ?? 2, minH: min?.h ?? 2 }
      })}
      cols={COLS}
      rowHeight={rowHeight}
      maxRows={rows}
      margin={[gap, gap]}
      containerPadding={[gap, gap]}
      isDraggable={editMode}
      isResizable={editMode}
      draggableCancel=".no-drag, input, textarea, select, button"
      compactType={null}
      preventCollision
      resizeHandles={['se', 'e', 's']}
      onLayoutChange={(l) => setLayout(l.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })))}
    >
      {widgets.map((w) => (
        <div key={w.id}>
          <WidgetFrame w={w} />
        </div>
      ))}
    </Grid>
  )
}
