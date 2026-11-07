/**
 * 공유 저장소(Upstash Redis REST). 배포본(Vercel)은 요청마다 다른 서버가 받을 수 있어서
 * 메모리만으로는 제보·점검 기록이 사라질 수 있다. 환경변수가 있으면 Redis에 상태를 저장한다.
 * - Vercel Storage에서 Upstash Redis를 연결하면 KV_REST_API_URL / KV_REST_API_TOKEN이 자동으로 들어온다.
 * - 직접 만들었다면 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN도 된다.
 * 환경변수가 없으면(로컬 개발·시연 노트북) 지금처럼 메모리만 쓴다.
 */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''

export const kvEnabled = Boolean(URL_ && TOKEN)

async function command<T>(args: string[]): Promise<T> {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  const body = (await res.json()) as { result?: T; error?: string }
  if (body.error) throw new Error(`Redis ${body.error}`)
  return body.result as T
}

export function kvGet(key: string): Promise<string | null> {
  return command<string | null>(['GET', key])
}

export async function kvSet(key: string, value: string): Promise<void> {
  await command<string>(['SET', key, value])
}
