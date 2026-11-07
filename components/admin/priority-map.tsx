'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Rectangle, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { ZoneSummary } from '@/lib/contracts'
import { dDayLabel } from '@/lib/labels'
import { ANSAN_CENTER } from '@/lib/mock/data'
import { SOS_STYLE, ZONE_COLOR } from '@/lib/sos'
import type { Building } from '@/lib/types'

/** 단계가 높을수록 크게: 초록 14 · 주황 16 · 빨강 20 · 진한 빨강 26 (px) */
const MARKER_SIZE = [14, 16, 20, 26]

function markerIcon(b: Building, selected: boolean) {
  const base = MARKER_SIZE[b.sos.level] ?? 14
  const size = selected ? base + 6 : base
  const { color, ink } = SOS_STYLE[b.sos.color]
  const isDarkRed = b.sos.color === 'DARK_RED'
  const border = isDarkRed || selected ? 3 : 2
  // 선택 표시는 밝은 파랑 고리. 진한 빨강과 섞여 검은 과녁처럼 보이지 않게 한다.
  const ring = selected
    ? '0 0 0 3px #2563eb,0 0 0 6px rgba(37,99,235,.25)'
    : `0 0 0 1px rgba(15,23,42,.35)`
  const glyph = isDarkRed
    ? `<span style="font:700 ${Math.round(size * 0.5)}px/1 system-ui,sans-serif;color:${ink}">1</span>`
    : ''
  const dot = `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${border}px solid #fff;box-shadow:${ring},0 2px 6px rgba(15,23,42,.3);box-sizing:border-box">${glyph}</span>`
  // 연결된 제보의 현장조사 기한(D-day) 배지. 점 오른쪽 위에 붙인다.
  const badge =
    b.dDay != null
      ? `<span style="position:absolute;left:${size - 3}px;top:-12px;white-space:nowrap;background:${ZONE_COLOR};color:#fff;font:700 11px/1 system-ui,sans-serif;padding:3px 5px;border-radius:9999px;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(15,23,42,.35)">${dDayLabel(b.dDay)}</span>`
      : ''
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="position:relative;display:block;width:${size}px;height:${size}px">${dot}${badge}</span>`,
  })
}

/** 지도 칸 크기가 바뀌면 타일을 다시 채운다. 안 하면 패널을 열거나 창을 줄일 때 회색 빈 띠가 남는다. */
function InvalidateOnResize() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [map])
  return null
}

function FlyTo({ target }: { target: Building | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 15), { duration: 0.5 })
  }, [target, map])
  return null
}

interface PriorityMapProps {
  buildings: Building[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** 30일 안 시민 제보가 있는 250m 구역 */
  zones: ZoneSummary[]
  focusZoneId: string | null
  onZoneSelect: (zoneId: string) => void
}

export default function PriorityMap({ buildings, selectedId, onSelect, zones, focusZoneId, onZoneSelect }: PriorityMapProps) {
  const selected = useMemo(() => buildings.find((b) => b.id === selectedId) ?? null, [buildings, selectedId])

  return (
    <MapContainer center={ANSAN_CENTER} zoom={13} className="size-full" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <InvalidateOnResize />
      <FlyTo target={selected} />
      {zones.map((z) => (
        <Rectangle
          key={z.id}
          bounds={z.bounds}
          pathOptions={{
            color: ZONE_COLOR,
            weight: z.id === focusZoneId ? 4 : 2,
            dashArray: '6 4',
            fillColor: ZONE_COLOR,
            fillOpacity: z.open > 0 ? 0.3 : 0.15,
          }}
          eventHandlers={{ click: () => onZoneSelect(z.id) }}
        >
          <Tooltip direction="top" sticky>
            시민 제보 구역 · {z.label} · 제보 {z.reports}건{z.open > 0 ? ` (연결 전 ${z.open})` : ''} · 기한 {z.nearestDueAt}
          </Tooltip>
        </Rectangle>
      ))}
      {buildings.map((b) => (
        <Marker
          key={b.id}
          position={[b.lat, b.lng]}
          icon={markerIcon(b, b.id === selectedId)}
          zIndexOffset={b.id === selectedId ? 1000 : b.sos.level * 100}
          eventHandlers={{ click: () => onSelect(b.id) }}
          keyboard
          title={`${b.address} SOS ${SOS_STYLE[b.sos.color].label}`}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            {b.address} · {SOS_STYLE[b.sos.color].label}
            {b.units > 1 ? ` · ${b.units}호` : ''}
            {b.dDay != null ? ` · 제보 현장조사 ${dDayLabel(b.dDay)}` : ''}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
