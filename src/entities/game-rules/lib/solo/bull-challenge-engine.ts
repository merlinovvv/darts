import type { DartHit } from '@/entities/dart-sector'
import type {
  BullChallengeConfig,
  BullChallengePlayerState,
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

function isBullHit(hit: DartHit): boolean {
  return hit.sector === 25 || hit.sector === 50
}

export const bullChallengeEngine: GameRulesEngine = {
  id: 'bull-challenge',
  name: 'Bull Challenge',
  description: 'Тренировка центра',
  group: 'solo',
  mode: 'bull-challenge',

  getMaxThrowsPerTurn() {
    return 1
  },

  initPlayerState() {
    return { dartsThrown: 0, bullHits: 0, misses: 0 }
  },

  isScoringHit() {
    return true
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, BullChallengePlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const config = session.config as BullChallengeConfig
    const state = getSoloPlayerState<BullChallengePlayerState>(session)
    const nextState: BullChallengePlayerState = {
      dartsThrown: state.dartsThrown + 1,
      bullHits: state.bullHits + (isBullHit(hit) ? 1 : 0),
      misses: state.misses + (isBullHit(hit) ? 0 : 1),
    }

    const turnThrows = [hit]
    const hitTarget = config.hitTarget ?? 25
    const dartLimit = config.dartLimit ?? 50

    const completed =
      config.variant === 'hit-target'
        ? nextState.bullHits >= hitTarget
        : nextState.dartsThrown >= dartLimit

    if (completed) {
      return {
        outcome: 'win',
        message: 'Bull Challenge завершён!',
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
    const config = session.config as BullChallengeConfig
    const state = getSoloPlayerState<BullChallengePlayerState>(session)
    const goal =
      config.variant === 'hit-target'
        ? `${state.bullHits}/${config.hitTarget ?? 25} Bull`
        : `${state.dartsThrown}/${config.dartLimit ?? 50} дротиков`

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        String(state.bullHits),
        'попаданий в Bull',
        {
          Цель: goal,
          Мимо: state.misses,
        },
      ),
    )
  },
}
