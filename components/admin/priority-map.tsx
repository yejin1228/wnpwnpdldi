'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { ANSAN_CENTER } from '@/lib/mock/data'
import { SOS_STYLE } from '@/lib/sos'
import type { Building } from '@/lib/types'

function markerIcon(b: Building, selected: boolean) {
  const size = selected ? 26 : b.sos.level >= 2 ? 18 : 14
  const { color } = SOS_STYLE[b.sos.color]
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${selected ? 4 : 2}px solid #fff;box-shadow:0 0 0 ${selected ? 3 : 1}px ${selected ? 'oklch(0.29 0.08 262)' : 'rgba(15,23,42,.35)'},0 2px 6px rgba(15,23,42,.3)"></span>`,
  })
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
}

export default function PriorityMap({ buildings, selectedId, onSelect }: PriorityMapProps) {
  const selected = useMemo(() => buildings.find((b) => b.id === selectedId) ?? null, [buildings, selectedId])

  return (
    <MapContainer center={ANSAN_CENTER} zoom={13} className="size-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo target={selected} />
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
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
