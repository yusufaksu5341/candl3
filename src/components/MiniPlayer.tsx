import { Loader2, Music2, Pause, Play, SkipForward } from 'lucide-react'
import { useT } from '../i18n'
import { usePlayer } from '../store/player'

/** Bottom bar on phones so playback stays reachable while scrolling the page. */
export default function MiniPlayer() {
  const t = useT()
  const track = usePlayer((s) => s.queue[s.index])
  const playing = usePlayer((s) => s.playing)
  const loading = usePlayer((s) => s.loading)
  const pct = usePlayer((s) => (s.duration ? (s.position / s.duration) * 100 : 0))
  const { toggle, next } = usePlayer.getState()
  if (!track) return null
  return (
    <div className="mini-player">
      <div className="mini-progress" style={{ width: `${pct}%` }} />
      {track.cover ? <img className="cover" src={track.cover} alt="" /> : <div className="cover placeholder"><Music2 size={18} /></div>}
      <div className="ellipsis grow">
        <div className="ellipsis strong">{track.title}</div>
        <div className="ellipsis muted small">{track.artist}</div>
      </div>
      <button className="ctl play" onClick={toggle} title={t('m.playPause')}>
        {loading && playing ? <Loader2 size={20} className="spin" /> : playing ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <button className="ctl" onClick={next} title={t('m.next')}><SkipForward size={20} /></button>
    </div>
  )
}
