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

export type DesignSnapshot = {
  widgets: WidgetInstance[]
  layout: Layout[]
  theme: Theme
  background: Background
  effects: Effect[]
}

type DesignState = DesignSnapshot & {
  editMode: boolean
  panelOpen: boolean
  panelTab: string
  selected?: string

  setEditMode: (v: boolean) => void
  openPanel: (tab?: string) => void
  closePanel: () => void
  setLayout: (layout: Layout[]) => void
  addWidget: (type: string, size: { w: number; h: number }, settings: Settings) => void
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
}

export const uid = () => Math.random().toString(36).slice(2, 9)

export const DEFAULT_DESIGN: DesignSnapshot = {
  widgets: [
    { id: 'lib', type: 'library', settings: {} },
    { id: 'disc', type: 'circle', settings: {} },
    { id: 'spec', type: 'bars', settings: {} },
    { id: 'play', type: 'player', settings: {} },
    { id: 'queue', type: 'queue', settings: {} },
    { id: 'eq', type: 'equalizer', settings: {} },
  ],
  layout: [
    { i: 'lib', x: 0, y: 0, w: 7, h: 22 },
    { i: 'disc', x: 7, y: 0, w: 10, h: 12 },
    { i: 'spec', x: 7, y: 12, w: 10, h: 5 },
    { i: 'play', x: 7, y: 17, w: 10, h: 5 },
    { i: 'queue', x: 17, y: 0, w: 7, h: 11 },
    { i: 'eq', x: 17, y: 11, w: 7, h: 11 },
  ],
  theme: {
    accent: '#8b7bff',
    text: '#f2f2f5',
    panel: '#14141b',
    panelOpacity: 0.72,
    blur: 14,
    radius: 16,
    border: true,
    shadow: true,
    font: 'Inter',
    gap: 12,
    widgetAnim: 'none',
  },
  background: {
    type: 'gradient',
    color: '#0b0b0f',
    from: '#0d0d16',
    to: '#1d1636',
    angle: 140,
    animated: false,
    url: '',
    uploadKind: 'image',
    blur: 0,
    dim: 0.2,
    beatZoom: false,
  },
  effects: [{ id: 'fx-stars', type: 'stars', enabled: true, settings: {} }],
}

export const useDesign = create<DesignState>()(
  persist(
    (set, get) => ({
      ...structuredClone(DEFAULT_DESIGN),
      editMode: false,
      panelOpen: false,
      panelTab: 'widgets',
      selected: undefined,

      setEditMode: (editMode) => set({ editMode, selected: editMode ? get().selected : undefined }),
      openPanel: (tab) => set({ panelOpen: true, panelTab: tab ?? get().panelTab }),
      closePanel: () => set({ panelOpen: false }),
      setLayout: (layout) => set({ layout }),
      addWidget: (type, size, settings) => {
        const id = uid()
        const bottom = get().layout.reduce((m, l) => Math.max(m, l.y + l.h), 0)
        set({
          widgets: [...get().widgets, { id, type, settings }],
          layout: [...get().layout, { i: id, x: 0, y: bottom, ...size }],
          editMode: true,
          selected: id,
        })
      },
      removeWidget: (id) =>
        set({
          widgets: get().widgets.filter((w) => w.id !== id),
          layout: get().layout.filter((l) => l.i !== id),
          selected: get().selected === id ? undefined : get().selected,
        }),
      duplicateWidget: (id) => {
        const w = get().widgets.find((x) => x.id === id)
        const l = get().layout.find((x) => x.i === id)
        if (!w || !l) return
        const nid = uid()
        set({
          widgets: [...get().widgets, { ...w, id: nid, settings: { ...w.settings } }],
          layout: [...get().layout, { ...l, i: nid, y: l.y + l.h }],
          selected: nid,
        })
      },
      updateWidget: (id, patch) =>
        set({ widgets: get().widgets.map((w) => (w.id === id ? { ...w, settings: { ...w.settings, ...patch } } : w)) }),
      resetWidget: (id) => set({ widgets: get().widgets.map((w) => (w.id === id ? { ...w, settings: {} } : w)) }),
      selectWidget: (selected) => set({ selected, panelOpen: selected ? true : get().panelOpen, panelTab: selected ? 'selected' : get().panelTab }),
      setTheme: (patch) => set({ theme: { ...get().theme, ...patch } }),
      setBackground: (patch) => set({ background: { ...get().background, ...patch } }),
      addEffect: (type, settings) => set({ effects: [...get().effects, { id: uid(), type, enabled: true, settings }] }),
      updateEffect: (id, patch) => set({ effects: get().effects.map((e) => (e.id === id ? { ...e, ...patch } : e)) }),
      removeEffect: (id) => set({ effects: get().effects.filter((e) => e.id !== id) }),
      applySnapshot: (s) =>
        set({
          widgets: s.widgets,
          layout: s.layout,
          theme: { ...DEFAULT_DESIGN.theme, ...s.theme },
          background: { ...DEFAULT_DESIGN.background, ...s.background },
          effects: s.effects ?? [],
          selected: undefined,
        }),
    }),
    {
      name: 'koztech-design',
      partialize: (s): DesignSnapshot => ({
        widgets: s.widgets,
        layout: s.layout,
        theme: s.theme,
        background: s.background,
        effects: s.effects,
      }),
    },
  ),
)

export function snapshot(): DesignSnapshot {
  const { widgets, layout, theme, background, effects } = useDesign.getState()
  return structuredClone({ widgets, layout, theme, background, effects })
}
