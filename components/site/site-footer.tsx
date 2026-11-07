import { BrandMark } from './brand-mark'

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/60">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-10 md:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="text-sm font-semibold text-primary">안산시 빈집 안전관리 플랫폼</span>
        </div>
      </div>
    </footer>
  )
}
