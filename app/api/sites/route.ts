import { route } from '@/lib/server/http'
import { getSites } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/** 130곳, 색, D-day, KPI 요약, 시민 제보 구역 */
export const GET = route(() => Response.json(getSites()))
