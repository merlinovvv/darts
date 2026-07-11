import type { DartHit } from '@/entities/dart-sector'
import { THROWS_PER_TURN } from '@/entities/dart-sector'
import type {
  GameSession,
  TurnSnapshot,
  X01SoloConfig,
  X01SoloPlayerState,
} from '@/entities/game'

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

function isValidCheckout(hit: DartHit, remaining: number): boolean {
  if (remaining - hit.score !== 0) {
    return true
  }

  return (
    hit.multiplier === 'double' ||
    (hit.sector === 50 && hit.multiplier === 'single')
  )
}

function isBust(hit: DartHit, remaining: number): boolean {
  const after = remaining - hit.score

  if (after < 0 || after === 1) {
    return true
  }

  if (after === 0 && !isValidCheckout(hit, remaining)) {
    return true
  }

  return false
}

function averageScore(turnTotals: number[]): number {
  if (turnTotals.length === 0) {
    return 0
  }

  const sum = turnTotals.reduce((total, value) => total + value, 0)
  return Math.round((sum / turnTotals.length) * 10) / 10
}

export const x01SoloEngine: GameRulesEngine = {
  id: 'x01-solo',
  name: '501 Solo',
  description: '501 с отслеживанием прогресса',
  group: 'solo',
  mode: 'x01-solo',

  initPlayerState(_player, config) {
    const soloConfig = config as X01SoloConfig
    return {
      remaining: soloConfig.target,
      turnCount: 0,
      turnTotals: [],
      checkoutAttempts: 0,
      checkoutSuccesses: 0,
      firstDartT20Hits: 0,
      currentTurnScore: 0,
    }
  },

  isScoringHit() {
    return true
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, X01SoloPlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const state = getSoloPlayerState<X01SoloPlayerState>(session)
    const turnThrows = [...session.turnThrows, hit]
    const isFirstDart = turnThrows.length === 1

    let nextState: X01SoloPlayerState = { ...state }

    if (isFirstDart && hit.sector === 20 && hit.multiplier === 'triple') {
      nextState = {
        ...nextState,
        firstDartT20Hits: nextState.firstDartT20Hits + 1,
      }
    }

    if (isBust(hit, nextState.remaining)) {
      const restored = session.turnStartSnapshot
        .playerStates[session.currentPlayerId] as X01SoloPlayerState

      return {
        outcome: 'bust',
        message: 'Перебор! Ход не засчитан.',
        session: {
          ...session,
          playerStates: {
            ...session.playerStates,
            [session.currentPlayerId]: { ...restored, currentTurnScore: 0 },
          },
          turnThrows: [],
        },
      }
    }

    const remaining = nextState.remaining - hit.score
    const currentTurnScore = nextState.currentTurnScore + hit.score
    nextState = {
      ...nextState,
      remaining,
      currentTurnScore,
    }

    if (remaining === 0) {
      nextState = {
        ...nextState,
        checkoutAttempts: nextState.checkoutAttempts + 1,
        checkoutSuccesses: nextState.checkoutSuccesses + 1,
        turnCount: nextState.turnCount + 1,
        turnTotals: [...nextState.turnTotals, currentTurnScore],
        currentTurnScore: 0,
      }

      return {
        outcome: 'win',
        message: '501 закрыт!',
        session: {
          ...updateSoloPlayerState(session, nextState),
          turnThrows,
          status: 'finished',
          winnerId: session.currentPlayerId,
        },
      }
    }

    if (turnThrows.length >= THROWS_PER_TURN) {
      nextState = {
        ...nextState,
        turnCount: nextState.turnCount + 1,
        turnTotals: [...nextState.turnTotals, currentTurnScore],
        currentTurnScore: 0,
      }

      if (remaining <= 170) {
        nextState.checkoutAttempts += 1
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
    return session.turnThrows.length < THROWS_PER_TURN
  },

  checkWinner(session) {
    return session.winnerId ? [session.winnerId] : null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const state = getSoloPlayerState<X01SoloPlayerState>(session)
    const checkoutPercent =
      state.checkoutAttempts > 0
        ? Math.round((state.checkoutSuccesses / state.checkoutAttempts) * 100)
        : 0

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        String(state.remaining),
        'остаток',
        {
          'Ср. набор': averageScore(state.turnTotals),
          'T20 1-й': state.firstDartT20Hits,
          'Финиш %': `${checkoutPercent}%`,
        },
      ),
    )
  },
}
