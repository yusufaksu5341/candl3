import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Layout } from 'react-grid-layout'

export type Settings = Record<string, unknown>

export type WidgetInstance = { id: string; type: string; settings: Settings }

export type WidgetAnim = 'none' | 'float' | 'pulse' | 'glow' | 'tilt'

export type Theme = {
  accent: string
  text: string
  panel: string
  panelOpacity: number
  blur: number
  radius: number
  border: boolean
  shadow: boolean
  font: string
  gap: number
  widgetAnim: WidgetAnim
}

export type BackgroundType = 'color' | 'gradient' | 'image' | 'video' | 'upload'

export type Background = {
  type: BackgroundType
  color: string
  from: string
  to: string
  angle: number
  animated: boolean
  url: string
  uploadKind: 'image' | 'video'
  blur: number
  dim: number
  beatZoom: boolean
}

export type Effect = { id: string; type: string; enabled: boolean; settings: Settings }

/** The page is a fixed canvas: COLS wide, ROWS_PER_SCREEN rows per screen height. */
export type Page = { screens: number }

export const COLS = 24
export const ROWS_PER_SCREEN = 24

export const maxRows = (page: Page) => Math.round(ROWS_PER_SCREEN * page.screens)

type Size = { w: number; h: number }

function overlaps(a: { x: number; y: number } & Size, b: Layout) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

/** First free top-left slot for `size`, shrinking toward `min` if the page is full. */
export function findSpot(layout: Layout[], size: Size, min: Size, rows: number) {
  for (let h = size.h; h >= min.h; h--) {
    for (let w = size.w; w >= min.w; w--) {
      for (let y = 0; y + h <= rows; y++) {
        for (let x = 0; x + w <= COLS; x++) {
          const r = { x, y, w, h }
          if (!layout.some((l) => overlaps(r, l))) return r
        }
      }
    }
  }
  return undefined
}

/** Smallest page (in half screens) that still holds every widget. */
export function screensFor(layout: Layout[]) {
  const bottom = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0)
  return Math.max(1, Math.ceil((bottom / ROWS_PER_SCREEN) * 2) / 2)
}

export type DesignSnapshot = {
  widgets: WidgetInstance[]
  layout: Layout[]
  theme: Theme
  background: Background
  effects: Effect[]
  page: Page
  /** Widget order in the single-column phone layout; unlisted widgets follow by desktop position. */
  mobileOrder: string[]
}

export function mobileOrdered(layout: Layout[], order: string[]) {
  const rank = (id: string) => { const i = order.indexOf(id); return i < 0 ? Infinity : i }
  return [...layout].sort((a, b) => rank(a.i) - rank(b.i) || a.y - b.y || a.x - b.x)
}

type DesignState = DesignSnapshot & {
  editMode: boolean
  panelOpen: boolean
  panelTab: string
  selected?: string
  past: DesignSnapshot[]
  future: DesignSnapshot[]

  undo: () => void
  redo: () => void
  setEditMode: (v: boolean) => void
  openPanel: (tab?: string) => void
  closePanel: () => void
  setLayout: (layout: Layout[]) => void
  /** Returns false when the page has no room left for the widget. */
  addWidget: (type: string, size: Size, min?: Size) => boolean
  setPage: (patch: Partial<Page>) => void
  /** Moves widgets that are off the first screen into free space on it, shrinking them if needed. */
  fitToPage: () => void
  removeWidget: (id: string) => void
  duplicateWidget: (id: string) => void
  updateWidget: (id: string, patch: Settings) => void
  resetWidget: (id: string) => void
  selectWidget: (id?: string) => void
  setTheme: (patch: Partial<Theme>) => void
  setBackground: (patch: Partial<Background>) => void
  addEffect: (type: string, settings: Settings) => void
  updateEffect: (id: string, patch: Partial<Effect>) => void
  removeEffect: (id: string) => void
  applySnapshot: (s: DesignSnapshot) => void
  applyStyle: (theme: Theme, background: Background, effects: Effect[]) => void
  /** Restores the starting widgets and layout but keeps the look. */
  resetLayout: () => void
  moveMobile: (id: string, dir: -1 | 1) => void
}

export const uid = () => Math.random().toString(36).slice(2, 9)

