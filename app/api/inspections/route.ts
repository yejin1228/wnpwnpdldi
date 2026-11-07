import { badRequest, readJson, route } from '@/lib/server/http'
import { confirmInspection, withStore } from '@/lib/server/store'

/** 위해 단계 확정: { siteId, confirmedStage: 1|2|3|null, journal } → 색 갱신 */
export const POST = route(async (req: Request) => {
  const body = await readJson(req)
  if (typeof body.siteId !== 'string' || !body.siteId) throw badRequest('siteId가 필요합니다')
  if (!('confirmedStage' in body)) throw badRequest('confirmedStage가 필요합니다(이상 없음은 null)')
  const journal = typeof body.journal === 'string' ? body.journal : ''
  const siteId = body.siteId
  return Response.json(await withStore(true, () => confirmInspection(siteId, body.confirmedStage, journal)), { status: 201 })
})
