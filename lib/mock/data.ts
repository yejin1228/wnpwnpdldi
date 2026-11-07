import type { AiReading, CitizenReport, PatrolScreenshot } from '../types'

export const ANSAN_CENTER: [number, number] = [37.3219, 126.8309]

/** 시민 제보 화면의 구역 이름용(역지오코딩 대체) */
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

/**
 * 시연용으로 미리 넣은 제보(가상). buildingId는 data/houses.json의 실제 방문지 id.
 * 제보는 지도 색을 바꾸지 않는다(docs/개발명세.md 3.4).
 */
export const MOCK_REPORTS: CitizenReport[] = [
  { id: 'R-2026-0412', buildingId: '와동-102-**', category: 'intrusion', title: '밤에 사람이 드나드는 것 같아요', createdAt: '2026-11-06', photoCount: 2 },
  { id: 'R-2026-0398', buildingId: '와동-102-**', category: 'garbage', title: '공용 계단에 쓰레기가 쌓여 있어요', createdAt: '2026-10-27', photoCount: 1 },
  { id: 'R-2026-0405', buildingId: '선부동-1104-1**', category: 'collapse', title: '외벽에 금이 갔어요', createdAt: '2026-11-04', photoCount: 1 },
  { id: 'R-2026-0390', buildingId: '부곡동-715-**', category: 'fire', title: '전선이 늘어져 있어요', createdAt: '2026-11-01', photoCount: 2 },
  { id: 'R-2026-0384', buildingId: '일동-614-**', category: 'pest', title: '악취와 해충이 심합니다', createdAt: '2026-10-20', photoCount: 0 },
]

/** AI 판독 응답 예시(다음 단계에서 Gemini 연결로 교체) */
export const MOCK_AI_READING = (buildingId: string): AiReading => ({
  buildingId,
  summary: '출입문이 열려 있고 창호 1곳이 파손되어 무단출입 우려가 있습니다.',
  findings: [
    { label: '보안', detail: '출입문 개방, 창호 파손 (1단계 후보)' },
    { label: '위생', detail: '공용부 쓰레기 적치' },
    { label: '붕괴', detail: '사진으로 확인 불가' },
  ],
  readAt: new Date().toISOString(),
})

export const MOCK_PATROL_SCREENSHOTS: PatrolScreenshot[] = [
  { id: 'p1', title: '순찰 경로', caption: '배정된 구역의 순찰 경로를 확인하는 화면', src: null },
  { id: 'p2', title: '현장 체크', caption: '현장에서 점검 항목을 확인하는 화면', src: null },
  { id: 'p3', title: '결과 전송', caption: '순찰 결과를 담당자에게 전송하는 화면', src: null },
]
