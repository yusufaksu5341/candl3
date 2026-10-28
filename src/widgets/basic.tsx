import { useEffect, useState } from 'react'
import { locale, useT } from '../i18n'
import { useDesign } from '../store/design'
import type { WidgetProps } from './types'

export const clockDefaults = { hour24: true, seconds: false, date: true, size: 56, weight: '600' }

export function ClockWidget({ settings: s }: WidgetProps<typeof clockDefaults>) {
  useT()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const time = now.toLocaleTimeString(locale(), {
    hour: '2-digit', minute: '2-digit', second: s.seconds ? '2-digit' : undefined, hour12: !s.hour24,
  })
  return (
    <div className="center-col">
      <div style={{ fontSize: s.size, fontWeight: Number(s.weight), lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{time}</div>
      {s.date && (
        <div className="muted" style={{ marginTop: 8 }}>
          {now.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      )}
    </div>
  )
}

export const textDefaults = { text: 'My music room', size: 32, weight: '700', align: 'center', gradient: false }

export function TextWidget({ settings: s }: WidgetProps<typeof textDefaults>) {
  return (
    <div className="center-col" style={{ alignItems: s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center' }}>
      <div
        className={s.gradient ? 'text-gradient' : undefined}
        style={{ fontSize: s.size, fontWeight: Number(s.weight), textAlign: s.align as 'center', whiteSpace: 'pre-wrap', lineHeight: 1.15 }}
      >
        {s.text}
      </div>
    </div>
  )
}

export const imageDefaults = { url: '', fit: 'cover', round: false }

export function ImageWidget({ settings: s }: WidgetProps<typeof imageDefaults>) {
  const t = useT()
  if (!s.url) return <div className="center-col muted">{t('b.addImage')}</div>
  return (
    <img
      src={s.url}
      alt=""
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: s.fit as 'cover', borderRadius: s.round ? '50%' : 'calc(var(--radius) * 0.6)' }}
    />
  )
}

export const notesDefaults = { text: '', size: 15 }

export function NotesWidget({ id, settings: s }: WidgetProps<typeof notesDefaults>) {
  const t = useT()
  const update = useDesign((d) => d.updateWidget)
  return (
    <textarea
      className="notes no-drag"
      value={s.text}
      placeholder={t('b.notes')}
      style={{ fontSize: s.size }}
      onChange={(e) => update(id, { text: e.target.value })}
    />
  )
}
