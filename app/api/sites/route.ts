import { route } from '@/lib/server/http'
import { getSites, withStore } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/** 130곳, 색, D-day, KPI 요약, 시민 제보 구역 */
export const GET = route(async () => Response.json(await withStore(false, getSites)))
