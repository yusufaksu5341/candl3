/** Declarative settings schema: the customize panel renders a form from these. */
export type Field =
  | { key: string; label: string; type: 'color' }
  | { key: string; label: string; type: 'range'; min: number; max: number; step?: number }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[] }
  | { key: string; label: string; type: 'toggle' }
  | { key: string; label: string; type: 'text' | 'textarea'; placeholder?: string }

export function opts(...pairs: [string, string][]) {
  return pairs.map(([value, label]) => ({ value, label }))
}

/** Settings merged over a definition's defaults. */
export function withDefaults<T extends Record<string, unknown>>(defaults: T, settings: Record<string, unknown>): T {
  return { ...defaults, ...settings } as T
}
