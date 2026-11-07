/**
 * 시민 제보 250m 격자(위경도 근사값).
 * 시민 화면(구역 미리보기)과 서버(제보 저장·후보 빈집 찾기)가 같은 격자를 쓴다.
 */
export const GRID_LAT = 0.00225
export const GRID_LNG = 0.0028

export type Bounds = [[number, number], [number, number]]

export interface GridCell {
  id: string
  row: number
  col: number
  bounds: Bounds
}

export function cellBounds(row: number, col: number): Bounds {
  return [
    [row * GRID_LAT, col * GRID_LNG],
    [(row + 1) * GRID_LAT, (col + 1) * GRID_LNG],
  ]
}

export function gridCell(lat: number, lng: number): GridCell {
  const row = Math.floor(lat / GRID_LAT)
  const col = Math.floor(lng / GRID_LNG)
  return { id: `Z-${row}-${col}`, row, col, bounds: cellBounds(row, col) }
}

export function gridBounds(lat: number, lng: number): Bounds {
  return gridCell(lat, lng).bounds
}
