import { decodeId, readJson, route } from '@/lib/server/http'
import { decideReport, withStore } from '@/lib/server/store'

/** 담당자 결정: { decision: 'LINK', siteId } 또는 { decision: 'UNREGISTERED' } */
export const PATCH = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params
  const body = await readJson(req)
  return Response.json(await withStore(true, () => decideReport(decodeId(id), body.decision, body.siteId)))
})
