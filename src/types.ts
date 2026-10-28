export type Track = {
  id: string
  title: string
  artist: string
  album?: string
  url: string
  cover?: string
  duration?: number
  source: 'archive' | 'local'
}

export type Album = {
  id: string
  title: string
  artist: string
  cover: string
  downloads?: number
}
