import { analyzePhoto } from '@/lib/server/ai'
import { badRequest, formFiles, formText, readForm, route } from '@/lib/server/http'
import { assertSite } from '@/lib/server/store'

export const runtime = 'nodejs'
export const maxDuration = 60

/** 현장 사진 판독(multipart: image, siteId). 실패해도 오류 대신 캐시로 답한다 */
export const POST = route(async (req: Request) => {
  const form = await readForm(req)
  const siteId = formText(form, 'siteId')
  if (!siteId) throw badRequest('siteId가 필요합니다')
  assertSite(siteId)
  const [image] = formFiles(form, 'image')
  if (!image) throw badRequest('사진(image)이 필요합니다', 'IMAGE_REQUIRED')
  const bytes = Buffer.from(await image.arrayBuffer())
  return Response.json(await analyzePhoto(bytes, image.type))
})
