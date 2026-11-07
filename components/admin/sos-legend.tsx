import { SOS_LEGEND, SOS_STYLE, ZONE_COLOR } from '@/lib/sos'

export function SosLegend() {
  return (
    <div className="w-64 rounded-xl border bg-background/95 p-3 text-xs leading-snug shadow-sm">
      <p className="text-sm font-bold text-primary">범례 · SOS 긴급도</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {SOS_LEGEND.map((l) => (
          <li key={l.color} className="flex items-start gap-2">
            <span
              className="mt-0.5 size-3 shrink-0 rounded-full"
              style={{ background: SOS_STYLE[l.color].color }}
              aria-hidden="true"
            />
            <span>
              <b>{SOS_STYLE[l.color].label}</b> · {l.text}
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2">
          <span
            className="mt-0.5 size-3 shrink-0 rounded-sm border-2 border-dashed"
            style={{ borderColor: ZONE_COLOR, background: `${ZONE_COLOR}33` }}
            aria-hidden="true"
          />
          <span>
            <b>보라</b> · 시민 제보 구역(30일 안 현장조사)
          </span>
        </li>
      </ul>
      <p className="mt-2 text-muted-foreground">점수·가중치 없음. 위해 판정과 점검 기한 중 더 나쁜 쪽을 따릅니다.</p>
    </div>
  )
}
