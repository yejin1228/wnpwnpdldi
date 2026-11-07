import { badRequest, formFiles, formText, readForm, route } from '@/lib/server/http'
import { completeAction, withStore } from '@/lib/server/store'

/** 조치 완료(multipart: siteId, note, completionImage) → 초록, 다음 점검 6개월 뒤 */
export const POST = route(async (req: Request) => {
  const form = await readForm(req)
  const siteId = formText(form, 'siteId')
  if (!siteId) throw badRequest('siteId가 필요합니다')
  const photos = formFiles(form, 'completionImage').length
  const note = formText(form, 'note')
  return Response.json(await withStore(true, () => completeAction(siteId, note, photos)), { status: 201 })
})
