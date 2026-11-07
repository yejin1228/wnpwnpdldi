/**
 * 현장 사진 AI 판독(docs/개발명세.md 6.6·7장). 서버 전용.
 * 순서: Gemini(GEMINI_API_KEY) → GPT-4o(OPENAI_API_KEY, 예비) → 캐시(fixtures/ai-cache.json)
 * - 호출·파싱이 실패하면 오류를 내지 않고 캐시로 답한다(source: CACHE).
 * - 위해 단계 후보(suggestedStage)는 모델이 아니라 관찰 결과에서 규칙으로 뽑는다.
 *   보안·화재·붕괴 → 1단계, 위생 → 2단계, 경관 → 3단계, 해당 없음 → null
 * - 개발 서버에서 LIVE가 성공하면 그 사진 응답을 로컬 캐시(fixtures/ai-cache.local.json, git 제외)에
 *   저장한다. 인터넷이 끊겨도 같은 사진이면 같은 결과가 나온다. 테스트 사진이 git에 섞이지 않는다.
 *   시연 사진 결과를 팀과 나누려면 로컬 캐시의 항목을 ai-cache.json의 byImageHash로 옮긴다.
 */
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import bundledCache from '@/fixtures/ai-cache.json'
import type { AnalysisResult, ObsKey, ObsStatus } from '@/lib/contracts'

type Observations = AnalysisResult['observations']
interface CacheEntry {
  observations: Observations
  draftJournal: string
  recommendedAction: string | null
  savedAt?: string
}
interface CacheFile {
  _설명?: string
  default: CacheEntry
  byImageHash: Record<string, CacheEntry>
}

const OBS_KEYS: ObsKey[] = ['security', 'fire', 'hygiene', 'collapse', 'landscape']
const OBS_STATUS: ObsStatus[] = ['DETECTED', 'NOT_DETECTED', 'UNKNOWN']
const TIMEOUT_MS = 12_000
const CACHE_PATH = path.join(process.cwd(), 'fixtures', 'ai-cache.json')
const LOCAL_CACHE_PATH = path.join(process.cwd(), 'fixtures', 'ai-cache.local.json')

export const PROMPT = `너는 안산시 빈집 담당 공무원의 정기 현장 점검을 돕는 보조자다.
첨부한 빈집 사진 1장을 보고 아래 JSON 형식으로만 답한다. JSON 밖에는 아무것도 쓰지 않는다.

규칙
- 사진에 보이는 사실만 쓴다. 추측하거나 보이지 않는 것을 지어내지 않는다.
- 5개 항목을 각각 하나로 분류한다.
  - DETECTED: 문제가 사진에 보인다
  - NOT_DETECTED: 그 부분이 사진에 보이는데 문제가 없다
  - UNKNOWN: 그 부분이 사진에 없거나 판단할 수 없다. 안 찍혔다고 NOT_DETECTED로 쓰지 않는다
- 항목
  - security(보안): 출입문·창호 개방이나 파손, 무단 출입 흔적
  - fire(화재): 전선 노출·늘어짐, 가연물 적치, 그을음, 가스통 방치
  - hygiene(위생): 쓰레기·폐기물 적치, 오물, 해충·악취 원인
  - collapse(붕괴): 벽·지붕·담장 균열, 기울어짐, 마감재 탈락
  - landscape(경관): 외벽 오염·낙서, 잡초 무성, 미관 훼손
- evidence: 판단 근거를 25자 안팎 한국어로 쓴다.
- draftJournal: 점검 일지 초안 1~3문장. "~함", "~필요함" 같은 공문서 말투로 쓴다.
- recommendedAction: 필요한 조치 한 줄(예: "출입구 봉쇄", "적치물 정리"). 필요 없으면 null.
- "안전함", "위해 없음 확정" 같은 법적 판정이나 안전 보장 표현은 쓰지 않는다.
- 얼굴·차량번호·주소 같은 개인 정보는 적지 않는다.

형식
{"observations":{"security":{"status":"DETECTED|NOT_DETECTED|UNKNOWN","evidence":"..."},"fire":{"status":"...","evidence":"..."},"hygiene":{"status":"...","evidence":"..."},"collapse":{"status":"...","evidence":"..."},"landscape":{"status":"...","evidence":"..."}},"draftJournal":"...","recommendedAction":"..." 또는 null}`

export function stageFrom(obs: Observations): 1 | 2 | 3 | null {
  const hit = (k: ObsKey) => obs[k].status === 'DETECTED'
  if (hit('security') || hit('fire') || hit('collapse')) return 1
  if (hit('hygiene')) return 2
  if (hit('landscape')) return 3
  return null
}

