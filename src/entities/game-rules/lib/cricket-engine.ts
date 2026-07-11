import type { DartHit } from '@/entities/dart-sector'
import { getMarksFromHit, THROWS_PER_TURN } from '@/entities/dart-sector'
import type {
  CricketConfig,
  CricketPlayerState,
  CricketTarget,
  GameSession,
  TurnSnapshot,
} from '@/entities/game'
import { createEmptyCricketState, CRICKET_TARGETS, getActivePlayers, isPlayerRemoved } from '@/entities/game'
import type { Player } from '@/entities/player'

import type {
  ApplyThrowResult,
  GameRulesEngine,
  ScoreboardRow,
} from '../model/types'
import { getCricketSectorDetails } from '../lib/board-overlays'

function cloneCricketStates(
  states: Record<string, CricketPlayerState>,
): Record<string, CricketPlayerState> {
  return Object.fromEntries(
    Object.entries(states).map(([id, state]) => [
      id,
      CRICKET_TARGETS.reduce<CricketPlayerState>((acc, target) => {
        acc[target] = { ...state[target] }
        return acc
      }, createEmptyCricketState()),
    ]),
  )
}

function hitToCricketTarget(hit: DartHit): CricketTarget | null {
  if (hit.multiplier === 'miss' || hit.sector === 'miss') {
    return null
  }

  if (hit.sector === 25 || hit.sector === 50) {
    return 'bull'
  }

  if (hit.sector >= 15 && hit.sector <= 20) {
    return hit.sector as CricketTarget
  }

  return null
}

function getSectorPointValue(target: CricketTarget): number {
  return target === 'bull' ? 25 : target
}

function isTargetClosedForAll(
  session: GameSession,
  target: CricketTarget,
): boolean {
  const states = session.playerStates as Record<string, CricketPlayerState>

  return getActivePlayers(session).every((player) => {
    const marks = states[player.id]?.[target]?.marks ?? 0
    return marks >= 3
  })
}

function hasClosedAllTargets(state: CricketPlayerState): boolean {
  return CRICKET_TARGETS.every((target) => state[target].marks >= 3)
}

function getTotalPoints(state: CricketPlayerState): number {
  return CRICKET_TARGETS.reduce((sum, target) => sum + state[target].points, 0)
}

function applyCricketHit(session: GameSession, hit: DartHit): GameSession {
  const target = hitToCricketTarget(hit)
  if (!target) {
    return session
  }

  const playerStates = cloneCricketStates(
    session.playerStates as Record<string, CricketPlayerState>,
  )
  const playerState = playerStates[session.currentPlayerId]
  const sectorState = { ...playerState[target] }
  const marksToAdd = getMarksFromHit(hit)
  const allClosed = isTargetClosedForAll(session, target)

  if (!allClosed) {
    if (sectorState.marks < 3) {
      const marksNeeded = 3 - sectorState.marks
      const closingMarks = Math.min(marksToAdd, marksNeeded)
      const overflowMarks = marksToAdd - closingMarks

      sectorState.marks += closingMarks

      if (overflowMarks > 0) {
        sectorState.points += getSectorPointValue(target) * overflowMarks
      }
    } else {
      sectorState.points += hit.score
    }
  }

  playerState[target] = sectorState
  playerStates[session.currentPlayerId] = playerState

  return {
    ...session,
    playerStates,
  }
}

function findWinners(session: GameSession): string[] {
  const states = session.playerStates as Record<string, CricketPlayerState>
  const activePlayers = getActivePlayers(session)
  const qualified = activePlayers.filter((player) =>
    hasClosedAllTargets(states[player.id]),
  )

  if (qualified.length === 0) {
    return []
  }

  const maxPointsAmongAll = Math.max(
    ...activePlayers.map((player) => getTotalPoints(states[player.id])),
  )

  return qualified
    .filter((player) => getTotalPoints(states[player.id]) === maxPointsAmongAll)
    .map((player) => player.id)
}

export const cricketEngine: GameRulesEngine = {
  id: 'cricket',
  name: 'Крикет',
  description: 'Закройте сектора 15–20 и Bull',
  group: 'cricket',
  mode: 'cricket',

  initPlayerState(_player: Player, _config: CricketConfig) {
    return createEmptyCricketState()
  },

  isScoringHit(hit: DartHit) {
    return hitToCricketTarget(hit) !== null
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneCricketStates(
        session.playerStates as Record<string, CricketPlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const updatedSession = applyCricketHit(session, hit)

    const sessionWithThrow: GameSession = {
      ...updatedSession,
      turnThrows: [...session.turnThrows, hit],
    }

    const winners = findWinners(sessionWithThrow)

    if (winners.length === 1) {
      return {
        outcome: 'win',
        session: {
          ...sessionWithThrow,
          status: 'finished',
          winnerId: winners[0],
        },
      }
    }

    if (winners.length > 1) {
      return {
        outcome: 'tie',
        session: {
          ...sessionWithThrow,
          status: 'finished',
          tiePlayerIds: winners,
        },
        message: 'Ничья! Игроки закрыли все сектора с одинаковым счётом.',
      }
    }

    return {
      outcome: 'continue',
      session: sessionWithThrow,
    }
  },

  canEndTurn(session: GameSession) {
    return session.turnThrows.length < THROWS_PER_TURN
  },

  checkWinner(session: GameSession) {
    if (session.winnerId) {
      return [session.winnerId]
    }
    if (session.tiePlayerIds?.length) {
      return session.tiePlayerIds
    }
    return null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const states = session.playerStates as Record<string, CricketPlayerState>

    return session.players.map((player) => {
      const state = states[player.id]
      const totalPoints = getTotalPoints(state)
      const cricketDetails = getCricketSectorDetails(session, player.id)

      return {
        playerId: player.id,
        playerName: player.name,
        isCurrent: player.id === session.currentPlayerId,
        isRemoved: isPlayerRemoved(session, player.id),
        primary: String(totalPoints),
        secondary: 'очков',
        cricketDetails,
        details: Object.fromEntries(
          CRICKET_TARGETS.map((target) => {
            const detail = cricketDetails[target === 'bull' ? 'B' : String(target)]
            return [
              target === 'bull' ? 'B' : String(target),
              `${detail.marks}/3 · ${detail.points}`,
            ]
          }),
        ),
      }
    })
  },
}
