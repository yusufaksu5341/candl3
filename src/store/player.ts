import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { engine, EQ_BANDS } from '../audio/engine'
import { t } from '../i18n'
import type { Track } from '../types'

type Repeat = 'off' | 'all' | 'one'

type PlayerState = {
  queue: Track[]
  index: number
  playing: boolean
  loading: boolean
  position: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: Repeat
  eq: number[]
  error?: string

  playQueue: (tracks: Track[], startIndex?: number) => void
  addToQueue: (tracks: Track[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  playAt: (index: number) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setEq: (index: number, gain: number) => void
  setEqAll: (gains: number[]) => void
  /** Stops playback and restores volume, EQ, shuffle and repeat defaults. */
  resetAll: () => void
}

const audio = engine.audio

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => {
      const load = (index: number, autoplay = true) => {
        const track = get().queue[index]
        if (!track) return
        set({ index, position: 0, duration: track.duration ?? 0, error: undefined, loading: true })
        audio.src = track.url
        if (autoplay) {
          engine.ensureContext()
          audio.play().catch((e) => {
            // AbortError just means a newer load/pause superseded this play().
            if (e.name !== 'AbortError') set({ error: String(e.message ?? e), playing: false, loading: false })
          })
        }
      }

      return {
        queue: [],
        index: -1,
        playing: false,
        loading: false,
        position: 0,
        duration: 0,
        volume: 0.8,
        muted: false,
        shuffle: false,
        repeat: 'off',
        eq: EQ_BANDS.map(() => 0),

        playQueue: (tracks, startIndex = 0) => {
          set({ queue: tracks })
          load(startIndex)
        },
        addToQueue: (tracks) => {
          const wasEmpty = get().queue.length === 0
          set({ queue: [...get().queue, ...tracks] })
          if (wasEmpty) load(0)
        },
        removeFromQueue: (i) => {
          const { queue, index } = get()
          const next = queue.filter((_, j) => j !== i)
          if (i === index) {
            set({ queue: next })
            if (next.length) load(Math.min(i, next.length - 1), get().playing)
            else { audio.pause(); audio.removeAttribute('src'); set({ index: -1, playing: false }) }
          } else {
            set({ queue: next, index: i < index ? index - 1 : index })
          }
        },
        clearQueue: () => {
          audio.pause()
          audio.removeAttribute('src')
          set({ queue: [], index: -1, playing: false, position: 0, duration: 0 })
        },
        playAt: (i) => load(i),
        toggle: () => {
          const { queue, index } = get()
          if (!queue.length) return
          if (index < 0 || !audio.src) return load(Math.max(index, 0))
          engine.ensureContext()
          if (audio.paused) void audio.play().catch((e) => { if (e.name !== 'AbortError') set({ error: String(e.message ?? e) }) })
          else audio.pause()
        },
        next: () => {
          const { queue, index, shuffle, repeat } = get()
          if (!queue.length) return
          if (shuffle && queue.length > 1) {
            let r = index
            while (r === index) r = Math.floor(Math.random() * queue.length)
            return load(r)
          }
          if (index + 1 < queue.length) load(index + 1)
          else if (repeat === 'all') load(0)
        },
        prev: () => {
          const { index } = get()
          if (audio.currentTime > 3 || index <= 0) { audio.currentTime = 0; return }
          load(index - 1)
        },
        seek: (s) => {
          if (Number.isFinite(s)) audio.currentTime = s
          set({ position: s })
        },
        setVolume: (v) => {
          audio.volume = v
          set({ volume: v, muted: false })
          audio.muted = false
        },
        toggleMute: () => {
          audio.muted = !get().muted
          set({ muted: !get().muted })
        },
        toggleShuffle: () => set({ shuffle: !get().shuffle }),
        cycleRepeat: () => {
          const order: Repeat[] = ['off', 'all', 'one']
          set({ repeat: order[(order.indexOf(get().repeat) + 1) % order.length] })
        },
        setEq: (i, gain) => {
          engine.setEqGain(i, gain)
          const eq = [...get().eq]
          eq[i] = gain
          set({ eq })
        },
        setEqAll: (gains) => {
          gains.forEach((g, i) => engine.setEqGain(i, g))
          set({ eq: [...gains] })
        },
        resetAll: () => {
          get().clearQueue()
          get().setEqAll(EQ_BANDS.map(() => 0))
          get().setVolume(0.8)
          set({ shuffle: false, repeat: 'off', error: undefined })
        },
      }
    },
    {
      name: 'koztech-player',
      // Local files use object URLs that do not survive a reload.
      partialize: (s) => ({
        queue: s.queue.filter((t) => t.source !== 'local'),
        index: s.queue[s.index]?.source === 'local' ? -1 : s.index,
        volume: s.volume,
        shuffle: s.shuffle,
        repeat: s.repeat,
        eq: s.eq,
      }),
      onRehydrateStorage: () => (s) => {
        if (!s) return
        audio.volume = s.volume
        s.eq.forEach((g, i) => engine.setEqGain(i, g))
        if (s.index >= s.queue.length) s.index = -1
      },
    },
  ),
)

audio.addEventListener('play', () => usePlayer.setState({ playing: true }))
audio.addEventListener('pause', () => usePlayer.setState({ playing: false }))
audio.addEventListener('playing', () => usePlayer.setState({ loading: false }))
audio.addEventListener('waiting', () => usePlayer.setState({ loading: true }))
audio.addEventListener('timeupdate', () => usePlayer.setState({ position: audio.currentTime }))
audio.addEventListener('loadedmetadata', () => {
  if (Number.isFinite(audio.duration)) usePlayer.setState({ duration: audio.duration })
})
audio.addEventListener('ended', () => {
  const s = usePlayer.getState()
  if (s.repeat === 'one') { audio.currentTime = 0; void audio.play() }
  else s.next()
})
audio.addEventListener('error', () => {
  if (!audio.getAttribute('src')) return
  usePlayer.setState({ error: t('m.playError'), loading: false })
  setTimeout(() => usePlayer.getState().next(), 1200)
})

export function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
