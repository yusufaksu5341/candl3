import { engine } from './engine'
import { usePlayer } from '../store/player'

/** Lock-screen / notification controls and artwork on phones and desktop browsers. */
export function setupMediaSession() {
  if (!('mediaSession' in navigator)) return
  const ms = navigator.mediaSession
  const audio = engine.audio
  const p = () => usePlayer.getState()

  const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
    ['play', () => { if (audio.paused) p().toggle() }],
    ['pause', () => { if (!audio.paused) p().toggle() }],
    ['previoustrack', () => p().prev()],
    ['nexttrack', () => p().next()],
    ['seekto', (d) => { if (d.seekTime != null) p().seek(d.seekTime) }],
    ['seekbackward', (d) => p().seek(Math.max(0, audio.currentTime - (d.seekOffset ?? 10)))],
    ['seekforward', (d) => p().seek(audio.currentTime + (d.seekOffset ?? 10))],
  ]
  for (const [action, fn] of handlers) {
    try { ms.setActionHandler(action, fn) } catch { /* action not supported by this browser */ }
  }

  let lastId: string | undefined
  usePlayer.subscribe((s) => {
    const track = s.queue[s.index]
    if (track?.id !== lastId) {
      lastId = track?.id
      ms.metadata = track
        ? new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: track.album ?? '',
            artwork: track.cover ? [{ src: track.cover, sizes: '512x512' }] : [],
          })
        : null
    }
    ms.playbackState = s.playing ? 'playing' : 'paused'
  })

  audio.addEventListener('loadedmetadata', () => {
    if (!Number.isFinite(audio.duration) || !ms.setPositionState) return
    try {
      ms.setPositionState({ duration: audio.duration, position: Math.min(audio.currentTime, audio.duration), playbackRate: audio.playbackRate })
    } catch { /* ignore invalid states during track changes */ }
  })
}
