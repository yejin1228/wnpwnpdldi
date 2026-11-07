import type {
  AdminSummary,
  AiReading,
  Building,
  CitizenReport,
  PatrolScreenshot,
} from '../types'

export const ANSAN_CENTER: [number, number] = [37.3219, 126.8309]

export const MOCK_DONGS = [
  { name: '단원구 고잔동', lat: 37.3162, lng: 126.8303 },
  { name: '단원구 와동', lat: 37.3356, lng: 126.8167 },
  { name: '단원구 원곡동', lat: 37.3299, lng: 126.7952 },
  { name: '단원구 선부동', lat: 37.3392, lng: 126.8069 },
  { name: '상록구 본오동', lat: 37.2979, lng: 126.8662 },
  { name: '상록구 사동', lat: 37.2928, lng: 126.8461 },
  { name: '상록구 월피동', lat: 37.3237, lng: 126.8533 },
  { name: '상록구 부곡동', lat: 37.3346, lng: 126.8600 },
]

export const MOCK_SUMMARY: AdminSummary = {
  regularTargets: 144,
  newReports: 7,
  highRisk: null,
  scheduledThisWeek: 12,
  completionRate: 38,
}

export const MOCK_BUILDINGS: Building[] = [
  { id: 'B-001', address: '단원구 고잔동 123-4', dong: '단원구 고잔동', lat: 37.3171, lng: 126.8288, sosScore: 82, inspectionStatus: 'pending', lastInspectedAt: null, reportCount: 3, builtYear: 1984, structure: '조적조 2층' },
  { id: 'B-002', address: '단원구 와동 45-12', dong: '단원구 와동', lat: 37.3361, lng: 126.8182, sosScore: 67, inspectionStatus: 'scheduled', lastInspectedAt: '2026-05-14', reportCount: 1, builtYear: 1979, structure: '목조 1층' },
  { id: 'B-003', address: '단원구 원곡동 801-3', dong: '단원구 원곡동', lat: 37.3305, lng: 126.7968, sosScore: 54, inspectionStatus: 'inspected', lastInspectedAt: '2026-07-02', reportCount: 0, builtYear: 1990, structure: '철근콘크리트 3층' },
  { id: 'B-004', address: '단원구 선부동 1072-8', dong: '단원구 선부동', lat: 37.3401, lng: 126.8051, sosScore: 71, inspectionStatus: 'pending', lastInspectedAt: '2026-02-20', reportCount: 2, builtYear: 1982, structure: '조적조 1층' },
  { id: 'B-005', address: '상록구 본오동 877-15', dong: '상록구 본오동', lat: 37.2988, lng: 126.8641, sosScore: 45, inspectionStatus: 'scheduled', lastInspectedAt: '2026-04-11', reportCount: 0, builtYear: 1995, structure: '철근콘크리트 2층' },
  { id: 'B-006', address: '상록구 사동 1231-2', dong: '상록구 사동', lat: 37.2921, lng: 126.8478, sosScore: 38, inspectionStatus: 'inspected', lastInspectedAt: '2026-06-28', reportCount: 0, builtYear: 1998, structure: '철근콘크리트 3층' },
  { id: 'B-007', address: '상록구 월피동 401-7', dong: '상록구 월피동', lat: 37.3244, lng: 126.8519, sosScore: 76, inspectionStatus: 'pending', lastInspectedAt: null, reportCount: 4, builtYear: 1977, structure: '목조 1층' },
  { id: 'B-008', address: '상록구 부곡동 132-9', dong: '상록구 부곡동', lat: 37.3338, lng: 126.8617, sosScore: null, inspectionStatus: 'pending', lastInspectedAt: null, reportCount: 1, builtYear: 1988, structure: '조적조 2층' },
  { id: 'B-009', address: '단원구 고잔동 540-1', dong: '단원구 고잔동', lat: 37.3143, lng: 126.8331, sosScore: 59, inspectionStatus: 'scheduled', lastInspectedAt: '2026-03-08', reportCount: 1, builtYear: 1986, structure: '조적조 2층' },
  { id: 'B-010', address: '단원구 와동 768-4', dong: '단원구 와동', lat: 37.3337, lng: 126.8141, sosScore: 49, inspectionStatus: 'inspected', lastInspectedAt: '2026-07-19', reportCount: 0, builtYear: 1992, structure: '철근콘크리트 2층' },
  { id: 'B-011', address: '상록구 본오동 1015-6', dong: '상록구 본오동', lat: 37.2962, lng: 126.8688, sosScore: 63, inspectionStatus: 'pending', lastInspectedAt: '2026-01-30', reportCount: 2, builtYear: 1981, structure: '조적조 1층' },
  { id: 'B-012', address: '단원구 원곡동 935-11', dong: '단원구 원곡동', lat: 37.3281, lng: 126.7931, sosScore: 72, inspectionStatus: 'pending', lastInspectedAt: null, reportCount: 3, builtYear: 1980, structure: '목조 2층' },
]

