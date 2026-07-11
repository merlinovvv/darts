import type { DartHit } from '@/entities/dart-sector'
import type {
  AroundTheClockPlayerState,
  GameSession,
  TurnSnapshot,
} from '@/entities/game'
import { AROUND_THE_CLOCK_TARGETS } from '@/entities/game'

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

function getTarget(index: number) {
  return AROUND_THE_CLOCK_TARGETS[index] ?? 'bull'
}

function isValidHit(hit: DartHit, target: number | 'bull'): boolean {
  if (hit.multiplier === 'miss' || hit.sector === 'miss') {
    return false
  }

  if (target === 'bull') {
    return hit.sector === 25 && hit.multiplier === 'single'
  }

  return hit.sector === target && hit.multiplier === 'single'
}

function formatTarget(target: number | 'bull'): string {
  return target === 'bull' ? 'Bull' : String(target)
}

export const aroundTheClockEngine: GameRulesEngine = {
  id: 'around-the-clock',
  name: 'Around the Clock',
  description: 'Вокруг света',
  group: 'solo',
  mode: 'around-the-clock',

  getMaxThrowsPerTurn() {
    return MAX_DARTS
  },

  initPlayerState() {
    return { targetIndex: 0, dartsAtTarget: 0 }
  },

  isScoringHit(hit, _config) {
    return hit.multiplier !== 'miss'
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, AroundTheClockPlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const state = getSoloPlayerState<AroundTheClockPlayerState>(session)
    const target = getTarget(state.targetIndex)
    const turnThrows = [...session.turnThrows, hit]
    let nextState = { ...state, dartsAtTarget: state.dartsAtTarget + 1 }

    if (isValidHit(hit, target)) {
      nextState = {
        targetIndex: nextState.targetIndex + 1,
        dartsAtTarget: 0,
      }

      if (nextState.targetIndex >= AROUND_THE_CLOCK_TARGETS.length) {
        return {
          outcome: 'win',
          session: {
            ...updateSoloPlayerState(session, nextState),
            turnThrows,
            status: 'finished',
            winnerId: session.currentPlayerId,
          },
          message: 'Вокруг света пройден!',
        }
      }
    } else if (nextState.dartsAtTarget >= MAX_DARTS) {
      nextState = { ...nextState, dartsAtTarget: 0 }
    }

    const updated = updateSoloPlayerState(session, nextState)

    if (turnThrows.length >= MAX_DARTS) {
      return { outcome: 'continue', session: { ...updated, turnThrows } }
    }

    return {
      outcome: 'continue',
      session: { ...updated, turnThrows },
    }
  },

  canEndTurn(session) {
    return session.turnThrows.length < MAX_DARTS
  },

  checkWinner(session) {
    return session.winnerId ? [session.winnerId] : null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const state = getSoloPlayerState<AroundTheClockPlayerState>(session)
    const target = getTarget(state.targetIndex)

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        formatTarget(target),
        `Цель · ${state.dartsAtTarget}/${MAX_DARTS}`,
        {
          Пройдено: state.targetIndex,
          Всего: AROUND_THE_CLOCK_TARGETS.length,
        },
      ),
    )
  },
}
