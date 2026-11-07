import Image from 'next/image'
import { Hero } from '@/components/home/hero'
import { ServiceCards } from '@/components/home/service-cards'
import { SiteHeader } from '@/components/site/site-header'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      {/* 노트북(lg)에서는 첫 화면과 서비스 카드를 한 화면에 세로 가운데로 모은다 */}
      <main className="relative isolate flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-center">
        {/* 배경: 주택가 골목 빈집 이미지. 첫 화면과 서비스 선택 영역 뒤에 깐다. 장식용이라 대체 텍스트는 비운다 */}
        <Image
          src="/images/home-hero.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[70%_12%]"
        />
        {/* 글자가 읽히도록 왼쪽은 흰색, 오른쪽으로 갈수록 투명하게. 폰은 화면 전체를 더 진하게 덮는다 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-background/85 md:bg-transparent md:bg-gradient-to-r md:from-background md:from-30% md:via-background/75 md:via-50% md:to-transparent md:to-75%"
        />
        <Hero />
        <ServiceCards />
      </main>
    </div>
  )
}