/** 모델 출력에서 5개 항목·일지를 꺼낸다. 형식이 틀리면 null */
export function parseModelJson(text: string): CacheEntry | null {
  let data: unknown
  try {
    const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '')
    data = JSON.parse(trimmed)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  const raw = d.observations as Record<string, { status?: unknown; evidence?: unknown }> | undefined
  if (!raw || typeof raw !== 'object') return null

  const observations = {} as Observations
  for (const k of OBS_KEYS) {
    const o = raw[k]
    const status = typeof o?.status === 'string' ? (o.status.toUpperCase() as ObsStatus) : null
    if (!status || !OBS_STATUS.includes(status)) return null
    observations[k] = { status, evidence: typeof o?.evidence === 'string' ? o.evidence.slice(0, 80) : '' }
  }
  const draftJournal = typeof d.draftJournal === 'string' ? d.draftJournal.trim().slice(0, 400) : ''
  if (!draftJournal) return null
  const ra = d.recommendedAction
  const recommendedAction = typeof ra === 'string' && ra.trim() && ra.trim() !== 'null' ? ra.trim().slice(0, 60) : null
  return { observations, draftJournal, recommendedAction }
}

async function callGemini(b64: string, mime: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY 없음')
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }, { inlineData: { mimeType: mime, data: b64 } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  if (!text) throw new Error('Gemini 응답이 비어 있음')
  return text
}

async function callOpenAI(b64: string, mime: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY 없음')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const text = j.choices?.[0]?.message?.content ?? ''
  if (!text) throw new Error('OpenAI 응답이 비어 있음')
  return text
}

async function readLocalCache(): Promise<Record<string, CacheEntry>> {
  try {
    const local = JSON.parse(await readFile(LOCAL_CACHE_PATH, 'utf8')) as { byImageHash?: Record<string, CacheEntry> }
    return local.byImageHash ?? {}
  } catch {
    return {}
  }
}

/** 공유 캐시(ai-cache.json) + 이 PC의 로컬 캐시. 같은 사진이면 로컬이 우선 */
export async function loadCache(): Promise<CacheFile> {
  let shared: CacheFile
  try {
    shared = JSON.parse(await readFile(CACHE_PATH, 'utf8')) as CacheFile
  } catch {
    // 배포 환경 등 파일을 못 읽으면 번들에 들어간 캐시를 쓴다
    shared = bundledCache as unknown as CacheFile
  }
  return { ...shared, byImageHash: { ...shared.byImageHash, ...(await readLocalCache()) } }
}

/** LIVE 결과를 로컬 캐시에만 쓴다(git 제외 파일). 공유 캐시는 건드리지 않는다 */
export async function saveToCache(hash: string, entry: CacheEntry) {
  if (process.env.NODE_ENV === 'production') return
  try {
    const byImageHash = { ...(await readLocalCache()), [hash]: { ...entry, savedAt: new Date().toISOString() } }
    const body = {
      _설명: '이 PC에서 LIVE 판독에 성공한 사진의 응답(자동 저장, git 제외). 지워도 앱은 동작한다.',
      byImageHash,
    }
    await writeFile(LOCAL_CACHE_PATH, `${JSON.stringify(body, null, 2)}\n`, 'utf8')
    console.info(`[ai] 로컬 캐시 저장 ${hash.slice(0, 12)}…`)
  } catch (e) {
    console.warn('[ai] 캐시 저장 실패', e)
  }
}

function result(entry: CacheEntry, source: AnalysisResult['source'], provider: AnalysisResult['provider']): AnalysisResult {
  return {
    source,
    provider,
    observations: entry.observations,
    suggestedStage: stageFrom(entry.observations),
    draftJournal: entry.draftJournal,
    recommendedAction: entry.recommendedAction,
  }
}

export async function analyzePhoto(bytes: Buffer, mime: string): Promise<AnalysisResult> {
  const hash = createHash('sha256').update(bytes).digest('hex')
  const b64 = bytes.toString('base64')
  const type = mime.startsWith('image/') ? mime : 'image/jpeg'

  const providers: [AnalysisResult['provider'], () => Promise<string>][] = [
    ['gemini', () => callGemini(b64, type)],
    ['openai', () => callOpenAI(b64, type)],
  ]
  for (const [name, call] of providers) {
    try {
      const entry = parseModelJson(await call())
      if (!entry) throw new Error('응답 형식이 맞지 않음')
      console.info(`[ai] LIVE ${name} 성공 · 사진 ${hash.slice(0, 12)}…`)
      await saveToCache(hash, entry)
      return result(entry, 'LIVE', name)
    } catch (e) {
      console.warn(`[ai] ${name} 건너뜀: ${e instanceof Error ? e.message : e}`)
    }
  }

  const cache = await loadCache()
  const hit = cache.byImageHash?.[hash]
  console.info(`[ai] CACHE ${hit ? '사진 일치' : '기본 응답'} · 사진 ${hash.slice(0, 12)}…`)
  return result(hit ?? cache.default, 'CACHE', 'cache')
}
