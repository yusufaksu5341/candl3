import type { Album, Track } from '../types'

const BASE = 'https://archive.org'
const MUSIC_COLLECTIONS = '(collection:netlabels OR collection:audio_music OR collection:78rpm OR collection:etree)'

export const GENRES = [
  'lofi', 'jazz', 'electronic', 'ambient', 'rock', 'classical',
  'hip hop', 'chiptune', 'piano', 'blues', 'techno', 'folk',
]

type SearchDoc = { identifier: string; title?: string; creator?: string | string[]; downloads?: number }

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? '' : v ?? ''
}

export function coverUrl(identifier: string) {
  return `${BASE}/services/img/${encodeURIComponent(identifier)}`
}

export async function searchAlbums(query: string, opts: { genre?: string; page?: number; rows?: number } = {}): Promise<Album[]> {
  const parts = [MUSIC_COLLECTIONS, 'mediatype:audio']
  if (query.trim()) parts.push(`(${query.trim()})`)
  if (opts.genre) parts.push(`subject:("${opts.genre}")`)
  const params = new URLSearchParams({
    q: parts.join(' AND '),
    rows: String(opts.rows ?? 30),
    page: String(opts.page ?? 1),
    output: 'json',
  })
  for (const f of ['identifier', 'title', 'creator', 'downloads']) params.append('fl[]', f)
  params.append('sort[]', 'downloads desc')

  const res = await fetch(`${BASE}/advancedsearch.php?${params}`)
  if (!res.ok) throw new Error(`Arama başarısız (${res.status})`)
  const data = await res.json()
  return (data.response?.docs ?? []).map((d: SearchDoc) => ({
    id: d.identifier,
    title: d.title ?? d.identifier,
    artist: first(d.creator) || 'Bilinmeyen sanatçı',
    cover: coverUrl(d.identifier),
    downloads: d.downloads,
  }))
}

type MetaFile = { name: string; format?: string; title?: string; artist?: string; creator?: string; length?: string; track?: string }

function parseLength(v?: string): number | undefined {
  if (!v) return undefined
  if (v.includes(':')) return v.split(':').reduce((acc, p) => acc * 60 + Number(p), 0)
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function stripExt(name: string) {
  return name.replace(/\.[^/.]+$/, '').split('/').pop()!.replace(/_/g, ' ')
}

// Prefer the highest-quality MP3 derivative of each track.
const MP3_RANK = ['VBR MP3', '320Kbps MP3', '256Kbps MP3', '192Kbps MP3', '128Kbps MP3', '64Kbps MP3']

export async function getAlbumTracks(identifier: string): Promise<Track[]> {
  const res = await fetch(`${BASE}/metadata/${encodeURIComponent(identifier)}`)
  if (!res.ok) throw new Error(`Albüm yüklenemedi (${res.status})`)
  const data = await res.json()
  const meta = data.metadata ?? {}
  const albumTitle: string = first(meta.title) || identifier
  const albumArtist: string = first(meta.creator) || 'Bilinmeyen sanatçı'
  const cover = coverUrl(identifier)

  const score = (f: MetaFile) => {
    const rank = MP3_RANK.indexOf(f.format ?? '')
    return rank >= 0 ? rank : f.name.toLowerCase().endsWith('.mp3') ? 50 : -1
  }
  const byBase = new Map<string, MetaFile>()
  for (const f of (data.files ?? []) as MetaFile[]) {
    const s = score(f)
    if (s < 0) continue
    const base = f.name.replace(/(_vbr|_64kb|_128kb)?\.[^/.]+$/i, '')
    const prev = byBase.get(base)
    if (!prev || s < score(prev)) byBase.set(base, f)
  }

  const files = [...byBase.values()].sort((a, b) => {
    const ta = parseInt(a.track ?? '', 10), tb = parseInt(b.track ?? '', 10)
    if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb
    return a.name.localeCompare(b.name, undefined, { numeric: true })
  })

  return files.map((f) => ({
    id: `${identifier}/${f.name}`,
    title: f.title || stripExt(f.name),
    artist: f.artist || f.creator || albumArtist,
    album: albumTitle,
    url: `${BASE}/download/${encodeURIComponent(identifier)}/${f.name.split('/').map(encodeURIComponent).join('/')}`,
    cover,
    duration: parseLength(f.length),
    source: 'archive' as const,
  }))
}
