import type { DartHit } from '@/entities/dart-sector'
import type {
  GameSession,
  HundredAt20PlayerState,
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

const TOTAL_DARTS = 100

function classifyHit(hit: DartHit): keyof Pick<
  HundredAt20PlayerState,
  'singles' | 'doubles' | 'triples' | 'misses'
> {
  if (hit.multiplier === 'miss' || hit.sector === 'miss' || hit.sector !== 20) {
    return 'misses'
  }

  switch (hit.multiplier) {
    case 'single':
      return 'singles'
    case 'double':
      return 'doubles'
    case 'triple':
      return 'triples'
    default:
      return 'misses'
  }
}

export const hundredAt20Engine: GameRulesEngine = {
  id: 'hundred-at-20',
  name: '100 at 20',
  description: '100 дротиков в T20',
  group: 'solo',
  mode: 'hundred-at-20',

  getMaxThrowsPerTurn() {
    return 1
  },

  initPlayerState() {
    return {
      dartsThrown: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      misses: 0,
    }
  },

  isScoringHit() {
    return true
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, HundredAt20PlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const state = getSoloPlayerState<HundredAt20PlayerState>(session)
    const bucket = classifyHit(hit)
    const nextState: HundredAt20PlayerState = {
      ...state,
      dartsThrown: state.dartsThrown + 1,
      [bucket]: state[bucket] + 1,
    }

    const turnThrows = [hit]

    if (nextState.dartsThrown >= TOTAL_DARTS) {
      return {
        outcome: 'win',
        message: '100 дротиков завершены!',
        session: {
          ...updateSoloPlayerState(session, nextState),
          turnThrows,
          status: 'finished',
          winnerId: session.currentPlayerId,
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

  canEndTurn() {
    return false
  },

  checkWinner(session) {
    return session.winnerId ? [session.winnerId] : null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const state = getSoloPlayerState<HundredAt20PlayerState>(session)

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        `${state.dartsThrown}/${TOTAL_DARTS}`,
        'дротиков',
        {
          S: state.singles,
          D: state.doubles,
          T: state.triples,
          Мимо: state.misses,
        },
      ),
    )
  },
}
