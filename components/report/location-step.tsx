'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { EyeOff, LoaderCircle, LocateFixed, MapPin, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveZone } from '@/lib/api'
import type { ZoneSelection } from '@/lib/types'

const ZoneMap = dynamic(() => import('./zone-map'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-muted" />,
})

interface LocationStepProps {
  zone: ZoneSelection | null
  onZoneChange: (zone: ZoneSelection) => void
  onSubmit: () => void
  submitting: boolean
}

export function LocationStep({ zone, onZoneChange, onSubmit, submitting }: LocationStepProps) {
  const [resolving, setResolving] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const pick = async (lat: number, lng: number) => {
    setResolving(true)
    try {
      onZoneChange(await resolveZone(lat, lng))
    } finally {
      setResolving(false)
    }
  }

  const useCurrentLocation = () => {
    setGeoError(null)
    if (!navigator.geolocation) return setGeoError('이 기기에서는 위치 정보를 사용할 수 없습니다.')
    navigator.geolocation.getCurrentPosition(
      (p) => pick(p.coords.latitude, p.coords.longitude),
      () => setGeoError('현재 위치를 가져오지 못했습니다. 지도를 눌러 선택해 주세요.'),
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative h-[52vh] min-h-72 border-b">
        <ZoneMap point={zone ? [zone.lat, zone.lng] : null} onPick={pick} />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[400] flex justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <EyeOff className="size-3.5" aria-hidden="true" />
            빈집 위치는 지도에 표시되지 않습니다
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useCurrentLocation}
          className="absolute bottom-3 right-3 z-[400] h-9 bg-background shadow-sm"
        >
          <LocateFixed data-icon="inline-start" />
          현재 위치 사용
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        <p className="text-sm text-muted-foreground">지도를 눌러 제보할 위치를 선택하세요.</p>
        {geoError && (
          <p role="alert" className="text-sm text-destructive">
            {geoError}
          </p>
        )}
        <div className="rounded-xl border bg-card p-4" aria-live="polite">
          <span className="text-xs font-medium text-muted-foreground">선택된 위치</span>
          <p className="mt-1 flex items-center gap-2 font-semibold text-primary">
            {resolving ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <MapPin className="size-4 text-brand" aria-hidden="true" />
            )}
            {zone ? `${zone.zoneLabel} · 250m 구역` : '아직 선택하지 않았습니다'}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            상세 위치는 담당자에게만 전달됩니다
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full text-base"
          disabled={!zone || submitting || resolving}
          onClick={onSubmit}
        >
          {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
          {submitting ? '제출 중...' : '제보 제출'}
        </Button>
      </div>
    </div>
  )
}
