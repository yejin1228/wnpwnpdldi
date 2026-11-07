'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { CircleMarker, MapContainer, Rectangle, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import { ANSAN_CENTER } from '@/lib/mock/data'

/** 250m 격자 크기 (위경도 근사값) */
const GRID_LAT = 0.00225
const GRID_LNG = 0.0028

export function gridBounds(lat: number, lng: number): LatLngBoundsExpression {
  const la = Math.floor(lat / GRID_LAT) * GRID_LAT
  const ln = Math.floor(lng / GRID_LNG) * GRID_LNG
  return [
    [la, ln],
    [la + GRID_LAT, ln + GRID_LNG],
  ]
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

function Recenter({ point }: { point: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.flyTo(point, Math.max(map.getZoom(), 16), { duration: 0.5 })
  }, [point, map])
  return null
}

interface ZoneMapProps {
  point: [number, number] | null
  onPick: (lat: number, lng: number) => void
}

export default function ZoneMap({ point, onPick }: ZoneMapProps) {
  return (
    <MapContainer
      center={ANSAN_CENTER}
      zoom={14}
      className="size-full"
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <Recenter point={point} />
      {point && (
        <>
          <Rectangle
            bounds={gridBounds(point[0], point[1])}
            pathOptions={{ color: 'oklch(0.55 0.2 262)', weight: 2, dashArray: '6 4', fillOpacity: 0.12 }}
          />
          <CircleMarker
            center={point}
            radius={8}
            pathOptions={{ color: '#fff', weight: 3, fillColor: 'oklch(0.29 0.08 262)', fillOpacity: 1 }}
          />
        </>
      )}
    </MapContainer>
  )
}
