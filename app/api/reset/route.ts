import { HttpError, route } from '@/lib/server/http'
import { resetStore } from '@/lib/server/store'

/**
 * 시연 초기화. 배포본은 서버를 다시 켜도 Redis에 상태가 남으므로 이 주소로 처음 상태로 되돌린다.
 * 환경변수 RESET_TOKEN이 있으면 ?token=값 이 맞아야 한다.
 */
export const POST = route(async (req: Request) => {
  const need = process.env.RESET_TOKEN
  if (need && new URL(req.url).searchParams.get('token') !== need) {
    throw new HttpError(404, 'NOT_FOUND', '찾을 수 없습니다')
  }
  return Response.json({ ok: true, summary: await resetStore() })
})
