import type { DartHit } from '@/entities/dart-sector'
import type {
  GameSession,
  JdcChallengePlayerState,
  JdcPhase,
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

const PHASE_LABELS: Record<JdcPhase, string> = {
  around: 'Around the Clock',
  doubles: 'Doubles',
  shanghai: 'Shanghai',
  checkout: 'Checkouts',
}

function initJdcState(): JdcChallengePlayerState {
  return {
    phase: 'around',
    totalScore: 0,
    phaseScore: 0,
    targetIndex: 0,
    dartsAtTarget: 0,
    shanghaiRound: 1,
    shanghaiDarts: 0,
    shanghaiHits: { single: false, double: false, triple: false },
    checkoutLevel: 121,
    checkoutRemaining: 121,
    checkoutDarts: 0,
  }
}

function advancePhase(state: JdcChallengePlayerState): JdcChallengePlayerState {
  const order: JdcPhase[] = ['around', 'doubles', 'shanghai', 'checkout']
  const index = order.indexOf(state.phase)

  if (index >= order.length - 1) {
    return state
  }

  const nextPhase = order[index + 1]

  return {
    ...initJdcState(),
    phase: nextPhase,
    totalScore: state.totalScore + state.phaseScore,
    phaseScore: 0,
  }
}

function isAroundHit(hit: DartHit, target: number | 'bull'): boolean {
  if (target === 'bull') {
    return hit.sector === 25 && hit.multiplier === 'single'
  }

  return hit.sector === target && hit.multiplier === 'single'
}

function isDoubleHit(hit: DartHit, index: number): boolean {
  if (index >= 20) {
    return hit.sector === 50
  }

  return hit.multiplier === 'double' && hit.sector === index + 1
}

export const jdcChallengeEngine: GameRulesEngine = {
  id: 'jdc-challenge',
  name: 'JDC Challenge',
  description: 'Комплексная тренировка',
  group: 'solo',
  mode: 'jdc-challenge',

  getMaxThrowsPerTurn(session) {
    const state = getSoloPlayerState<JdcChallengePlayerState>(session)
    return state.phase === 'around' ? 1 : 3
  },

  initPlayerState() {
    return initJdcState()
  },

  isScoringHit() {
    return true
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: cloneStates(
        session.playerStates as Record<string, JdcChallengePlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    let state = getSoloPlayerState<JdcChallengePlayerState>(session)
    const turnThrows = [...session.turnThrows, hit]
    let points = 0

    switch (state.phase) {
      case 'around': {
        const target = AROUND_THE_CLOCK_TARGETS[state.targetIndex]
        state.dartsAtTarget += 1

        if (isAroundHit(hit, target)) {
          points = 2
          state.targetIndex += 1
          state.dartsAtTarget = 0
        } else if (state.dartsAtTarget >= 3) {
          state.dartsAtTarget = 0
        }

        if (state.targetIndex >= AROUND_THE_CLOCK_TARGETS.length) {
          state = advancePhase({ ...state, phaseScore: state.phaseScore + points })
        }
        break
      }
      case 'doubles': {
        state.dartsAtTarget += 1
        if (isDoubleHit(hit, state.targetIndex)) {
          points = 3
        }

        if (state.dartsAtTarget >= 3) {
          state.targetIndex += 1
          state.dartsAtTarget = 0
        }

        if (state.targetIndex > 20) {
          state = advancePhase({ ...state, phaseScore: state.phaseScore + points })
        }
        break
      }
      case 'shanghai': {
        state.shanghaiDarts += 1
        if (hit.sector === state.shanghaiRound) {
          if (hit.multiplier === 'single') state.shanghaiHits.single = true
          if (hit.multiplier === 'double') state.shanghaiHits.double = true
          if (hit.multiplier === 'triple') state.shanghaiHits.triple = true
        }

        const shanghai =
          state.shanghaiHits.single &&
          state.shanghaiHits.double &&
          state.shanghaiHits.triple

        if (shanghai) {
          points = 10
        }

        if (state.shanghaiDarts >= 3) {
          state.shanghaiRound += 1
          state.shanghaiDarts = 0
          state.shanghaiHits = { single: false, double: false, triple: false }
        }

        if (state.shanghaiRound > 20) {
          state = advancePhase({ ...state, phaseScore: state.phaseScore + points })
        }
        break
      }
      case 'checkout': {
        state.checkoutDarts += 1
        const remaining = state.checkoutRemaining - hit.score

        if (remaining < 0 || remaining === 1) {
          points = 0
        } else if (remaining === 0) {
          points = 15
          state.checkoutLevel += 1
          state.checkoutRemaining = state.checkoutLevel
          state.checkoutDarts = 0
        } else {
          state.checkoutRemaining = remaining
        }

        if (state.checkoutDarts >= 9 && remaining !== 0) {
          state.checkoutRemaining = state.checkoutLevel
          state.checkoutDarts = 0
        }

        if (state.checkoutLevel > 125) {
          return {
            outcome: 'win',
            message: `JDC завершён! ${state.totalScore + state.phaseScore + points} очков`,
            session: {
              ...updateSoloPlayerState(session, {
                ...state,
                phaseScore: state.phaseScore + points,
                totalScore: state.totalScore + state.phaseScore + points,
              }),
              turnThrows,
              status: 'finished',
              winnerId: session.currentPlayerId,
            },
          }
        }
        break
      }
    }

    state.phaseScore += points

    return {
      outcome: 'continue',
      session: {
        ...updateSoloPlayerState(session, state),
        turnThrows,
      },
    }
  },

  canEndTurn(session) {
    const state = getSoloPlayerState<JdcChallengePlayerState>(session)
    const max = state.phase === 'around' ? 1 : 3
    return session.turnThrows.length < max
  },

  checkWinner(session) {
    return session.winnerId ? [session.winnerId] : null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const state = getSoloPlayerState<JdcChallengePlayerState>(session)

    return session.players.map((player) =>
      soloScoreboardRow(
        session,
        player,
        String(state.totalScore + state.phaseScore),
        'очков JDC',
        {
          Фаза: PHASE_LABELS[state.phase],
          'Фаза +': state.phaseScore,
        },
      ),
    )
  },
}
