/**
 * 화면 데이터 접근 계층. 모든 데이터는 서버 API(app/api)에서 받는다.
 * - 상태는 서버 메모리(lib/server/store.ts)에 있다. 그래서 /report와 /admin을 다른 탭에 띄워도 같은 데이터를 본다.
 * - 빈집 목록(houses.json)은 서버에만 있다. 시민 화면 코드에 빈집 위치가 들어가지 않는다.
 * - 서버를 다시 켜면 처음 상태로 돌아간다(= 시연 리셋).
 */
import type {
  ActionResponse,
  AnalysisResult,
  InspectionResponse,
  ObsKey,
  Report,
  ReportReceiptResponse,
  ReportsResponse,
  Site,
  SiteDetailResponse,
  SitesResponse,
  ZoneResolveResponse,
  ZoneSummary,
} from '../contracts'
import { MOCK_PATROL_SCREENSHOTS } from '../mock/data'
import type { HazardStage } from '../sos'
import type {
  AdminSummary,
  AiReading,
  Building,
  CitizenReport,
  PatrolScreenshot,
  ReportDraft,
  ReportReceipt,
  ZoneSelection,
} from '../types'

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init })
  const body = (await res.json().catch(() => null)) as (T & { error?: { message?: string } }) | null
  if (!res.ok || body === null) {
    throw new Error(body?.error?.message ?? `요청을 처리하지 못했습니다 (${res.status})`)
  }
  return body
}

const json = (data: unknown): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

/** 휴대폰 사진은 크다. 긴 변 1600px JPEG로 줄여 보낸다(업로드·AI 응답이 빨라진다). 실패하면 원본 */
async function shrink(file: File, maxSide = 1600): Promise<Blob> {
  try {
    if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') return file
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
    if (scale === 1 && file.size < 1_500_000) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
    return blob ?? file
  } catch {
    return file
  }
}

function toBuilding(s: Site): Building {
  return { ...s, address: `${s.dong} ${s.jibun}` }
}

function toCitizenReport(r: Report): CitizenReport {
  return {
    id: r.id,
    buildingId: r.siteId ?? '',
    category: r.category,
    title: r.title,
    description: r.description,
    createdAt: r.createdAt,
    photoCount: r.photoCount,
    dueAt: r.dueAt,
    dDay: r.dDay,
    status: r.status,
    zoneLabel: r.zone.label,
    inspectedAt: r.inspectedAt,
    candidateIds: r.candidateSiteIds,
  }
}

// ───────── 시민 제보 ─────────

/** 지도에서 찍은 점 → 250m 구역 이름 */
export async function resolveZone(lat: number, lng: number): Promise<ZoneSelection> {
  const z = await api<ZoneResolveResponse>(`/api/zones/resolve?lat=${lat}&lng=${lng}`)
  return { zoneLabel: z.zoneLabel, lat, lng }
}

export async function submitReport(draft: ReportDraft): Promise<ReportReceipt> {
  if (!draft.category || !draft.zone) throw new Error('필수 항목 누락')
  const form = new FormData()
  form.set('category', draft.category)
  form.set('title', draft.title)
  form.set('description', draft.content)
  form.set('lat', String(draft.zone.lat))
  form.set('lng', String(draft.zone.lng))
  for (const [i, p] of draft.photos.slice(0, 3).entries()) form.append('images', await shrink(p), `photo-${i + 1}.jpg`)
  const r = await api<ReportReceiptResponse>('/api/reports', { method: 'POST', body: form })
  return { receiptNo: r.reportId, category: draft.category, zoneLabel: r.zoneLabel, status: 'received' }
}

// ───────── 시 담당자: 지도·목록 ─────────

export async function getSites(): Promise<SitesResponse> {
  return api<SitesResponse>('/api/sites')
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const { summary } = await getSites()
  return {
    totalHouses: summary.houses,
    totalSites: summary.sites,
    newReports: summary.reports30,
    urgent: summary.byColor.DARK_RED + summary.byColor.RED,
    orange: summary.byColor.ORANGE,
    green: summary.byColor.GREEN,
  }
}

/** 먼저 갈 곳 순서(색 → 피해 범위 → 기한 넘긴 일수)로 정렬된 방문지 */
export async function getBuildings(): Promise<Building[]> {
  const { sites } = await getSites()
  return sites.map(toBuilding)
}

