import type { DartHit } from '@/entities/dart-sector'
import type {
  Checkout121PlayerState,
  GameSession,
  TurnSnapshot,
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

const MAX_DARTS = 9

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

function createLevelState(level: number): Checkout121PlayerState {
  return { level, remaining: level, dartsUsed: 0 }
}

export const checkout121Engine: GameRulesEngine = {
  id: 'checkout-121',
  name: '121 Checkout',
  description: 'Окончание за 9 дротиков',
  group: 'solo',
  mode: 'checkout-121',

  getMaxThrowsPerTurn() {
    return 3
  },

  initPlayerState() {
    return createLevelState(121)
  },

  isScoringHit() {
    return true
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, Checkout121PlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const state = getSoloPlayerState<Checkout121PlayerState>(session)
    const turnThrows = [...session.turnThrows, hit]

    if (isBust(hit, state.remaining)) {
      return {
        outcome: 'continue',
        message: 'Перебор! Попробуйте снова с 121.',
        session: {
          ...updateSoloPlayerState(session, createLevelState(state.level)),
          turnThrows: [],
          turnStartSnapshot: {
            currentPlayerId: session.currentPlayerId,
            playerStates: {
              [session.currentPlayerId]: createLevelState(state.level),
            },
          },
        },
      }
    }

    const remaining = state.remaining - hit.score
    const dartsUsed = state.dartsUsed + 1
    let nextState: Checkout121PlayerState = {
      ...state,
      remaining,
      dartsUsed,
    }

    if (remaining === 0) {
      const nextLevel = state.level + 1
      return {
        outcome: 'win',
        message: `Уровень ${state.level} пройден! Следующий — ${nextLevel}.`,
        session: {
          ...updateSoloPlayerState(session, createLevelState(nextLevel)),
          turnThrows,
          status: 'finished',
          winnerId: session.currentPlayerId,
        },
      }
    }

    if (dartsUsed >= MAX_DARTS) {
      return {
        outcome: 'continue',
        message: `Не уложились в 9 дротиков. Снова ${state.level}.`,
        session: {
          ...updateSoloPlayerState(session, createLevelState(state.level)),
          turnThrows: [],
        },
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
    const state = getSoloPlayerState<Checkout121PlayerState>(session)
    return (
      session.turnThrows.length < 3 &&
      state.dartsUsed < MAX_DARTS
    )
  },

  checkWinner(session) {
    return session.winnerId ? [session.winnerId] : null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const state = getSoloPlayerState<Checkout121PlayerState>(session)

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        String(state.remaining),
        `Уровень ${state.level}`,
        {
          Дротиков: `${state.dartsUsed}/${MAX_DARTS}`,
        },
      ),
    )
  },
}
