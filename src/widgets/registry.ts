import {
  Activity, AudioLines, CircleDot, Clock, Disc, Disc3, Gauge, Image, Library, ListMusic, PlayCircle,
  SlidersVertical, StickyNote, Type,
} from 'lucide-react'
import { opts } from '../lib/fields'
import type { Field } from '../lib/fields'
import {
  ClockWidget, clockDefaults, ImageWidget, imageDefaults, NotesWidget, notesDefaults, TextWidget, textDefaults,
} from './basic'
import {
  LibraryWidget, libraryDefaults, NowPlayingWidget, nowPlayingDefaults, PlayerWidget, playerDefaults, QueueWidget, queueDefaults,
} from './music'
import type { WidgetDef } from './types'
import {
  BarsWidget, barsDefaults, CircleWidget, circleDefaults, EqualizerWidget, eqDefaults, VinylWidget, vinylDefaults,
  VuWidget, vuDefaults, WaveWidget, waveDefaults,
} from './visual'

/** Settings every widget has, regardless of type. Labels are i18n keys. */
export const COMMON_DEFAULTS = { panel: true, anim: 'theme', padding: 14 }

export const COMMON_FIELDS: Field[] = [
  { key: 'panel', label: 'f.panel', type: 'toggle' },
  { key: 'padding', label: 'f.padding', type: 'range', min: 0, max: 40 },
  {
    key: 'anim', label: 'f.anim', type: 'select',
    options: opts(['theme', 'anim.theme'], ['none', 'anim.none'], ['float', 'anim.float'], ['pulse', 'anim.pulse'], ['glow', 'anim.glow'], ['tilt', 'anim.tilt']),
  },
]

const WEIGHTS = opts(['300', 'opt.thin'], ['500', 'opt.normal'], ['700', 'opt.bold'], ['900', 'opt.black'])

