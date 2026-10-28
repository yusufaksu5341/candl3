import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Field } from '../lib/fields'
import type { Settings } from '../store/design'

export type WidgetProps<S = Settings> = { id: string; settings: S }

export type WidgetDef = {
  type: string
  name: string
  description: string
  icon: LucideIcon
  size: { w: number; h: number }
  minSize?: { w: number; h: number }
  defaults: Settings
  fields: Field[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: FC<WidgetProps<any>>
}
