'use client'

import { useEffect, useId, useMemo } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoPickerProps {
  files: File[]
  onChange: (files: File[]) => void
  max?: number
  className?: string
}

export function PhotoPicker({ files, onChange, max = 3, className }: PhotoPickerProps) {
  const inputId = useId()
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  const add = (list: FileList | null) => {
    if (!list) return
    const next = [...files, ...Array.from(list).filter((f) => f.type.startsWith('image/'))].slice(0, max)
    onChange(next)
  }

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {previews.map((src, i) => (
        <div key={src} className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`첨부 사진 ${i + 1}`} className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(files.filter((_, idx) => idx !== i))}
            className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-primary/80 text-primary-foreground"
            aria-label={`사진 ${i + 1} 삭제`}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {files.length < max && (
        <label
          htmlFor={inputId}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-brand/40 bg-accent/40 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent"
        >
          <ImagePlus className="size-5" aria-hidden="true" />
          사진 추가
          <span className="text-muted-foreground">
            {files.length}/{max}
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              add(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
      )}
    </div>
  )
}
