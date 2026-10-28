import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  ArrowLeft, ListPlus, Loader2, Music2, Pause, Play, Plus, Repeat, Repeat1, Search, Shuffle,
  SkipBack, SkipForward, Trash2, Upload, Volume1, Volume2, VolumeX,
} from 'lucide-react'
import { GENRES, getAlbumTracks, searchAlbums } from '../api/archive'
import { formatTime, usePlayer } from '../store/player'
import type { Album, Track } from '../types'
import type { WidgetProps } from './types'

function useCurrent() {
  return usePlayer((s) => s.queue[s.index])
}

function Cover({ src, size, round }: { src?: string; size?: number | string; round?: boolean }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  const style = { width: size, height: size, borderRadius: round ? '50%' : 'calc(var(--radius) * 0.6)' }
  if (!src || failed) return <div className="cover placeholder" style={style}><Music2 size={22} /></div>
  return <img className="cover" src={src} alt="" style={style} draggable={false} onError={() => setFailed(true)} />
}

/* ---------------- Player ---------------- */

export const playerDefaults = { showTrack: true, showVolume: true, showExtras: true, big: false }

export function PlayerWidget({ settings: s }: WidgetProps<typeof playerDefaults>) {
  const track = useCurrent()
  const p = usePlayer()
  const icon = s.big ? 26 : 20
  const VolIcon = p.muted || p.volume === 0 ? VolumeX : p.volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="player">
      {s.showTrack && (
        <div className="player-track">
          <Cover src={track?.cover} size={40} />
          <div className="ellipsis">
            <div className="ellipsis strong">{track?.title ?? 'Bir şarkı seç'}</div>
            <div className="ellipsis muted small">{track?.artist ?? 'Kütüphaneden bir albüm aç'}</div>
          </div>
        </div>
      )}
      <div className="player-controls">
        {s.showExtras && (
          <button className={`ctl ${p.shuffle ? 'on' : ''}`} onClick={p.toggleShuffle} title="Karıştır"><Shuffle size={16} /></button>
        )}
        <button className="ctl" onClick={p.prev} title="Önceki"><SkipBack size={icon} /></button>
        <button className="ctl play" onClick={p.toggle} title="Oynat / Duraklat" style={{ width: icon * 2.2, height: icon * 2.2 }}>
          {p.loading && p.playing ? <Loader2 size={icon} className="spin" /> : p.playing ? <Pause size={icon} /> : <Play size={icon} />}
        </button>
        <button className="ctl" onClick={p.next} title="Sonraki"><SkipForward size={icon} /></button>
        {s.showExtras && (
          <button className={`ctl ${p.repeat !== 'off' ? 'on' : ''}`} onClick={p.cycleRepeat} title="Tekrar">
            {p.repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        )}
      </div>
      <div className="player-progress">
        <span className="small muted">{formatTime(p.position)}</span>
        <input
          type="range" min={0} max={p.duration || 1} step={0.1} value={Math.min(p.position, p.duration || 1)}
          onChange={(e) => p.seek(Number(e.target.value))}
          style={{ '--pct': `${(p.position / (p.duration || 1)) * 100}%` } as CSSProperties}
        />
        <span className="small muted">{formatTime(p.duration)}</span>
      </div>
      {s.showVolume && (
        <div className="player-volume">
          <button className="ctl" onClick={p.toggleMute} title="Sessiz"><VolIcon size={16} /></button>
          <input
            type="range" min={0} max={1} step={0.01} value={p.muted ? 0 : p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            style={{ '--pct': `${(p.muted ? 0 : p.volume) * 100}%` } as CSSProperties}
          />
        </div>
      )}
      {p.error && <div className="small error">{p.error}</div>}
    </div>
  )
}

/* ---------------- Now playing ---------------- */

export const nowPlayingDefaults = { showCover: true, round: false, align: 'center', titleSize: 22 }

export function NowPlayingWidget({ settings: s }: WidgetProps<typeof nowPlayingDefaults>) {
  const track = useCurrent()
  const row = s.align === 'row'
  return (
    <div className={`now-playing ${row ? 'row' : ''}`}>
      {s.showCover && <Cover src={track?.cover} size={row ? '40%' : '62%'} round={s.round} />}
      <div className="np-text">
        <div className="strong" style={{ fontSize: s.titleSize }}>{track?.title ?? 'Henüz çalmıyor'}</div>
        <div className="muted">{track?.artist ?? '—'}</div>
        {track?.album && <div className="muted small">{track.album}</div>}
      </div>
    </div>
  )
}

/* ---------------- Library ---------------- */

export const libraryDefaults = { showGenres: true, grid: true }

export function LibraryWidget({ settings: s }: WidgetProps<typeof libraryDefaults>) {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState<string>()
  const [albums, setAlbums] = useState<Album[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [album, setAlbum] = useState<Album>()
  const [tracks, setTracks] = useState<Track[]>([])
  const fileInput = useRef<HTMLInputElement>(null)
  const { playQueue, addToQueue } = usePlayer.getState()
  const reqId = useRef(0)

  const run = async (q: string, g: string | undefined, pg: number) => {
    const id = ++reqId.current
    setLoading(true); setError(undefined)
    try {
      const res = await searchAlbums(q, { genre: g, page: pg })
      if (id !== reqId.current) return
      setAlbums((prev) => (pg === 1 ? res : [...prev, ...res]))
      setPage(pg)
    } catch (e) {
      if (id === reqId.current) setError((e as Error).message)
    } finally {
      if (id === reqId.current) setLoading(false)
    }
  }

  useEffect(() => { void run('', undefined, 1) }, [])

  const openAlbum = async (a: Album) => {
    setAlbum(a); setTracks([]); setLoading(true); setError(undefined)
    try {
      const t = await getAlbumTracks(a.id)
      setTracks(t)
      if (!t.length) setError('Bu albümde çalınabilir MP3 bulunamadı.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return
    const list: Track[] = [...files].map((f) => ({
      id: `local/${f.name}/${f.size}`,
      title: f.name.replace(/\.[^/.]+$/, ''),
      artist: 'Yerel dosya',
      url: URL.createObjectURL(f),
      source: 'local',
    }))
    addToQueue(list)
  }

  if (album) {
    return (
      <div className="library">
        <div className="lib-head">
          <button className="ctl" onClick={() => { setAlbum(undefined); setError(undefined) }} title="Geri"><ArrowLeft size={18} /></button>
          <div className="ellipsis">
            <div className="ellipsis strong">{album.title}</div>
            <div className="ellipsis muted small">{album.artist}</div>
          </div>
        </div>
        <div className="album-hero">
          <Cover src={album.cover} size={72} />
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn accent" disabled={!tracks.length} onClick={() => playQueue(tracks, 0)}><Play size={14} /> Tümünü çal</button>
            <button className="btn" disabled={!tracks.length} onClick={() => addToQueue(tracks)}><ListPlus size={14} /> Sıraya ekle</button>
          </div>
        </div>
        <div className="scroll">
          {loading && <div className="muted small pad"><Loader2 size={14} className="spin" /> Parçalar yükleniyor…</div>}
          {error && <div className="small error pad">{error}</div>}
          {tracks.map((t, i) => (
            <div key={t.id} className="track-row" onDoubleClick={() => playQueue(tracks, i)}>
              <span className="muted small num">{i + 1}</span>
              <div className="ellipsis grow">
                <div className="ellipsis">{t.title}</div>
                <div className="ellipsis muted small">{t.artist}</div>
              </div>
              <span className="muted small">{t.duration ? formatTime(t.duration) : ''}</span>
              <button className="ctl" title="Çal" onClick={() => playQueue(tracks, i)}><Play size={14} /></button>
              <button className="ctl" title="Sıraya ekle" onClick={() => addToQueue([t])}><Plus size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="library">
      <form className="search" onSubmit={(e) => { e.preventDefault(); setGenre(undefined); void run(query, undefined, 1) }}>
        <Search size={15} className="muted" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Internet Archive'de ara…" />
        <button type="button" className="ctl" title="Kendi MP3 dosyalarını ekle" onClick={() => fileInput.current?.click()}><Upload size={15} /></button>
        <input ref={fileInput} type="file" accept="audio/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
      </form>
      {s.showGenres && (
        <div className="chips">
          {GENRES.map((g) => (
            <button key={g} className={`chip ${genre === g ? 'on' : ''}`} onClick={() => {
              const next = genre === g ? undefined : g
              setGenre(next); void run(query, next, 1)
            }}>{g}</button>
          ))}
        </div>
      )}
      <div className="scroll">
        {error && <div className="small error pad">{error}</div>}
        <div className={s.grid ? 'album-grid' : 'album-list'}>
          {albums.map((a) => (
            <button key={a.id} className="album" onClick={() => openAlbum(a)} title={a.title}>
              <Cover src={a.cover} />
              <div className="album-meta">
                <div className="ellipsis">{a.title}</div>
                <div className="ellipsis muted small">{a.artist}</div>
              </div>
            </button>
          ))}
        </div>
        {loading && <div className="muted small pad"><Loader2 size={14} className="spin" /> Yükleniyor…</div>}
        {!loading && albums.length > 0 && albums.length % 30 === 0 && (
          <button className="btn more" onClick={() => run(query, genre, page + 1)}>Daha fazla</button>
        )}
        {!loading && !albums.length && !error && <div className="muted small pad">Sonuç bulunamadı.</div>}
      </div>
    </div>
  )
}

/* ---------------- Queue ---------------- */

export const queueDefaults = { showCovers: true }

export function QueueWidget({ settings: s }: WidgetProps<typeof queueDefaults>) {
  const queue = usePlayer((p) => p.queue)
  const index = usePlayer((p) => p.index)
  const { playAt, removeFromQueue, clearQueue } = usePlayer.getState()
  return (
    <div className="library">
      <div className="lib-head">
        <div className="strong grow">Çalma sırası <span className="muted small">{queue.length} parça</span></div>
        {queue.length > 0 && <button className="ctl" title="Temizle" onClick={clearQueue}><Trash2 size={15} /></button>}
      </div>
      <div className="scroll">
        {!queue.length && <div className="muted small pad">Sıra boş. Kütüphaneden bir albüm çal.</div>}
        {queue.map((t, i) => (
          <div key={`${t.id}-${i}`} className={`track-row ${i === index ? 'current' : ''}`} onDoubleClick={() => playAt(i)}>
            {s.showCovers && <Cover src={t.cover} size={32} />}
            <div className="ellipsis grow" onClick={() => playAt(i)}>
              <div className="ellipsis">{t.title}</div>
              <div className="ellipsis muted small">{t.artist}</div>
            </div>
            <button className="ctl" title="Kaldır" onClick={() => removeFromQueue(i)}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
