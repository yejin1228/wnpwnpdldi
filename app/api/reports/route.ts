import { formFiles, formText, readForm, route } from '@/lib/server/http'
import { createReport, getReports, withStore } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/** 담당자용 제보 목록: 연결 전 제보 먼저, 기한 가까운 순. 미등록 확인 요청은 따로 */
export const GET = route(async () => Response.json(await withStore(false, getReports)))

/** 시민 제보 등록(multipart: category, title, description, images 0~3장, lat, lng). 후보 빈집은 돌려주지 않는다 */
export const POST = route(async (req: Request) => {
  const form = await readForm(req)
  const input = {
    category: formText(form, 'category'),
    title: formText(form, 'title'),
    description: formText(form, 'description'),
    photoCount: Number(formText(form, 'photoCount')) || formFiles(form, 'images').length,
    lat: Number(formText(form, 'lat')),
    lng: Number(formText(form, 'lng')),
  }
  const receipt = await withStore(true, () => createReport(input))
  return Response.json(receipt, { status: 201 })
})