export const WIDGETS: WidgetDef[] = [
  {
    type: 'player', icon: PlayCircle,
    size: { w: 10, h: 5 }, minSize: { w: 5, h: 3 }, defaults: playerDefaults, component: PlayerWidget,
    fields: [
      { key: 'showTrack', label: 'f.showTrack', type: 'toggle' },
      { key: 'showVolume', label: 'f.showVolume', type: 'toggle' },
      { key: 'showExtras', label: 'f.showExtras', type: 'toggle' },
      { key: 'big', label: 'f.big', type: 'toggle' },
    ],
  },
  {
    type: 'nowplaying', icon: Disc3,
    size: { w: 7, h: 10 }, defaults: nowPlayingDefaults, component: NowPlayingWidget,
    fields: [
      { key: 'showCover', label: 'f.showCover', type: 'toggle' },
      { key: 'round', label: 'f.round', type: 'toggle' },
      { key: 'align', label: 'f.layout', type: 'select', options: opts(['center', 'opt.vertical'], ['row', 'opt.horizontal']) },
      { key: 'titleSize', label: 'f.titleSize', type: 'range', min: 12, max: 48 },
    ],
  },
  {
    type: 'library', icon: Library,
    size: { w: 7, h: 18 }, minSize: { w: 4, h: 8 }, defaults: libraryDefaults, component: LibraryWidget,
    fields: [
      { key: 'showGenres', label: 'f.showGenres', type: 'toggle' },
      { key: 'grid', label: 'f.grid', type: 'toggle' },
    ],
  },
  {
    type: 'queue', icon: ListMusic,
    size: { w: 7, h: 11 }, minSize: { w: 4, h: 5 }, defaults: queueDefaults, component: QueueWidget,
    fields: [{ key: 'showCovers', label: 'f.showCovers', type: 'toggle' }],
  },
  {
    type: 'equalizer', icon: SlidersVertical,
    size: { w: 7, h: 9 }, minSize: { w: 5, h: 5 }, defaults: eqDefaults, component: EqualizerWidget,
    fields: [
      { key: 'showPresets', label: 'f.showPresets', type: 'toggle' },
      { key: 'showLabels', label: 'f.showLabels', type: 'toggle' },
    ],
  },
  {
    type: 'circle', icon: CircleDot,
    size: { w: 10, h: 12 }, minSize: { w: 4, h: 5 }, defaults: circleDefaults, component: CircleWidget,
    fields: [
      { key: 'style', label: 'f.style', type: 'select', options: opts(['bars', 'opt.bars'], ['wave', 'opt.wave']) },
      { key: 'count', label: 'f.count', type: 'range', min: 24, max: 200 },
      { key: 'color', label: 'f.color1', type: 'color' },
      { key: 'color2', label: 'f.color2', type: 'color' },
      { key: 'cover', label: 'f.coverCenter', type: 'toggle' },
      { key: 'rotate', label: 'f.rotate', type: 'toggle' },
      { key: 'pulse', label: 'f.pulse', type: 'toggle' },
    ],
  },
  {
    type: 'bars', icon: AudioLines,
    size: { w: 10, h: 5 }, minSize: { w: 3, h: 2 }, defaults: barsDefaults, component: BarsWidget,
    fields: [
      { key: 'count', label: 'f.count', type: 'range', min: 8, max: 128 },
      { key: 'gap', label: 'f.gap', type: 'range', min: 0, max: 10 },
      { key: 'color', label: 'f.color', type: 'color' },
      { key: 'gradient', label: 'f.gradient', type: 'toggle' },
      { key: 'color2', label: 'f.gradientColor', type: 'color' },
      { key: 'mirror', label: 'f.mirror', type: 'toggle' },
      { key: 'rounded', label: 'f.rounded', type: 'toggle' },
      { key: 'peaks', label: 'f.peaks', type: 'toggle' },
    ],
  },
  {
    type: 'wave', icon: Activity,
    size: { w: 10, h: 4 }, minSize: { w: 3, h: 2 }, defaults: waveDefaults, component: WaveWidget,
    fields: [
      { key: 'color', label: 'f.color', type: 'color' },
      { key: 'width', label: 'f.width', type: 'range', min: 1, max: 8 },
      { key: 'glow', label: 'f.glow', type: 'toggle' },
      { key: 'fill', label: 'f.fill', type: 'toggle' },
    ],
  },
  {
    type: 'vinyl', icon: Disc,
    size: { w: 8, h: 10 }, minSize: { w: 4, h: 5 }, defaults: vinylDefaults, component: VinylWidget,
    fields: [
      { key: 'speed', label: 'f.speed', type: 'range', min: 0.2, max: 3, step: 0.1 },
      { key: 'arm', label: 'f.arm', type: 'toggle' },
      { key: 'react', label: 'f.react', type: 'toggle' },
      { key: 'label', label: 'f.labelColor', type: 'color' },
    ],
  },
  {
    type: 'vu', icon: Gauge,
    size: { w: 8, h: 3 }, minSize: { w: 2, h: 2 }, defaults: vuDefaults, component: VuWidget,
    fields: [
      { key: 'color', label: 'f.color', type: 'color' },
      { key: 'segments', label: 'f.segments', type: 'range', min: 8, max: 48 },
      { key: 'vertical', label: 'f.vertical', type: 'toggle' },
    ],
  },
  {
    type: 'clock', icon: Clock,
    size: { w: 6, h: 5 }, defaults: clockDefaults, component: ClockWidget,
    fields: [
      { key: 'hour24', label: 'f.hour24', type: 'toggle' },
      { key: 'seconds', label: 'f.seconds', type: 'toggle' },
      { key: 'date', label: 'f.date', type: 'toggle' },
      { key: 'size', label: 'f.size', type: 'range', min: 20, max: 140 },
      { key: 'weight', label: 'f.weight', type: 'select', options: WEIGHTS },
    ],
  },
  {
    type: 'text', icon: Type,
    size: { w: 8, h: 3 }, defaults: textDefaults, component: TextWidget,
    fields: [
      { key: 'text', label: 'f.text', type: 'textarea' },
      { key: 'size', label: 'f.size', type: 'range', min: 12, max: 120 },
      { key: 'weight', label: 'f.weight', type: 'select', options: WEIGHTS },
      { key: 'align', label: 'f.align', type: 'select', options: opts(['left', 'opt.left'], ['center', 'opt.center'], ['right', 'opt.right']) },
      { key: 'gradient', label: 'f.gradientText', type: 'toggle' },
    ],
  },
  {
    type: 'image', icon: Image,
    size: { w: 6, h: 8 }, defaults: imageDefaults, component: ImageWidget,
    fields: [
      { key: 'url', label: 'f.imageUrl', type: 'text', placeholder: 'https://…' },
      { key: 'fit', label: 'f.fit', type: 'select', options: opts(['cover', 'opt.cover'], ['contain', 'opt.contain']) },
      { key: 'round', label: 'f.roundImage', type: 'toggle' },
    ],
  },
  {
    type: 'notes', icon: StickyNote,
    size: { w: 6, h: 7 }, defaults: notesDefaults, component: NotesWidget,
    fields: [{ key: 'size', label: 'f.fontSize', type: 'range', min: 11, max: 28 }],
  },
]

export const widgetDef = (type: string) => WIDGETS.find((w) => w.type === type)
