import { useEffect, useMemo, useState } from 'react'

import {
  type BoardPalette,
  useSelectedBoardTheme,
} from '@/entities/board-theme'
import {
  createDartHit,
  DARTBOARD_ORDER,
  formatDartHit,
  type BoardSectorNumber,
  type DartHit,
  type SectorNumber,
  type WedgeSelection,
} from '@/entities/dart-sector'
import {
  getCellOverlayKey,
  type CellOverlay,
  type OverlayType,
} from '@/entities/game-rules'
import { cn } from '@/shared/lib'

import {
  BOARD_SIZE,
  buildDartboardVisualPaths,
  buildWedgeHitPaths,
  getHighlightPath,
  getSectorLabelPosition,
  getWedgeHighlightPath,
  type SectorPath,
} from '../lib/geometry'

interface DartboardProps {
  onWedgeSelect?: (selection: WedgeSelection) => void
  disabled?: boolean
  className?: string
  lastHit?: DartHit | null
  pendingSelection?: WedgeSelection | null
  cellOverlays?: Record<string, CellOverlay>
  /** Мини-превью без кликов и легенды. */
  preview?: boolean
  /** Переопределение палитры (для карточек выбора доски). */
  palette?: BoardPalette
}

function pathToWedgeSelection(path: SectorPath): WedgeSelection {
  if (path.sector === 'miss') {
    return { kind: 'miss' }
  }

  if (path.id === 'wedge-bull') {
    return { kind: 'bull' }
  }

  return { kind: 'sector', sector: path.sector as BoardSectorNumber }
}

function wedgeSelectionsMatch(
  a: WedgeSelection,
  b: WedgeSelection,
): boolean {
  if (a.kind !== b.kind) {
    return false
  }

  if (a.kind === 'sector' && b.kind === 'sector') {
    return a.sector === b.sector
  }

  return true
}

function getOverlayFill(type: OverlayType): string {
  switch (type) {
    case 'bust':
      return 'rgba(128, 128, 128, 0.88)'
    case 'checkout':
      return 'url(#dartboard-overlay-checkout)'
    case 'cricket-closed-player':
      return 'rgba(22, 163, 74, 0.5)'
    case 'cricket-closed-all':
      return 'rgba(220, 38, 38, 0.55)'
  }
}

function usesStripedOverlay(type: OverlayType): boolean {
  return type === 'checkout'
}

function DartboardOverlayPatterns() {
  return (
    <defs>
      <pattern
        id="dartboard-overlay-checkout"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="8" height="8" fill="transparent" />
        <rect x="0" y="0" width="4" height="8" fill="#16a34a" fillOpacity="0.75" />
      </pattern>
    </defs>
  )
}

function LegendSwatch({ type }: { type: OverlayType }) {
  if (usesStripedOverlay(type)) {
    return (
      <span
        className="h-3 w-3 shrink-0 rounded-sm border"
        style={{
          background:
            'repeating-linear-gradient(45deg, #16a34a 0, #16a34a 2px, transparent 2px, transparent 6px)',
          borderColor: getOverlayStroke(type),
        }}
      />
    )
  }

  return (
    <span
      className="h-3 w-3 shrink-0 rounded-full border"
      style={{
        backgroundColor: getOverlayFill(type),
        borderColor: getOverlayStroke(type),
      }}
    />
  )
}

function getOverlayStroke(type: OverlayType): string {
  switch (type) {
    case 'bust':
      return '#6b7280'
    case 'checkout':
      return '#15803d'
    case 'cricket-closed-player':
      return '#15803d'
    case 'cricket-closed-all':
      return '#991b1b'
  }
}

function DartboardLegend({
  cellOverlays,
}: {
  cellOverlays: Record<string, CellOverlay>
}) {
  const types = new Set(
    Object.values(cellOverlays).map((overlay) => overlay.type),
  )

  if (types.size === 0) {
    return null
  }

  const items: Array<{ type: OverlayType; label: string }> = []

  if (types.has('bust')) {
    items.push({ type: 'bust', label: 'Перебор' })
  }
  if (types.has('checkout')) {
    items.push({ type: 'checkout', label: 'Финиш' })
  }
  if (types.has('cricket-closed-player')) {
    items.push({ type: 'cricket-closed-player', label: 'Закрыт игроком' })
  }
  if (types.has('cricket-closed-all')) {
    items.push({ type: 'cricket-closed-all', label: 'Закрыт всеми' })
  }

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2 px-2">
      {items.map((item) => (
        <div
          key={item.type}
          className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
        >
          <LegendSwatch type={item.type} />
          {item.label}
        </div>
      ))}
    </div>
  )
}