export const DEFAULT_DESIGN: DesignSnapshot = {
  // Starting layout: fills exactly one screen (24 x 24) on desktop.
  widgets: [
    { id: 'lib', type: 'library', settings: {} },
    { id: 'disc', type: 'circle', settings: {} },
    { id: 'play', type: 'player', settings: {} },
    { id: 'spec', type: 'bars', settings: {} },
    { id: 'clock', type: 'clock', settings: { size: 40, date: true } },
    { id: 'queue', type: 'queue', settings: {} },
    { id: 'eq', type: 'equalizer', settings: {} },
  ],
  layout: [
    { i: 'lib', x: 0, y: 0, w: 6, h: 24 },
    { i: 'disc', x: 6, y: 0, w: 12, h: 14 },
    { i: 'play', x: 6, y: 14, w: 12, h: 6 },
    { i: 'spec', x: 6, y: 20, w: 12, h: 4 },
    { i: 'clock', x: 18, y: 0, w: 6, h: 4 },
    { i: 'queue', x: 18, y: 4, w: 6, h: 10 },
    { i: 'eq', x: 18, y: 14, w: 6, h: 10 },
  ],
  theme: {
    accent: '#ededed',
    text: '#ededed',
    panel: '#111111',
    panelOpacity: 1,
    blur: 0,
    radius: 12,
    border: true,
    shadow: false,
    font: 'Inter',
    gap: 10,
    widgetAnim: 'none',
  },
  background: {
    type: 'color',
    color: '#000000',
    from: '#0a0a0a',
    to: '#1c1c1c',
    angle: 160,
    animated: false,
    url: '',
    uploadKind: 'image',
    blur: 0,
    dim: 0,
    beatZoom: false,
  },
  effects: [],
  page: { screens: 1 },
  mobileOrder: ['disc', 'play', 'lib', 'queue', 'eq', 'spec', 'clock'],
}

const HISTORY_LIMIT = 100
// Rapid edits to the same thing (slider drags, typing) collapse into one undo step.
const COALESCE_MS = 700
let lastKey: string | undefined
let lastAt = 0

function pick(s: DesignSnapshot): DesignSnapshot {
  const { widgets, layout, theme, background, effects, page, mobileOrder } = s
  return structuredClone({ widgets, layout, theme, background, effects, page, mobileOrder })
}

