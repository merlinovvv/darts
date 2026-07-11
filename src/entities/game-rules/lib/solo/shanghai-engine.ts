import type { DartHit, BoardSectorNumber } from '@/entities/dart-sector'
import type { GameSession, ShanghaiPlayerState, TurnSnapshot } from '@/entities/game'

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
const MAX_ROUND = 20

function registerHit(
  state: ShanghaiPlayerState,
  hit: DartHit,
  round: number,
): ShanghaiPlayerState {
  if (hit.multiplier === 'miss' || hit.sector === 'miss' || hit.sector !== round) {
    return state
  }

  if (hit.multiplier === 'single') {
    return { ...state, hasSingle: true }
  }

  if (hit.multiplier === 'double') {
    return { ...state, hasDouble: true }
  }

  if (hit.multiplier === 'triple') {
    return { ...state, hasTriple: true }
  }

  return state
}

function isShanghai(state: ShanghaiPlayerState): boolean {
  return state.hasSingle && state.hasDouble && state.hasTriple
}

function resetRound(round: number): ShanghaiPlayerState {
  return {
    round,
    dartsInRound: 0,
    hasSingle: false,
    hasDouble: false,
    hasTriple: false,
  }
}

export const shanghaiEngine: GameRulesEngine = {
  id: 'shanghai',
  name: 'Shanghai',
  description: 'S, D и T за раунд',
  group: 'solo',
  mode: 'shanghai',

  getMaxThrowsPerTurn() {
    return MAX_DARTS
  },

  initPlayerState() {
    return resetRound(1)
  },

  isScoringHit(hit) {
    return hit.multiplier !== 'miss'
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, ShanghaiPlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const state = getSoloPlayerState<ShanghaiPlayerState>(session)
    const round = state.round as BoardSectorNumber
    let nextState = registerHit(state, hit, round)
    nextState = { ...nextState, dartsInRound: nextState.dartsInRound + 1 }
    const turnThrows = [...session.turnThrows, hit]

    if (isShanghai(nextState)) {
      return {
        outcome: 'win',
        message: `Shanghai на ${round}!`,
        session: {
          ...updateSoloPlayerState(session, nextState),
          turnThrows,
          status: 'finished',
          winnerId: session.currentPlayerId,
        },
      }
    }

    if (nextState.dartsInRound >= MAX_DARTS) {
      if (nextState.round >= MAX_ROUND) {
        return {
          outcome: 'win',
          message: 'Раунды завершены',
          session: {
            ...updateSoloPlayerState(session, nextState),
            turnThrows,
            status: 'finished',
            winnerId: session.currentPlayerId,
          },
        }
      }

      nextState = resetRound(nextState.round + 1)
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
    const state = getSoloPlayerState<ShanghaiPlayerState>(session)

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        `Раунд ${state.round}`,
        `${state.dartsInRound}/${MAX_DARTS} бросков`,
        {
          S: state.hasSingle ? '✓' : '—',
          D: state.hasDouble ? '✓' : '—',
          T: state.hasTriple ? '✓' : '—',
        },
      ),
    )
  },
}