export function Dartboard({
  onWedgeSelect,
  disabled = false,
  className,
  lastHit = null,
  pendingSelection = null,
  cellOverlays = {},
  preview = false,
  palette: paletteOverride,
}: DartboardProps) {
  const selectedTheme = useSelectedBoardTheme()
  const palette = paletteOverride ?? selectedTheme.palette
  const interactive = !preview && Boolean(onWedgeSelect)

  const visualPaths = useMemo(
    () => buildDartboardVisualPaths(DARTBOARD_ORDER, palette),
    [palette],
  )
  const hitPaths = useMemo(() => buildWedgeHitPaths(DARTBOARD_ORDER), [])
  const [pulseHit, setPulseHit] = useState<DartHit | null>(null)
  const [pulseKey, setPulseKey] = useState(0)

  useEffect(() => {
    if (!lastHit || preview) {
      return
    }

    setPulseHit(lastHit)
    setPulseKey((key) => key + 1)
    // Держим подсветку до конца fade-анимации (~900ms).
    const timer = window.setTimeout(() => setPulseHit(null), 900)
    return () => window.clearTimeout(timer)
  }, [lastHit, preview])

  const highlightPath = pulseHit
    ? getHighlightPath(DARTBOARD_ORDER, pulseHit, palette)
    : undefined

  const pendingHighlightPath =
    !preview && pendingSelection
      ? getWedgeHighlightPath(DARTBOARD_ORDER, pendingSelection)
      : undefined

  const handleHit = (path: SectorPath) => {
    if (interactive && !disabled && onWedgeSelect) {
      onWedgeSelect(pathToWedgeSelection(path))
    }
  }

  const wireWidth = preview ? 0.35 : 0.5
  const labelSize = preview ? 'text-[17px]' : 'text-[20px]'

  return (
    <div className={cn('mx-auto w-full max-w-md touch-manipulation', className)}>
      <svg
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label="Дартс-доска"
      >
        {!preview ? <DartboardOverlayPatterns /> : null}
        <g pointerEvents="none">
          {visualPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              fill={path.fill}
              stroke={palette.wire}
              strokeWidth={wireWidth}
            />
          ))}

          {!preview
            ? visualPaths.map((path) => {
                const hit =
                  path.sector === 'miss'
                    ? createDartHit('miss', 'miss')
                    : createDartHit(path.sector as SectorNumber, path.multiplier)
                const overlay =
                  cellOverlays[getCellOverlayKey(hit.sector, hit.multiplier)]

                if (!overlay || overlay.type === 'bust') {
                  return null
                }

                return (
                  <path
                    key={`overlay-${path.id}`}
                    d={path.d}
                    fill={getOverlayFill(overlay.type)}
                    stroke={getOverlayStroke(overlay.type)}
                    strokeWidth={usesStripedOverlay(overlay.type) ? 0.75 : 1}
                  />
                )
              })
            : null}

          {DARTBOARD_ORDER.map((sector) => {
            const { x, y } = getSectorLabelPosition(sector, DARTBOARD_ORDER)

            return (
              <text
                key={`label-${sector}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={palette.numberText}
                className={cn(labelSize, 'font-bold')}
                style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 1.2 }}
              >
                {sector}
              </text>
            )
          })}

          {!preview
            ? visualPaths.map((path) => {
                const hit =
                  path.sector === 'miss'
                    ? createDartHit('miss', 'miss')
                    : createDartHit(path.sector as SectorNumber, path.multiplier)
                const overlay =
                  cellOverlays[getCellOverlayKey(hit.sector, hit.multiplier)]

                if (overlay?.type !== 'bust') {
                  return null
                }

                return (
                  <path
                    key={`bust-overlay-${path.id}`}
                    d={path.d}
                    fill={getOverlayFill(overlay.type)}
                    stroke={getOverlayStroke(overlay.type)}
                    strokeWidth={1}
                  />
                )
              })
            : null}
        </g>

        {highlightPath ? (
          <path
            key={pulseKey}
            d={highlightPath.d}
            fill="#ffffff"
            fillOpacity={0.5}
            stroke="#ffffff"
            strokeWidth={2}
            pointerEvents="none"
            className="animate-dartboard-hit"
          />
        ) : null}

        {interactive
          ? hitPaths.map((path) => {
              const wedgeSelection = pathToWedgeSelection(path)
              const isPending = pendingSelection
                ? wedgeSelectionsMatch(pendingSelection, wedgeSelection)
                : false

              return (
                <path
                  key={path.id}
                  d={path.d}
                  fill={isPending ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                  className={cn(
                    'transition-colors',
                    disabled
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer active:fill-white/20',
                  )}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    handleHit(path)
                  }}
                />
              )
            })
          : null}
      </svg>

      {!preview ? <DartboardLegend cellOverlays={cellOverlays} /> : null}
    </div>
  )
}

export { formatDartHit }
