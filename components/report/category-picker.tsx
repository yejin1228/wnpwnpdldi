'use client'

import { Bug, Flame, HelpCircle, House, Trash2, UserX, type LucideIcon } from 'lucide-react'
import { REPORT_CATEGORIES } from '@/lib/labels'
import type { ReportCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

const ICONS: Record<ReportCategory, LucideIcon> = {
  collapse: House,
  garbage: Trash2,
  intrusion: UserX,
  fire: Flame,
  pest: Bug,
  etc: HelpCircle,
}

interface CategoryPickerProps {
  value: ReportCategory | null
  onChange: (value: ReportCategory) => void
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div role="radiogroup" aria-label="제보 카테고리" className="grid grid-cols-3 gap-2">
      {REPORT_CATEGORIES.map((c) => {
        const Icon = ICONS[c.value]
        const selected = value === c.value
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(c.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border bg-card px-2 py-3 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              selected
                ? 'border-brand bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:border-brand/40 hover:text-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
