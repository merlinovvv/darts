import {
  createDartHit,
  DARTBOARD_ORDER,
  type DartHit,
} from '@/entities/dart-sector'
import type { GameSession, X01Config } from '@/entities/game'
import {
  CRICKET_TARGETS,
  type CricketPlayerState,
  type CricketTarget,
  isX01Config,
} from '@/entities/game'
import { getActivePlayers } from '@/entities/game'

export type OverlayType =
  | 'bust'
  | 'checkout'
  | 'cricket-closed-player'
  | 'cricket-closed-all'

export interface CellOverlay {
  type: OverlayType
}

export type CricketSectorCellStatus = 'open' | 'closed-player' | 'closed-all'

export interface CricketSectorDetail {
  marks: number
  points: number
  status: CricketSectorCellStatus
}

export function getCellOverlayKey(
  sector: DartHit['sector'],
  multiplier: DartHit['multiplier'],
): string {
  return `${sector}-${multiplier}`
}

function isX01Bust(
  hit: DartHit,
  remaining: number,
  variant: X01Config['variant'],
): boolean {
  const remainingAfter = remaining - hit.score

  if (remainingAfter < 0) {
    return true
  }

  if (variant === 'double-out' && remainingAfter === 1) {
    return true
  }

  if (remainingAfter === 0) {
    if (variant === 'straight-out') {
      return false
    }

    return !(
      hit.multiplier === 'double' ||
      (hit.sector === 50 && hit.multiplier === 'single')
    )
  }

  return false
}

function isX01Checkout(
  hit: DartHit,
  remaining: number,
  variant: X01Config['variant'],
): boolean {
  if (remaining - hit.score !== 0) {
    return false
  }

  if (variant === 'straight-out') {
    return true
  }

  return (
    hit.multiplier === 'double' ||
    (hit.sector === 50 && hit.multiplier === 'single')
  )
}

function getAllScoringHits(): DartHit[] {
  const hits: DartHit[] = []

  for (const sector of DARTBOARD_ORDER) {
    hits.push(createDartHit(sector, 'single'))
    hits.push(createDartHit(sector, 'double'))
    hits.push(createDartHit(sector, 'triple'))
  }

  hits.push(createDartHit(25, 'single'))
  hits.push(createDartHit(50, 'single'))

  return hits
}

function getX01Variant(session: GameSession): X01Config['variant'] {
  if (session.config.mode === 'x01') {
    return session.config.variant
  }

  return 'double-out'
}

function getX01Overlays(session: GameSession): Record<string, CellOverlay> {
  const playerState = session.playerStates[session.currentPlayerId]
  const remaining =
    'remaining' in playerState && typeof playerState.remaining === 'number'
      ? playerState.remaining
      : null

  if (remaining === null) {
    return {}
  }

  const variant = getX01Variant(session)
  const overlays: Record<string, CellOverlay> = {}

  for (const hit of getAllScoringHits()) {
    const key = getCellOverlayKey(hit.sector, hit.multiplier)

    if (isX01Bust(hit, remaining, variant)) {
      overlays[key] = { type: 'bust' }
      continue
    }

    if (isX01Checkout(hit, remaining, variant)) {
      overlays[key] = { type: 'checkout' }
    }
  }

  return overlays
}

function isCricketTargetClosedForAll(
  session: GameSession,
  target: CricketTarget,
): boolean {
  const states = session.playerStates as Record<string, CricketPlayerState>

  return getActivePlayers(session).every((player) => {
    const marks = states[player.id]?.[target]?.marks ?? 0
    return marks >= 3
  })
}

function getCricketSectorStatus(
  session: GameSession,
  target: CricketTarget,
  playerId: string,
): CricketSectorCellStatus {
  const states = session.playerStates as Record<string, CricketPlayerState>
  const marks = states[playerId]?.[target]?.marks ?? 0

  if (isCricketTargetClosedForAll(session, target)) {
    return 'closed-all'
  }

  if (marks >= 3) {
    return 'closed-player'
  }

  return 'open'
}

function getCricketOverlays(session: GameSession): Record<string, CellOverlay> {
  const overlays: Record<string, CellOverlay> = {}
  const currentPlayerId = session.currentPlayerId

  const applyTargetOverlay = (target: CricketTarget) => {
    const status = getCricketSectorStatus(session, target, currentPlayerId)
    if (status === 'open') {
      return
    }

    const overlay: CellOverlay = {
      type:
        status === 'closed-all'
          ? 'cricket-closed-all'
          : 'cricket-closed-player',
    }

    if (target === 'bull') {
      overlays[getCellOverlayKey(25, 'single')] = overlay
      overlays[getCellOverlayKey(50, 'single')] = overlay
      return
    }

    for (const multiplier of ['single', 'double', 'triple'] as const) {
      overlays[getCellOverlayKey(target, multiplier)] = overlay
    }
  }

  for (const target of CRICKET_TARGETS) {
    applyTargetOverlay(target)
  }

  return overlays
}

export function getDartboardOverlays(
  session: GameSession | null,
): Record<string, CellOverlay> {
  if (!session || session.status !== 'active') {
    return {}
  }

  if (
    isX01Config(session.config) ||
    session.config.mode === 'x01-solo' ||
    session.config.mode === 'checkout-121'
  ) {
    return getX01Overlays(session)
  }

  if (session.config.mode === 'cricket') {
    return getCricketOverlays(session)
  }

  return {}
}

export function getCricketSectorDetails(
  session: GameSession,
  playerId: string,
): Record<string, CricketSectorDetail> {
  const states = session.playerStates as Record<string, CricketPlayerState>
  const state = states[playerId]

  return Object.fromEntries(
    CRICKET_TARGETS.map((target) => {
      const sectorState = state[target]
      const status = getCricketSectorStatus(session, target, playerId)

      return [
        target === 'bull' ? 'B' : String(target),
        {
          marks: sectorState.marks,
          points: sectorState.points,
          status,
        },
      ]
    }),
  )
}

export function getCricketStatusLabel(status: CricketSectorCellStatus): string {
  switch (status) {
    case 'closed-all':
      return 'Закрыт всеми'
    case 'closed-player':
      return 'Закрыт'
    default:
      return ''
  }
}
