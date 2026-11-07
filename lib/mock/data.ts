import type { PatrolScreenshot } from '../types'

export const ANSAN_CENTER: [number, number] = [37.3219, 126.8309]

export const MOCK_PATROL_SCREENSHOTS: PatrolScreenshot[] = [
  {
    id: 'p1',
    title: '오늘의 순찰 경로',
    caption: '배정 구역의 방문 대상을 긴급도 순으로 지도와 목록에서 확인합니다.',
    src: '/patrol/patrol/patrol_route.png',
  },
  {
    id: 'p2',
    title: '현장 체크',
    caption: '출입 흔적, 창문 파손, 쓰레기 적치 등 점검 항목을 기록하고 현장 사진과 메모를 남깁니다.',
    src: '/patrol/patrol/patrol_check.png',
  },
  {
    id: 'p3',
    title: '순찰 결과 전송',
    caption: '점검 결과와 현장 의견을 정리해 시 담당자에게 보내면 담당자 검토 단계로 넘어갑니다.',
    src: '/patrol/patrol/patrol_result.png',
  },
]