/** 지도에 그릴 시민 제보 구역(30일 안 제보가 있는 250m 격자) */
export async function getZones(): Promise<ZoneSummary[]> {
  const { zones } = await getSites()
  return zones
}

export async function getBuildingReports(buildingId: string): Promise<CitizenReport[]> {
  const { reports } = await api<SiteDetailResponse>(`/api/sites/${encodeURIComponent(buildingId)}`)
  return reports.map(toCitizenReport)
}

/** 30일 제보 목록: 연결 전 제보 먼저, 기한 가까운 순. 미등록 확인 요청은 따로 */
export async function getReports(): Promise<{ reports: CitizenReport[]; unregistered: CitizenReport[] }> {
  const r = await api<ReportsResponse>('/api/reports')
  return { reports: r.reports.map(toCitizenReport), unregistered: r.unregistered.map(toCitizenReport) }
}

/** 담당자가 제보를 빈집에 연결 → 그 빈집에 D-day 배지와 타임라인 기록 */
export async function linkReport(reportId: string, buildingId: string): Promise<CitizenReport> {
  const r = await api<Report>(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    ...json({ decision: 'LINK', siteId: buildingId }),
  })
  return toCitizenReport(r)
}

/** 구역 안에 등록 빈집이 없을 때: 미등록 확인 요청으로 분류 */
export async function markReportUnregistered(reportId: string): Promise<CitizenReport> {
  const r = await api<Report>(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    ...json({ decision: 'UNREGISTERED' }),
  })
  return toCitizenReport(r)
}

// ───────── 시 담당자: 현장 점검·조치 ─────────

/** 판독에 쓸 사진을 빈집별로 들고 있는다(서버는 판독 요청 때 사진을 받는다) */
const pendingPhotos = new Map<string, File[]>()

export async function uploadInspectionPhotos(buildingId: string, files: File[]): Promise<{ uploaded: number }> {
  pendingPhotos.set(buildingId, files)
  return { uploaded: files.length }
}

const OBS_LABEL: Record<ObsKey, string> = {
  security: '보안',
  fire: '화재',
  hygiene: '위생',
  collapse: '붕괴',
  landscape: '경관',
}
const OBS_TEXT = { DETECTED: '발견', NOT_DETECTED: '이상 없음', UNKNOWN: '확인 불가' } as const

/** AI 판독. 사진 1장(첫 장)을 보낸다. AI가 실패하면 서버가 캐시로 답한다(source: CACHE) */
export async function getAiReading(buildingId: string): Promise<AiReading> {
  const [photo] = pendingPhotos.get(buildingId) ?? []
  if (!photo) throw new Error('현장 사진을 먼저 올려 주세요')
  const form = new FormData()
  form.set('siteId', buildingId)
  form.set('image', await shrink(photo), 'inspection.jpg')
  const r = await api<AnalysisResult>('/api/ai/analyze', { method: 'POST', body: form })
  return {
    buildingId,
    source: r.source,
    findings: (Object.keys(OBS_LABEL) as ObsKey[]).map((k) => ({
      key: k,
      label: OBS_LABEL[k],
      status: r.observations[k].status,
      detail: `${OBS_TEXT[r.observations[k].status]} · ${r.observations[k].evidence}`,
    })),
    summary: r.draftJournal,
    suggestedStage: r.suggestedStage,
    recommendedAction: r.recommendedAction,
    readAt: new Date().toISOString(),
  }
}

/** 담당자가 위해 단계를 확정한다. stage null = 이상 없음 */
export async function confirmInspection(buildingId: string, stage: HazardStage, journal: string): Promise<Building> {
  const r = await api<InspectionResponse>('/api/inspections', {
    method: 'POST',
    ...json({ siteId: buildingId, confirmedStage: stage, journal }),
  })
  pendingPhotos.delete(buildingId)
  return toBuilding(r.site)
}

/** 조치 완료: 초록, 다음 점검은 6개월 뒤 */
export async function completeAction(buildingId: string, note: string, photo?: File): Promise<Building> {
  const form = new FormData()
  form.set('siteId', buildingId)
  form.set('note', note)
  if (photo) form.set('completionImage', await shrink(photo), 'action.jpg')
  const r = await api<ActionResponse>('/api/actions', { method: 'POST', body: form })
  return toBuilding(r.site)
}

// ───────── 순찰대 ─────────

export async function getPatrolScreenshots(): Promise<PatrolScreenshot[]> {
  return MOCK_PATROL_SCREENSHOTS
}
