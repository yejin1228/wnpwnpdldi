import { SOS_SCALE, SOS_UNDEFINED_COLOR } from '@/lib/sos-scale'

export function SosLegend() {
  const bands = SOS_SCALE.bands

  return (
    <div className="w-60 rounded-xl border bg-background/95 p-3 text-xs shadow-sm backdrop-blur">
      <p className="font-semibold text-primary">범례 · SOS 긴급도</p>
      {bands ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {bands.map((b) => (
            <li key={b.label} className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ background: b.color }} aria-hidden="true" />
              {b.label} ({b.min}–{b.max})
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="mt-2 h-2.5 rounded-full border border-dashed border-muted-foreground/40 bg-muted"
          />
          <div className="mt-1 flex justify-between text-muted-foreground">
            <span>낮음</span>
            <span>높음</span>
          </div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            그라데이션 점수 구간·색상은 확정 전입니다. 현재 마커는 단일 색상으로 표시합니다.
          </p>
          <p className="mt-2 flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ background: SOS_UNDEFINED_COLOR }} aria-hidden="true" />
            건물 (숫자: 백엔드 SOS 점수)
          </p>
        </>
      )}
    </div>
  )
}
