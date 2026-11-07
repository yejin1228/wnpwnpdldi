import { route } from '@/lib/server/http'
import { resolveZone } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/** 시민 화면: 찍은 점 → 250m 구역 이름. 빈집 위치는 돌려주지 않는다 */
export const GET = route((req: Request) => {
  const url = new URL(req.url)
  return Response.json(resolveZone(Number(url.searchParams.get('lat')), Number(url.searchParams.get('lng'))))
})
