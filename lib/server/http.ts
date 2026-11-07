/** 라우트 공통: 오류 형식 { error: { code, message } }, 상태 코드는 400·404만 쓴다(명세 6장). */

export class HttpError extends Error {
  constructor(
    public status: 400 | 404,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export const badRequest = (message: string, code = 'BAD_REQUEST') => new HttpError(400, code, message)
export const notFound = (message: string, code = 'NOT_FOUND') => new HttpError(404, code, message)

export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) {
    return Response.json({ error: { code: e.code, message: e.message } }, { status: e.status })
  }
  console.error('[api] 처리 중 오류', e)
  return Response.json({ error: { code: 'BAD_REQUEST', message: '요청을 처리하지 못했습니다' } }, { status: 400 })
}

/** 핸들러를 감싸 오류를 공통 형식으로 바꾼다 */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response> | Response) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args)
    } catch (e) {
      return errorResponse(e)
    }
  }
}

/** 경로의 빈집 id('와동-102-**')는 인코딩돼 올 수 있다 */
export function decodeId(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    if (body && typeof body === 'object') return body as Record<string, unknown>
  } catch {
    // 아래에서 400
  }
  throw badRequest('JSON 본문이 필요합니다')
}

export async function readForm(req: Request): Promise<FormData> {
  try {
    return await req.formData()
  } catch {
    throw badRequest('multipart/form-data 본문이 필요합니다')
  }
}

/** FormData에서 파일만 꺼낸다(빈 파일 제외) */
export function formFiles(form: FormData, name: string): File[] {
  return form.getAll(name).filter((v): v is File => typeof v === 'object' && v !== null && 'arrayBuffer' in v && v.size > 0)
}

export function formText(form: FormData, name: string): string {
  const v = form.get(name)
  return typeof v === 'string' ? v.trim() : ''
}
