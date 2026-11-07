import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import type { PatrolScreenshot } from '@/lib/types'

export function PatrolGallery({ shots }: { shots: PatrolScreenshot[] }) {
  return (
    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shots.map((s, i) => (
        <li key={s.id}>
          <figure className="flex flex-col gap-3">
            <div className="relative mx-auto aspect-[9/19] w-full max-w-64 overflow-hidden rounded-[2rem] border-[6px] border-primary bg-muted shadow-lg">
              {s.src ? (
                <Image src={s.src} alt={s.caption} fill sizes="256px" className="object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="size-8" aria-hidden="true" />
                  <span className="text-xs">스크린샷 준비 중</span>
                </div>
              )}
            </div>
            <figcaption className="text-center">
              <p className="font-semibold text-primary">
                {i + 1}. {s.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.caption}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
