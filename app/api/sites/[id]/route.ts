import { decodeId, route } from '@/lib/server/http'
import { getSiteDetail } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/** 빈집 상세 + 연결된 제보 */
export const GET = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params
  return Response.json(getSiteDetail(decodeId(id)))
})
