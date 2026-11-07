import { BrandMark } from './brand-mark'

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t bg-secondary/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="text-sm font-semibold text-primary">안산시 빈집 안전관리 플랫폼</span>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">개인정보처리방침</a></li>
          <li><a href="#" className="hover:text-foreground">이용약관</a></li>
          <li><a href="#" className="hover:text-foreground">문의처</a></li>
        </ul>
      </div>
    </footer>
  )
}
