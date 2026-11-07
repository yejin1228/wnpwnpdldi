import { Hero } from '@/components/home/hero'
import { ServiceCards } from '@/components/home/service-cards'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ServiceCards />
      </main>
      <SiteFooter />
    </>
  )
}
