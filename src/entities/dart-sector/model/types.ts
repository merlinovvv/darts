export type BoardSectorNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export type WedgeSelection =
  | { kind: 'sector'; sector: BoardSectorNumber }
  | { kind: 'bull' }
  | { kind: 'miss' }
export type BullSector = 25 | 50
export type SectorNumber = BoardSectorNumber | BullSector

export type Multiplier = 'single' | 'double' | 'triple' | 'miss'

export interface DartHit {
  sector: SectorNumber | 'miss'
  multiplier: Multiplier
  score: number
}

export const DARTBOARD_ORDER: BoardSectorNumber[] = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
]

export const THROWS_PER_TURN = 3

export function calculateHitScore(
  sector: SectorNumber | 'miss',
  multiplier: Multiplier,
): number {
  if (multiplier === 'miss' || sector === 'miss') {
    return 0
  }

  if (sector === 25 || sector === 50) {
    return sector === 25 ? 25 : 50
  }

  switch (multiplier) {
    case 'single':
      return sector
    case 'double':
      return sector * 2
    case 'triple':
      return sector * 3
    default:
      return 0
  }
}

export function createDartHit(
  sector: SectorNumber | 'miss',
  multiplier: Multiplier,
): DartHit {
  return {
    sector,
    multiplier,
    score: calculateHitScore(sector, multiplier),
  }
}

export function formatDartHit(hit: DartHit): string {
  if (hit.multiplier === 'miss' || hit.sector === 'miss') {
    return 'Мимо'
  }

  if (hit.sector === 25) {
    return 'Bull 25'
  }

  if (hit.sector === 50) {
    return 'Bull 50'
  }

  const prefix =
    hit.multiplier === 'double' ? 'D' : hit.multiplier === 'triple' ? 'T' : 'S'

  return `${prefix}${hit.sector}`
}

export function getMarksFromHit(hit: DartHit): number {
  if (hit.multiplier === 'miss' || hit.sector === 'miss') {
    return 0
  }

  if (hit.sector === 25) {
    return 1
  }

  if (hit.sector === 50) {
    return 2
  }

  switch (hit.multiplier) {
    case 'single':
      return 1
    case 'double':
      return 2
    case 'triple':
      return 3
    default:
      return 0
  }
}
