'use client'

import { useCallback } from 'react'
import { useSWRConfig } from 'swr'

/** 제보 연결·점검·조치 뒤 관리자 화면의 서버 데이터를 모두 다시 받는다 */
export function useRefreshAdmin() {
  const { mutate } = useSWRConfig()
  return useCallback(
    () =>
      Promise.all([
        mutate('buildings'),
        mutate('admin-summary'),
        mutate('zones'),
        mutate('report-list'),
        mutate((key) => Array.isArray(key) && key[0] === 'reports'),
      ]),
    [mutate],
  )
}
