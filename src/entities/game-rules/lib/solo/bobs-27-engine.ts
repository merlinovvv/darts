import type { DartHit } from '@/entities/dart-sector'
import type { Bobs27PlayerState, GameSession, TurnSnapshot } from '@/entities/game'

import type {
  ApplyThrowResult,
  GameRulesEngine,
  ScoreboardRow,
} from '../../model/types'
import {
  cloneStates,
  getSoloPlayerState,
  soloScoreboardRow,
  updateSoloPlayerState,
} from './engine-helpers'

const MAX_DARTS = 3

function getDoubleLabel(index: number): string {
  if (index >= 20) {
    return 'Bull'
  }

  return `D${index + 1}`
}

function getDoubleValue(index: number): number {
  if (index >= 20) {
    return 50
  }

  return (index + 1) * 2
}

function isValidDoubleHit(hit: DartHit, index: number): boolean {
  if (hit.multiplier === 'miss' || hit.sector === 'miss') {
    return false
  }

  if (index >= 20) {
    return hit.sector === 50 && hit.multiplier === 'single'
  }

  return hit.multiplier === 'double' && hit.sector === index + 1
}

export const bobs27Engine: GameRulesEngine = {
  id: 'bobs-27',
  name: "Bob's 27",
  description: 'Тренировка даблов',
  group: 'solo',
  mode: 'bobs-27',

  getMaxThrowsPerTurn() {
    return MAX_DARTS
  },

  initPlayerState() {
    return {
      score: 27,
      doubleIndex: 0,
      dartsAtTarget: 0,
      hitsAtTarget: 0,
    }
  },

  isScoringHit() {
    return true
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, Bobs27PlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const state = getSoloPlayerState<Bobs27PlayerState>(session)
    const value = getDoubleValue(state.doubleIndex)
    let nextState: Bobs27PlayerState = {
      ...state,
      dartsAtTarget: state.dartsAtTarget + 1,
    }

    if (isValidDoubleHit(hit, state.doubleIndex)) {
      nextState = {
        ...nextState,
        score: nextState.score + value,
        hitsAtTarget: nextState.hitsAtTarget + 1,
      }
    }

    const turnThrows = [...session.turnThrows, hit]

    if (nextState.dartsAtTarget >= MAX_DARTS) {
      if (nextState.hitsAtTarget === 0) {
        nextState = { ...nextState, score: nextState.score - value }
      }

      nextState = {
        ...nextState,
        doubleIndex: nextState.doubleIndex + 1,
        dartsAtTarget: 0,
        hitsAtTarget: 0,
      }

      if (nextState.doubleIndex > 20) {
        return {
          outcome: 'win',
          session: {
            ...updateSoloPlayerState(session, nextState),
            turnThrows,
            status: 'finished',
            winnerId: session.currentPlayerId,
          },
          message: `Bob's 27 завершён! Счёт: ${nextState.score}`,
        }
      }
    }

    return {
      outcome: 'continue',
      session: {
        ...updateSoloPlayerState(session, nextState),
        turnThrows,
      },
    }
  },

  canEndTurn(session) {
    return session.turnThrows.length < MAX_DARTS
  },

  checkWinner(session) {
    return session.winnerId ? [session.winnerId] : null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const state = getSoloPlayerState<Bobs27PlayerState>(session)

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        String(state.score),
        'очков',
        {
          Цель: getDoubleLabel(state.doubleIndex),
          Броски: `${state.dartsAtTarget}/${MAX_DARTS}`,
        },
      ),
    )
  },
}