export const MOCK_REPORTS: CitizenReport[] = [
  { id: 'R-2026-0412', buildingId: 'B-001', category: 'collapse', title: '외벽에 큰 균열이 생겼어요', createdAt: '2026-11-06', photoCount: 2 },
  { id: 'R-2026-0398', buildingId: 'B-001', category: 'intrusion', title: '밤에 사람이 드나드는 것 같아요', createdAt: '2026-11-02', photoCount: 0 },
  { id: 'R-2026-0371', buildingId: 'B-001', category: 'garbage', title: '대문 앞 쓰레기 방치', createdAt: '2026-10-28', photoCount: 1 },
  { id: 'R-2026-0405', buildingId: 'B-002', category: 'pest', title: '악취와 해충이 심합니다', createdAt: '2026-11-04', photoCount: 1 },
  { id: 'R-2026-0390', buildingId: 'B-004', category: 'fire', title: '전선이 늘어져 있어요', createdAt: '2026-11-01', photoCount: 2 },
  { id: 'R-2026-0366', buildingId: 'B-004', category: 'collapse', title: '지붕 일부가 내려앉았어요', createdAt: '2026-10-25', photoCount: 3 },
  { id: 'R-2026-0410', buildingId: 'B-007', category: 'collapse', title: '담장이 기울어져 있습니다', createdAt: '2026-11-05', photoCount: 2 },
  { id: 'R-2026-0402', buildingId: 'B-007', category: 'garbage', title: '마당에 폐기물이 쌓여 있어요', createdAt: '2026-11-03', photoCount: 1 },
  { id: 'R-2026-0384', buildingId: 'B-007', category: 'intrusion', title: '창문이 깨져 열려 있어요', createdAt: '2026-10-30', photoCount: 1 },
  { id: 'R-2026-0359', buildingId: 'B-007', category: 'etc', title: '고양이가 갇혀 있는 것 같아요', createdAt: '2026-10-21', photoCount: 0 },
  { id: 'R-2026-0408', buildingId: 'B-008', category: 'fire', title: '가스통이 방치되어 있습니다', createdAt: '2026-11-05', photoCount: 1 },
  { id: 'R-2026-0395', buildingId: 'B-009', category: 'garbage', title: '쓰레기 무단투기', createdAt: '2026-11-02', photoCount: 1 },
  { id: 'R-2026-0400', buildingId: 'B-011', category: 'collapse', title: '처마가 떨어질 것 같아요', createdAt: '2026-11-03', photoCount: 2 },
  { id: 'R-2026-0377', buildingId: 'B-011', category: 'pest', title: '쥐가 자주 보여요', createdAt: '2026-10-29', photoCount: 0 },
  { id: 'R-2026-0411', buildingId: 'B-012', category: 'intrusion', title: '출입문이 부서져 있어요', createdAt: '2026-11-06', photoCount: 2 },
  { id: 'R-2026-0393', buildingId: 'B-012', category: 'collapse', title: '외벽 벽돌이 떨어져요', createdAt: '2026-11-01', photoCount: 1 },
  { id: 'R-2026-0380', buildingId: 'B-012', category: 'garbage', title: '폐가구가 쌓여 있습니다', createdAt: '2026-10-29', photoCount: 1 },
]

/** 백엔드 AI 판독 응답 예시 (프론트는 표시만 담당) */
export const MOCK_AI_READING = (buildingId: string): AiReading => ({
  buildingId,
  summary: '외벽 균열과 지붕 처짐이 관찰됩니다. 담당자 확인이 필요합니다.',
  findings: [
    { label: '외벽', detail: '수직 균열 2개소 감지' },
    { label: '지붕', detail: '일부 처짐 및 기와 탈락 의심' },
    { label: '출입부', detail: '출입문 파손, 개방 상태' },
  ],
  readAt: new Date().toISOString(),
})

/** 백엔드 점수 재산출 응답 예시 (프론트는 계산하지 않음) */
export const MOCK_RECALCULATED_SCORE: Record<string, number> = {
  'B-008': 64,
}

export const MOCK_PATROL_SCREENSHOTS: PatrolScreenshot[] = [
  { id: 'p1', title: '순찰 경로', caption: '배정된 구역의 순찰 경로를 확인하는 화면', src: null },
  { id: 'p2', title: '현장 체크', caption: '현장에서 점검 항목을 확인하는 화면', src: null },
  { id: 'p3', title: '결과 전송', caption: '순찰 결과를 담당자에게 전송하는 화면', src: null },
]
