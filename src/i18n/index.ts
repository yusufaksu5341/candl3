import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { de } from './de'
import { en } from './en'
import type { Dict } from './en'
import { es } from './es'
import { fr } from './fr'
import { tr } from './tr'

export const LANGS = [
  { code: 'en', label: 'English', locale: 'en-US' },
  { code: 'tr', label: 'Türkçe', locale: 'tr-TR' },
  { code: 'es', label: 'Español', locale: 'es-ES' },
  { code: 'de', label: 'Deutsch', locale: 'de-DE' },
  { code: 'fr', label: 'Français', locale: 'fr-FR' },
] as const

export type Lang = (typeof LANGS)[number]['code']
export type TKey = keyof Dict

const DICTS: Record<Lang, Dict> = { en, tr, es, de, fr }

export const useLang = create<{ lang: Lang; setLang: (l: Lang) => void }>()(
  persist((set) => ({ lang: 'en', setLang: (lang) => set({ lang }) }), { name: 'koztech-lang' }),
)

/** Looks up a key; unknown keys are returned as-is so plain strings pass through. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = DICTS[useLang.getState().lang] ?? en
  let s: string = (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
  return s
}

/** Subscribes the component to language changes and returns the translator. */
export function useT() {
  useLang((s) => s.lang)
  return t
}

export function locale() {
  return LANGS.find((l) => l.code === useLang.getState().lang)?.locale ?? 'en-US'
}
