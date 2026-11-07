/**
 * SOS 긴급도 그라데이션 설정.
 * 점수 구간과 색상은 아직 확정되지 않았습니다. 확정되면 `SOS_SCALE`만 채우면
 * 지도 마커와 범례가 함께 반영되도록 분리해 두었습니다.
 */
export interface SosBand {
  label: string
  min: number
  max: number
  color: string
}

export const SOS_SCALE: { bands: SosBand[] | null } = {
  bands: null,
}

export const SOS_UNDEFINED_COLOR = 'oklch(0.55 0.2 262)'

export function getSosColor(score: number | null): string {
  const bands = SOS_SCALE.bands
  if (!bands || score === null) return SOS_UNDEFINED_COLOR
  return bands.find((b) => score >= b.min && score <= b.max)?.color ?? SOS_UNDEFINED_COLOR
}

export const isSosScaleDefined = () => SOS_SCALE.bands !== null
