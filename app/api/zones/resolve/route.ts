import { route } from '@/lib/server/http'
import { resolveZone, withStore } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/** 시민 화면: 찍은 점 → 250m 구역 이름. 빈집 위치는 돌려주지 않는다 */
export const GET = route(async (req: Request) => {
  const url = new URL(req.url)
  const lat = Number(url.searchParams.get('lat'))
  const lng = Number(url.searchParams.get('lng'))
  return Response.json(await withStore(false, () => resolveZone(lat, lng)))
})
