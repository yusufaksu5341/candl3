import { DEFAULT_DESIGN } from '../store/design'
import type { Background, Effect, Theme } from '../store/design'

export type StylePreset = {
  id: string
  theme: Partial<Theme>
  background: Partial<Background>
  effects: Omit<Effect, 'id' | 'enabled'>[]
}

/** Style presets change look and effects but keep the user's widgets and layout. */
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    theme: DEFAULT_DESIGN.theme,
    background: DEFAULT_DESIGN.background,
    effects: [],
  },
  {
    id: 'night',
    theme: { accent: '#8b7bff', text: '#f2f2f5', panel: '#14141b', panelOpacity: 0.72, blur: 14, radius: 16, font: 'Inter', widgetAnim: 'none', border: true, shadow: true },
    background: { type: 'gradient', from: '#0d0d16', to: '#1d1636', angle: 140, animated: false, dim: 0.2, beatZoom: false },
    effects: [{ type: 'stars', settings: {} }],
  },
  {
    id: 'neon',
    theme: { accent: '#00e5ff', text: '#e8fbff', panel: '#07020f', panelOpacity: 0.6, blur: 10, radius: 10, font: 'Space Grotesk', widgetAnim: 'glow', border: true, shadow: true },
    background: { type: 'gradient', from: '#050014', to: '#2a0040', angle: 160, animated: true, dim: 0.1, beatZoom: true },
    effects: [{ type: 'rings', settings: { color: '#ff2e88' } }, { type: 'floor', settings: {} }],
  },
  {
    id: 'lofi',
    theme: { accent: '#f4a261', text: '#fbeee0', panel: '#1e1410', panelOpacity: 0.7, blur: 8, radius: 20, font: 'Nunito', widgetAnim: 'float', border: false, shadow: true },
    background: { type: 'gradient', from: '#2b1d16', to: '#55372c', angle: 180, animated: false, dim: 0.15, beatZoom: false },
    effects: [{ type: 'rain', settings: { opacity: 0.35 } }, { type: 'fireflies', settings: {} }],
  },
  {
    id: 'paper',
    theme: { accent: '#e85d04', text: '#1d1d1f', panel: '#ffffff', panelOpacity: 0.85, blur: 0, radius: 14, font: 'DM Sans', widgetAnim: 'none', border: true, shadow: true },
    background: { type: 'color', color: '#f4f1ea', dim: 0, beatZoom: false },
    effects: [],
  },
  {
    id: 'ocean',
    theme: { accent: '#4cc9f0', text: '#eafaff', panel: '#021a2e', panelOpacity: 0.55, blur: 18, radius: 22, font: 'Outfit', widgetAnim: 'float', border: true, shadow: false },
    background: { type: 'gradient', from: '#03045e', to: '#0096c7', angle: 200, animated: true, dim: 0.2, beatZoom: false },
    effects: [{ type: 'bubbles', settings: { color: '#caf0f8' } }, { type: 'aurora', settings: { color: '#4cc9f0', color2: '#3a0ca3', color3: '#7209b7' } }],
  },
  {
    id: 'snow',
    theme: { accent: '#a8dadc', text: '#f1faee', panel: '#0b132b', panelOpacity: 0.6, blur: 16, radius: 18, font: 'Inter', widgetAnim: 'none', border: true, shadow: true },
    background: { type: 'gradient', from: '#0b132b', to: '#3a506b', angle: 180, animated: false, dim: 0.1, beatZoom: false },
    effects: [{ type: 'stars', settings: { density: 80 } }, { type: 'snow', settings: {} }, { type: 'meteors', settings: {} }],
  },
  {
    id: 'arcade',
    theme: { accent: '#ff2e88', text: '#fffb96', panel: '#120024', panelOpacity: 0.85, blur: 0, radius: 0, font: 'Press Start 2P', widgetAnim: 'pulse', border: true, shadow: false },
    background: { type: 'color', color: '#0d001a', dim: 0, beatZoom: true },
    effects: [{ type: 'particles', settings: { color: '#05ffa1', links: true } }],
  },
  {
    id: 'black',
    theme: { accent: '#ffffff', text: '#ffffff', panel: '#000000', panelOpacity: 0.0, blur: 0, radius: 6, font: 'Inter', widgetAnim: 'none', border: true, shadow: false },
    background: { type: 'color', color: '#000000', dim: 0, beatZoom: false },
    effects: [],
  },
]

export const FONTS = [
  'Inter', 'DM Sans', 'Poppins', 'Outfit', 'Nunito', 'Space Grotesk', 'Playfair Display',
  'JetBrains Mono', 'Bebas Neue', 'Pacifico', 'Press Start 2P', 'Caveat',
]

// Google Fonts rejects requests for weights a family lacks.
const SINGLE_WEIGHT = new Set(['Bebas Neue', 'Pacifico', 'Press Start 2P'])
const loaded = new Set<string>()

export function loadFont(font: string) {
  if (loaded.has(font)) return
  loaded.add(font)
  const family = font.replace(/ /g, '+') + (SINGLE_WEIGHT.has(font) ? '' : ':wght@400;500;600;700')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`
  document.head.appendChild(link)
}
