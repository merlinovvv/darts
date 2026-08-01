import * as React from 'react'

const CX = 60
const CY = 60
const SECTORS = 20
const SECTOR_ANGLE = 360 / SECTORS

/** Пропорции близки к реальной мишени (номерное кольцо + double/triple/bull). */
const R = {
  numberOuter: 58,
  doubleOuter: 47,
  doubleInner: 43.5,
  tripleOuter: 28.5,
  tripleInner: 25,
  bullOuter: 7.2,
  bullInner: 4,
}

function polar(radius: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  }
}

function arcPath(
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const startOuter = polar(outerR, startDeg)
  const endOuter = polar(outerR, endDeg)
  const startInner = polar(innerR, endDeg)
  const endInner = polar(innerR, startDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

function ringPath(innerR: number, outerR: number): string {
  return [
    `M ${CX} ${CY - outerR}`,
    `A ${outerR} ${outerR} 0 1 1 ${CX - 0.01} ${CY - outerR}`,
    `M ${CX} ${CY - innerR}`,
    `A ${innerR} ${innerR} 0 1 0 ${CX + 0.01} ${CY - innerR}`,
  ].join(' ')
}

/**
 * Декоративная мишень: сектора, rings и spider —
 * читается как доска, а не как плоский wireframe.
 */
export function DartboardMark(props: React.SVGProps<SVGSVGElement>) {
  const half = SECTOR_ANGLE / 2

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* Номерное кольцо */}
      <path
        d={ringPath(R.doubleOuter, R.numberOuter)}
        fill="currentColor"
        fillOpacity={0.22}
      />

      {Array.from({ length: SECTORS }, (_, index) => {
        const start = index * SECTOR_ANGLE - half
        const end = start + SECTOR_ANGLE
        const isDark = index % 2 === 0
        const baseOpacity = isDark ? 0.28 : 0.1
        const accentOpacity = isDark ? 0.42 : 0.2

        return (
          <g key={index}>
            <path
              d={arcPath(R.tripleOuter, R.doubleOuter, start, end)}
              fill="currentColor"
              fillOpacity={baseOpacity}
            />
            <path
              d={arcPath(R.tripleInner, R.tripleOuter, start, end)}
              fill="currentColor"
              fillOpacity={accentOpacity}
            />
            <path
              d={arcPath(R.bullOuter, R.tripleInner, start, end)}
              fill="currentColor"
              fillOpacity={baseOpacity}
            />
            <path
              d={arcPath(R.doubleInner, R.doubleOuter, start, end)}
              fill="currentColor"
              fillOpacity={accentOpacity}
            />
          </g>
        )
      })}

      {/* Bull */}
      <circle
        cx={CX}
        cy={CY}
        r={R.bullOuter}
        fill="currentColor"
        fillOpacity={0.22}
      />
      <circle
        cx={CX}
        cy={CY}
        r={R.bullInner}
        fill="currentColor"
        fillOpacity={0.4}
      />

      {/* Spider — тонкие проволоки поверх */}
      <g
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={0.55}
      >
        <circle cx={CX} cy={CY} r={R.numberOuter} />
        <circle cx={CX} cy={CY} r={R.doubleOuter} />
        <circle cx={CX} cy={CY} r={R.doubleInner} />
        <circle cx={CX} cy={CY} r={R.tripleOuter} />
        <circle cx={CX} cy={CY} r={R.tripleInner} />
        <circle cx={CX} cy={CY} r={R.bullOuter} />
        <circle cx={CX} cy={CY} r={R.bullInner} />
        {Array.from({ length: SECTORS }, (_, index) => {
          const angle = index * SECTOR_ANGLE - half
          const outer = polar(R.doubleOuter, angle)
          const inner = polar(R.bullOuter, angle)

          return (
            <line
              key={angle}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
            />
          )
        })}
      </g>
    </svg>
  )
}
