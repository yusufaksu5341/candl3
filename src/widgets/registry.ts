import { Clock, Image, StickyNote, Type } from 'lucide-react'
import { opts } from '../lib/fields'
import type { Field } from '../lib/fields'
import {
  ClockWidget, clockDefaults, ImageWidget, imageDefaults, NotesWidget, notesDefaults, TextWidget, textDefaults,
} from './basic'
import type { WidgetDef } from './types'

/** Settings every widget has, regardless of type. */
export const COMMON_DEFAULTS = { panel: true, anim: 'theme', padding: 14 }

export const COMMON_FIELDS: Field[] = [
  { key: 'panel', label: 'Panel arka planı', type: 'toggle' },
  { key: 'padding', label: 'İç boşluk', type: 'range', min: 0, max: 40 },
  {
    key: 'anim', label: 'Animasyon', type: 'select',
    options: opts(['theme', 'Temaya göre'], ['none', 'Yok'], ['float', 'Süzülme'], ['pulse', 'Ritimle büyüme'], ['glow', 'Ritimle parlama'], ['tilt', 'Sallanma']),
  },
]

export const WIDGETS: WidgetDef[] = [
  {
    type: 'clock', name: 'Saat', description: 'Saat ve tarih', icon: Clock,
    size: { w: 6, h: 5 }, defaults: clockDefaults, component: ClockWidget,
    fields: [
      { key: 'hour24', label: '24 saat', type: 'toggle' },
      { key: 'seconds', label: 'Saniye', type: 'toggle' },
      { key: 'date', label: 'Tarih', type: 'toggle' },
      { key: 'size', label: 'Boyut', type: 'range', min: 20, max: 140 },
      { key: 'weight', label: 'Kalınlık', type: 'select', options: opts(['300', 'İnce'], ['500', 'Normal'], ['700', 'Kalın'], ['900', 'Çok kalın']) },
    ],
  },
  {
    type: 'text', name: 'Metin', description: 'Başlık veya serbest yazı', icon: Type,
    size: { w: 8, h: 3 }, defaults: textDefaults, component: TextWidget,
    fields: [
      { key: 'text', label: 'Yazı', type: 'textarea' },
      { key: 'size', label: 'Boyut', type: 'range', min: 12, max: 120 },
      { key: 'weight', label: 'Kalınlık', type: 'select', options: opts(['300', 'İnce'], ['500', 'Normal'], ['700', 'Kalın'], ['900', 'Çok kalın']) },
      { key: 'align', label: 'Hizalama', type: 'select', options: opts(['left', 'Sol'], ['center', 'Orta'], ['right', 'Sağ']) },
      { key: 'gradient', label: 'Renk geçişli yazı', type: 'toggle' },
    ],
  },
  {
    type: 'image', name: 'Görsel', description: 'Bağlantıdan resim veya GIF', icon: Image,
    size: { w: 6, h: 8 }, defaults: imageDefaults, component: ImageWidget,
    fields: [
      { key: 'url', label: 'Görsel bağlantısı', type: 'text', placeholder: 'https://…' },
      { key: 'fit', label: 'Sığdırma', type: 'select', options: opts(['cover', 'Doldur'], ['contain', 'Sığdır']) },
      { key: 'round', label: 'Yuvarlak', type: 'toggle' },
    ],
  },
  {
    type: 'notes', name: 'Notlar', description: 'Kendine notlar', icon: StickyNote,
    size: { w: 6, h: 7 }, defaults: notesDefaults, component: NotesWidget,
    fields: [{ key: 'size', label: 'Yazı boyutu', type: 'range', min: 11, max: 28 }],
  },
]

export const widgetDef = (type: string) => WIDGETS.find((w) => w.type === type)
