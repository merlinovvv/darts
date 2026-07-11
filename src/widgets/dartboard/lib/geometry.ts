const TAU = Math.PI * 2
const DEG = Math.PI / 180

export interface Point {
  x: number
  y: number
}

export interface SectorPath {
  id: string
  d: string
  sector: number | 25 | 50 | 'miss'
  multiplier: 'single' | 'double' | 'triple' | 'miss'
  fill: string
  stroke?: string
  isHitTarget?: boolean
}

export const BOARD_SIZE = 400
export const CENTER = BOARD_SIZE / 2

const R = {
  missOuter: 200,
  doubleOuter: 170,
  doubleInner: 160,
  tripleOuter: 105,
  tripleInner: 95,
  bullOuter: 26,
  bullInner: 15,
}

const HIT_PADDING = {
  double: 2,
  triple: 2,
  bull: 6,
  default: 2,
}

const MISS_HIT_PADDING = {
  outer: 4,
  inner: 3,
}

function polar(cx: number, cy: number, radius: number, angleDeg: number): Point {
  const angle = (angleDeg - 90) * DEG
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

function arcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const startOuter = polar(cx, cy, outerR, startDeg)
  const endOuter = polar(cx, cy, outerR, endDeg)
  const startInner = polar(cx, cy, innerR, endDeg)
  const endInner = polar(cx, cy, innerR, startDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

function ringPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
): string {
  return [
    `M ${cx} ${cy - outerR}`,
    `A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR}`,
    `M ${cx} ${cy - innerR}`,
    `A ${innerR} ${innerR} 0 1 0 ${cx + 0.01} ${cy - innerR}`,
  ].join(' ')
}

function missRingPath(innerR: number, outerR: number): string {
  return ringPath(CENTER, CENTER, innerR, outerR)
}

function paddedArcPath(
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
  padding: number,
): string {
  return arcPath(
    CENTER,
    CENTER,
    Math.max(innerR - padding, 0),
    outerR + padding,
    startDeg,
    endDeg,
  )
}

function buildSectorPaths(
  sectorOrder: number[],
  options: { hitsOnly: boolean },
): SectorPath[] {
  const paths: SectorPath[] = []
  const sectorAngle = 360 / sectorOrder.length
  const half = sectorAngle / 2

  sectorOrder.forEach((sector, index) => {
    const start = index * sectorAngle - half
    const end = start + sectorAngle
    const isEven = index % 2 === 0
    const baseFill = isEven ? '#111111' : '#f5f5f5'
    const accentFill = isEven ? '#b91c1c' : '#15803d'

    if (!options.hitsOnly) {
      paths.push({
        id: `single-outer-${sector}`,
        d: arcPath(CENTER, CENTER, R.tripleOuter, R.doubleOuter, start, end),
        sector,
        multiplier: 'single',
        fill: baseFill,
      })

      paths.push({
        id: `triple-${sector}`,
        d: arcPath(CENTER, CENTER, R.tripleInner, R.tripleOuter, start, end),
        sector,
        multiplier: 'triple',
        fill: accentFill,
      })

      paths.push({
        id: `single-inner-${sector}`,
        d: arcPath(CENTER, CENTER, R.bullOuter, R.tripleInner, start, end),
        sector,
        multiplier: 'single',
        fill: baseFill,
      })

      paths.push({
        id: `double-${sector}`,
        d: arcPath(CENTER, CENTER, R.doubleInner, R.doubleOuter, start, end),
        sector,
        multiplier: 'double',
        fill: accentFill,
      })
    }

    paths.push({
      id: `hit-single-outer-${sector}`,
      d: paddedArcPath(
        R.tripleOuter,
        R.doubleOuter,
        start,
        end,
        HIT_PADDING.default,
      ),
      sector,
      multiplier: 'single',
      fill: 'transparent',
      isHitTarget: true,
    })

    paths.push({
      id: `hit-single-inner-${sector}`,
      d: paddedArcPath(
        R.bullOuter,
        R.tripleInner,
        start,
        end,
        HIT_PADDING.default,
      ),
      sector,
      multiplier: 'single',
      fill: 'transparent',
      isHitTarget: true,
    })

    paths.push({
      id: `hit-double-${sector}`,
      d: paddedArcPath(
        R.doubleInner,
        R.doubleOuter,
        start,
        end,
        HIT_PADDING.double,
      ),
      sector,
      multiplier: 'double',
      fill: 'transparent',
      isHitTarget: true,
    })

    paths.push({
      id: `hit-triple-${sector}`,
      d: paddedArcPath(
        R.tripleInner,
        R.tripleOuter,
        start,
        end,
        HIT_PADDING.triple,
      ),
      sector,
      multiplier: 'triple',
      fill: 'transparent',
      isHitTarget: true,
    })
  })

  if (!options.hitsOnly) {
    paths.push({
      id: 'bull-25',
      d: ringPath(CENTER, CENTER, R.bullInner, R.bullOuter),
      sector: 25,
      multiplier: 'single',
      fill: '#15803d',
    })

    paths.push({
      id: 'bull-50',
      d: `M ${CENTER} ${CENTER} m 0 -${R.bullInner} a ${R.bullInner} ${R.bullInner} 0 1 1 0 ${R.bullInner * 2} a ${R.bullInner} ${R.bullInner} 0 1 1 0 -${R.bullInner * 2}`,
      sector: 50,
      multiplier: 'single',
      fill: '#b91c1c',
    })
  }

  paths.push({
    id: 'hit-bull-25',
    d: ringPath(CENTER, CENTER, R.bullInner - 2, R.bullOuter + HIT_PADDING.bull),
    sector: 25,
    multiplier: 'single',
    fill: 'transparent',
    isHitTarget: true,
  })

  if (!options.hitsOnly) {
    paths.push({
      id: 'miss',
      d: missRingPath(R.doubleOuter, R.missOuter),
      sector: 'miss',
      multiplier: 'miss',
      fill: '#e5e5e5',
    })
  }

  paths.push({
    id: 'hit-bull-50',
    d: `M ${CENTER} ${CENTER} m 0 -${R.bullInner + HIT_PADDING.bull} a ${R.bullInner + HIT_PADDING.bull} ${R.bullInner + HIT_PADDING.bull} 0 1 1 0 ${(R.bullInner + HIT_PADDING.bull) * 2} a ${R.bullInner + HIT_PADDING.bull} ${R.bullInner + HIT_PADDING.bull} 0 1 1 0 -${(R.bullInner + HIT_PADDING.bull) * 2}`,
    sector: 50,
    multiplier: 'single',
    fill: 'transparent',
    isHitTarget: true,
  })

  paths.push({
    id: 'hit-miss',
    d: missRingPath(
      R.doubleOuter - MISS_HIT_PADDING.inner,
      R.missOuter + MISS_HIT_PADDING.outer,
    ),
    sector: 'miss',
    multiplier: 'miss',
    fill: 'transparent',
    isHitTarget: true,
  })

  return paths
}

export function buildDartboardVisualPaths(sectorOrder: number[]): SectorPath[] {
  return buildSectorPaths(sectorOrder, { hitsOnly: false }).filter(
    (path) => !path.isHitTarget,
  )
}

export function buildDartboardHitPaths(sectorOrder: number[]): SectorPath[] {
  return buildSectorPaths(sectorOrder, { hitsOnly: true }).filter(
    (path) => path.isHitTarget,
  )
}

const WEDGE_HIT_PADDING = 2

export function buildWedgeHitPaths(sectorOrder: number[]): SectorPath[] {
  const paths: SectorPath[] = []
  const sectorAngle = 360 / sectorOrder.length
  const half = sectorAngle / 2

  sectorOrder.forEach((sector, index) => {
    const start = index * sectorAngle - half
    const end = start + sectorAngle

    paths.push({
      id: `wedge-${sector}`,
      d: paddedArcPath(
        R.bullOuter,
        R.doubleOuter,
        start,
        end,
        WEDGE_HIT_PADDING,
      ),
      sector,
      multiplier: 'single',
      fill: 'transparent',
      isHitTarget: true,
    })
  })

  const bullRadius = R.bullOuter + HIT_PADDING.bull
  paths.push({
    id: 'wedge-bull',
    d: `M ${CENTER} ${CENTER} m 0 -${bullRadius} a ${bullRadius} ${bullRadius} 0 1 1 0 ${bullRadius * 2} a ${bullRadius} ${bullRadius} 0 1 1 0 -${bullRadius * 2}`,
    sector: 25,
    multiplier: 'single',
    fill: 'transparent',
    isHitTarget: true,
  })

  paths.push({
    id: 'wedge-miss',
    d: missRingPath(
      R.doubleOuter - MISS_HIT_PADDING.inner,
      R.missOuter + MISS_HIT_PADDING.outer,
    ),
    sector: 'miss',
    multiplier: 'miss',
    fill: 'transparent',
    isHitTarget: true,
  })

  return paths
}

export function getWedgeHighlightPath(
  sectorOrder: number[],
  selection: { kind: 'sector'; sector: number } | { kind: 'bull' } | null,
): string | undefined {
  if (!selection) {
    return undefined
  }

  if (selection.kind === 'bull') {
    return `M ${CENTER} ${CENTER} m 0 -${R.bullOuter} a ${R.bullOuter} ${R.bullOuter} 0 1 1 0 ${R.bullOuter * 2} a ${R.bullOuter} ${R.bullOuter} 0 1 1 0 -${R.bullOuter * 2}`
  }

  const index = sectorOrder.indexOf(selection.sector)
  if (index === -1) {
    return undefined
  }

  const sectorAngle = 360 / sectorOrder.length
  const half = sectorAngle / 2
  const start = index * sectorAngle - half
  const end = start + sectorAngle

  return arcPath(CENTER, CENTER, R.bullOuter, R.doubleOuter, start, end)
}

export function buildDartboardPaths(sectorOrder: number[]): SectorPath[] {
  return buildSectorPaths(sectorOrder, { hitsOnly: false }).filter(
    (path) => !path.isHitTarget,
  )
}

export function getHighlightPath(
  sectorOrder: number[],
  hit: { sector: SectorPath['sector']; multiplier: SectorPath['multiplier'] },
): SectorPath | undefined {
  const allPaths = [
    ...buildDartboardVisualPaths(sectorOrder),
    ...buildDartboardHitPaths(sectorOrder),
  ]

  return allPaths.find(
    (path) => path.sector === hit.sector && path.multiplier === hit.multiplier,
  )
}

export function getSectorLabelPosition(
  sector: number,
  sectorOrder: number[],
): Point {
  const index = sectorOrder.indexOf(sector)
  const sectorAngle = 360 / sectorOrder.length
  const angle = index * sectorAngle
  return polar(CENTER, CENTER, 132, angle)
}

export function isLightSector(sector: number, sectorOrder: number[]): boolean {
  const index = sectorOrder.indexOf(sector)
  return index % 2 !== 0
}

export { TAU, DEG }