export const useDesign = create<DesignState>()(
  persist(
    (set, get) => {
      /** Saves the current design onto the undo stack before a change. */
      const record = (key?: string) => {
        const now = Date.now()
        if (key && key === lastKey && now - lastAt < COALESCE_MS) { lastAt = now; return }
        lastKey = key
        lastAt = now
        set({ past: [...get().past, pick(get())].slice(-HISTORY_LIMIT), future: [] })
      }

      return {
        ...structuredClone(DEFAULT_DESIGN),
        editMode: false,
        panelOpen: false,
        panelTab: 'widgets',
        selected: undefined,
        past: [],
        future: [],

        undo: () => {
          const { past, future } = get()
          if (!past.length) return
          lastKey = undefined
          set({ ...past[past.length - 1], past: past.slice(0, -1), future: [pick(get()), ...future] })
        },
        redo: () => {
          const { past, future } = get()
          if (!future.length) return
          lastKey = undefined
          set({ ...future[0], future: future.slice(1), past: [...past, pick(get())] })
        },

        setEditMode: (editMode) => set({ editMode, selected: editMode ? get().selected : undefined }),
        openPanel: (tab) => set({ panelOpen: true, panelTab: tab ?? get().panelTab }),
        closePanel: () => set({ panelOpen: false }),
        setLayout: (layout) => {
          const norm = (l: Layout[]) => JSON.stringify(l.map(({ i, x, y, w, h }) => [i, x, y, w, h]).sort())
          if (norm(layout) === norm(get().layout)) return
          record('layout')
          set({ layout })
        },
        addWidget: (type, size, min = { w: 2, h: 2 }) => {
          const spot = findSpot(get().layout, size, min, maxRows(get().page))
          if (!spot) return false
          record()
          const id = uid()
          set({
            widgets: [...get().widgets, { id, type, settings: {} }],
            layout: [...get().layout, { i: id, ...spot }],
            editMode: true,
            selected: id,
          })
          return true
        },
        setPage: (patch) => {
          const page = { ...get().page, ...patch }
          page.screens = Math.max(page.screens, screensFor(get().layout))
          record('page')
          set({ page })
        },
        fitToPage: () => {
          const rows = ROWS_PER_SCREEN
          const placed: Layout[] = []
          const sorted = [...get().layout].sort((a, b) => a.y - b.y || a.x - b.x)
          for (const l of sorted) {
            const fits = l.y + l.h <= rows && !placed.some((p) => overlaps(l, p))
            const min = { w: Math.min(l.w, 3), h: Math.min(l.h, 3) }
            const spot = fits ? l : findSpot(placed, l, min, rows) ?? findSpot(placed, l, l, Infinity)!
            placed.push({ i: l.i, x: spot.x, y: spot.y, w: spot.w, h: spot.h })
          }
          record()
          set({ layout: placed, page: { screens: screensFor(placed) } })
        },
        removeWidget: (id) => {
          record()
          set({
            widgets: get().widgets.filter((w) => w.id !== id),
            layout: get().layout.filter((l) => l.i !== id),
            selected: get().selected === id ? undefined : get().selected,
          })
        },
        duplicateWidget: (id) => {
          const w = get().widgets.find((x) => x.id === id)
          const l = get().layout.find((x) => x.i === id)
          if (!w || !l) return
          const spot = findSpot(get().layout, l, { w: Math.min(l.w, 2), h: Math.min(l.h, 2) }, maxRows(get().page))
          if (!spot) return
          record()
          const nid = uid()
          set({
            widgets: [...get().widgets, { ...w, id: nid, settings: { ...w.settings } }],
            layout: [...get().layout, { i: nid, ...spot }],
            selected: nid,
          })
        },
        updateWidget: (id, patch) => {
          record(`widget:${id}:${Object.keys(patch).join()}`)
          set({ widgets: get().widgets.map((w) => (w.id === id ? { ...w, settings: { ...w.settings, ...patch } } : w)) })
        },
        resetWidget: (id) => {
          record()
          set({ widgets: get().widgets.map((w) => (w.id === id ? { ...w, settings: {} } : w)) })
        },
        selectWidget: (selected) => set({ selected, panelOpen: selected ? true : get().panelOpen, panelTab: selected ? 'selected' : get().panelTab }),
        setTheme: (patch) => {
          record(`theme:${Object.keys(patch).join()}`)
          set({ theme: { ...get().theme, ...patch } })
        },
        setBackground: (patch) => {
          record(`bg:${Object.keys(patch).join()}`)
          set({ background: { ...get().background, ...patch } })
        },
        addEffect: (type, settings) => {
          record()
          set({ effects: [...get().effects, { id: uid(), type, enabled: true, settings }] })
        },
        updateEffect: (id, patch) => {
          record(`fx:${id}:${Object.keys(patch.settings ?? patch).join()}`)
          set({ effects: get().effects.map((e) => (e.id === id ? { ...e, ...patch } : e)) })
        },
        removeEffect: (id) => {
          record()
          set({ effects: get().effects.filter((e) => e.id !== id) })
        },
        applySnapshot: (s) => {
          record()
          set({
            widgets: s.widgets,
            layout: s.layout,
            theme: { ...DEFAULT_DESIGN.theme, ...s.theme },
            background: { ...DEFAULT_DESIGN.background, ...s.background },
            effects: s.effects ?? [],
            page: { screens: Math.max(s.page?.screens ?? 1, screensFor(s.layout)) },
            mobileOrder: s.mobileOrder ?? [],
            selected: undefined,
          })
        },
        resetLayout: () => {
          record()
          const d = structuredClone(DEFAULT_DESIGN)
          set({ widgets: d.widgets, layout: d.layout, page: d.page, mobileOrder: d.mobileOrder, selected: undefined })
        },
        moveMobile: (id, dir) => {
          const ids = mobileOrdered(get().layout, get().mobileOrder).map((l) => l.i)
          const i = ids.indexOf(id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= ids.length) return
          ;[ids[i], ids[j]] = [ids[j], ids[i]]
          record()
          set({ mobileOrder: ids })
        },
        applyStyle: (theme, background, effects) => {
          record()
          set({ theme, background, effects })
        },
      }
    },
    {
      // Storage key predates the candl3 name; kept so saved designs survive.
      name: 'koztech-design',
      partialize: (s): DesignSnapshot => pick(s),
      // Designs saved before pages existed may extend below one screen.
      merge: (saved, current) => {
        const s = { ...current, ...(saved as Partial<DesignSnapshot>) }
        return { ...s, mobileOrder: s.mobileOrder ?? [], page: { screens: Math.max(s.page?.screens ?? 1, screensFor(s.layout)) } }
      },
    },
  ),
)

export function snapshot(): DesignSnapshot {
  return pick(useDesign.getState())
}
