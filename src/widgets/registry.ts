import {
  Activity, AudioLines, CircleDot, Clock, Disc, Disc3, Gauge, Image, Library, ListMusic, PlayCircle,
  SlidersVertical, StickyNote, Type,
} from 'lucide-react'
import {
  BarsWidget, barsDefaults, CircleWidget, circleDefaults, EqualizerWidget, eqDefaults, VinylWidget, vinylDefaults,
  VuWidget, vuDefaults, WaveWidget, waveDefaults,
} from './visual'
import {
  LibraryWidget, libraryDefaults, NowPlayingWidget, nowPlayingDefaults, PlayerWidget, playerDefaults, QueueWidget, queueDefaults,
} from './music'
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
    type: 'player', name: 'Oynatıcı', description: 'Oynat, atla, ilerleme ve ses', icon: PlayCircle,
    size: { w: 10, h: 5 }, minSize: { w: 5, h: 3 }, defaults: playerDefaults, component: PlayerWidget,
    fields: [
      { key: 'showTrack', label: 'Şarkı bilgisi', type: 'toggle' },
      { key: 'showVolume', label: 'Ses kontrolü', type: 'toggle' },
      { key: 'showExtras', label: 'Karıştır / tekrar', type: 'toggle' },
      { key: 'big', label: 'Büyük butonlar', type: 'toggle' },
    ],
  },
  {
    type: 'nowplaying', name: 'Şimdi Çalan', description: 'Kapak, şarkı ve sanatçı', icon: Disc3,
    size: { w: 7, h: 10 }, defaults: nowPlayingDefaults, component: NowPlayingWidget,
    fields: [
      { key: 'showCover', label: 'Kapak', type: 'toggle' },
      { key: 'round', label: 'Yuvarlak kapak', type: 'toggle' },
      { key: 'align', label: 'Yerleşim', type: 'select', options: opts(['center', 'Dikey'], ['row', 'Yatay']) },
      { key: 'titleSize', label: 'Başlık boyutu', type: 'range', min: 12, max: 48 },
    ],
  },
  {
    type: 'library', name: 'Kütüphane', description: 'Internet Archive araması ve kendi dosyaların', icon: Library,
    size: { w: 7, h: 18 }, minSize: { w: 4, h: 8 }, defaults: libraryDefaults, component: LibraryWidget,
    fields: [
      { key: 'showGenres', label: 'Tür etiketleri', type: 'toggle' },
      { key: 'grid', label: 'Izgara görünümü', type: 'toggle' },
    ],
  },
  {
    type: 'queue', name: 'Çalma Sırası', description: 'Sıradaki parçalar', icon: ListMusic,
    size: { w: 7, h: 11 }, minSize: { w: 4, h: 5 }, defaults: queueDefaults, component: QueueWidget,
    fields: [{ key: 'showCovers', label: 'Kapaklar', type: 'toggle' }],
  },
  {
    type: 'equalizer', name: 'Ekolayzer', description: '10 bantlı ekolayzer ve hazır ayarlar', icon: SlidersVertical,
    size: { w: 7, h: 9 }, minSize: { w: 5, h: 5 }, defaults: eqDefaults, component: EqualizerWidget,
    fields: [
      { key: 'showPresets', label: 'Hazır ayarlar', type: 'toggle' },
      { key: 'showLabels', label: 'Etiketler', type: 'toggle' },
    ],
  },
  {
    type: 'circle', name: 'Müzik Dairesi', description: 'Kapağın etrafında dönen ritim halkası', icon: CircleDot,
    size: { w: 10, h: 12 }, minSize: { w: 4, h: 5 }, defaults: circleDefaults, component: CircleWidget,
    fields: [
      { key: 'style', label: 'Stil', type: 'select', options: opts(['bars', 'Çubuklar'], ['wave', 'Dalga']) },
      { key: 'count', label: 'Çubuk sayısı', type: 'range', min: 24, max: 200 },
      { key: 'color', label: 'Renk 1', type: 'color' },
      { key: 'color2', label: 'Renk 2', type: 'color' },
      { key: 'cover', label: 'Ortada kapak', type: 'toggle' },
      { key: 'rotate', label: 'Dönsün', type: 'toggle' },
      { key: 'pulse', label: 'Bas ile atsın', type: 'toggle' },
    ],
  },
  {
    type: 'bars', name: 'Spektrum', description: 'Frekans çubukları', icon: AudioLines,
    size: { w: 10, h: 5 }, minSize: { w: 3, h: 2 }, defaults: barsDefaults, component: BarsWidget,
    fields: [
      { key: 'count', label: 'Çubuk sayısı', type: 'range', min: 8, max: 128 },
      { key: 'gap', label: 'Aralık', type: 'range', min: 0, max: 10 },
      { key: 'color', label: 'Renk', type: 'color' },
      { key: 'gradient', label: 'Renk geçişi', type: 'toggle' },
      { key: 'color2', label: 'Geçiş rengi', type: 'color' },
      { key: 'mirror', label: 'Ayna', type: 'toggle' },
      { key: 'rounded', label: 'Yuvarlak uçlar', type: 'toggle' },
      { key: 'peaks', label: 'Tepe çizgileri', type: 'toggle' },
    ],
  },
  {
    type: 'wave', name: 'Dalga Formu', description: 'Osiloskop çizgisi', icon: Activity,
    size: { w: 10, h: 4 }, minSize: { w: 3, h: 2 }, defaults: waveDefaults, component: WaveWidget,
    fields: [
      { key: 'color', label: 'Renk', type: 'color' },
      { key: 'width', label: 'Kalınlık', type: 'range', min: 1, max: 8 },
      { key: 'glow', label: 'Parlama', type: 'toggle' },
      { key: 'fill', label: 'Dolgu', type: 'toggle' },
    ],
  },
  {
    type: 'vinyl', name: 'Plak', description: 'Dönen plak ve iğne kolu', icon: Disc,
    size: { w: 8, h: 10 }, minSize: { w: 4, h: 5 }, defaults: vinylDefaults, component: VinylWidget,
    fields: [
      { key: 'speed', label: 'Dönüş hızı', type: 'range', min: 0.2, max: 3, step: 0.1 },
      { key: 'arm', label: 'İğne kolu', type: 'toggle' },
      { key: 'react', label: 'Basa tepki', type: 'toggle' },
      { key: 'label', label: 'Etiket rengi (kapak yoksa)', type: 'color' },
    ],
  },
  {
    type: 'vu', name: 'VU Metre', description: 'Ses seviyesi göstergesi', icon: Gauge,
    size: { w: 8, h: 3 }, minSize: { w: 2, h: 2 }, defaults: vuDefaults, component: VuWidget,
    fields: [
      { key: 'color', label: 'Renk', type: 'color' },
      { key: 'segments', label: 'Bölüm sayısı', type: 'range', min: 8, max: 48 },
      { key: 'vertical', label: 'Dikey', type: 'toggle' },
    ],
  },
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
