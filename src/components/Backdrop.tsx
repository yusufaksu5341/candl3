import { useEffect, useState } from 'react'
import { effectDef } from '../effects'
import { loadBlob } from '../lib/blobStore'
import { REDUCED_MOTION_QUERY, useIsMobile, useMedia } from '../lib/media'
import { useDesign } from '../store/design'

export const BG_UPLOAD_KEY = 'background'
/** Dispatched on window after a new upload so Backdrop reloads the blob. */
export const BG_UPLOADED_EVENT = 'bg-uploaded'

function useUploadUrl(enabled: boolean, version: number) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!enabled) return
    let obj: string | undefined
    let alive = true
    loadBlob(BG_UPLOAD_KEY).then((b) => {
      if (!alive || !b) return
      obj = URL.createObjectURL(b)
      setUrl(obj)
    }).catch(() => { /* storage unavailable (e.g. private mode): fall back to the color */ })
    return () => { alive = false; if (obj) URL.revokeObjectURL(obj) }
  }, [enabled, version])
  return url
}

export default function Backdrop() {
  const bg = useDesign((s) => s.background)
  const effects = useDesign((s) => s.effects)
  const accent = useDesign((s) => s.theme.accent)
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const onUpload = () => setVersion((v) => v + 1)
    window.addEventListener(BG_UPLOADED_EVENT, onUpload)
    return () => window.removeEventListener(BG_UPLOADED_EVENT, onUpload)
  }, [])
  const uploadUrl = useUploadUrl(bg.type === 'upload', version)
  const reducedMotion = useMedia(REDUCED_MOTION_QUERY)
  const mobile = useIsMobile()

  const mediaUrl = bg.type === 'upload' ? uploadUrl : bg.url
  const isVideo = bg.type === 'video' || (bg.type === 'upload' && bg.uploadKind === 'video')
  const isImage = bg.type === 'image' || (bg.type === 'upload' && bg.uploadKind === 'image')

  let background = bg.color
  if (bg.type === 'gradient') {
    background = bg.animated
      ? `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to}, ${accent}66, ${bg.from})`
      : `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`
  }

  return (
    <div className="backdrop">
      <div
        className={`bg-layer ${bg.type === 'gradient' && bg.animated ? 'animated' : ''} ${bg.beatZoom ? 'beat-zoom' : ''}`}
        style={{ background: isImage || isVideo ? bg.color : background, filter: bg.blur ? `blur(${bg.blur}px)` : undefined }}
      >
        {isImage && mediaUrl && <img src={mediaUrl} alt="" />}
        {isVideo && mediaUrl && <video src={mediaUrl} autoPlay muted loop playsInline />}
      </div>
      <div className="bg-dim" style={{ opacity: bg.dim }} />
      {!reducedMotion && effects.filter((e) => e.enabled).map((e) => {
        const def = effectDef(e.type)
        if (!def) return null
        const Comp = def.component
        const settings = { ...def.defaults, ...e.settings } as Record<string, unknown>
        // Phones get half the particles to keep scrolling smooth.
        if (mobile && typeof settings.density === 'number') settings.density = Math.max(4, Math.round(settings.density / 2))
        return <Comp key={e.id} settings={settings as never} />
      })}
    </div>
  )
}
