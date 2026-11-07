import { House } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground', className)}
    >
      <House className="size-4" />
    </span>
  )
}
