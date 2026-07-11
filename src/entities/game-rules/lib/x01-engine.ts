import type { DartHit } from '@/entities/dart-sector'
import { THROWS_PER_TURN } from '@/entities/dart-sector'
import type {
  GameSession,
  TurnSnapshot,
  X01Config,
  X01PlayerState,
} from '@/entities/game'
import { isPlayerRemoved } from '@/entities/game'
import type { Player } from '@/entities/player'

import type {
  ApplyThrowResult,
  GameRulesEngine,
  ScoreboardRow,
} from '../model/types'

function clonePlayerStates(
  states: Record<string, X01PlayerState>,
): Record<string, X01PlayerState> {
  return Object.fromEntries(
    Object.entries(states).map(([id, state]) => [id, { ...state }]),
  )
}

function isValidCheckout(
  hit: DartHit,
  remainingBefore: number,
  variant: X01Config['variant'],
): boolean {
  if (remainingBefore - hit.score !== 0) {
    return true
  }

  if (variant === 'straight-out') {
    return true
  }

  return (
    hit.multiplier === 'double' ||
    (hit.sector === 50 && hit.multiplier === 'single')
  )
}

function isBust(
  hit: DartHit,
  remainingBefore: number,
  variant: X01Config['variant'],
): boolean {
  const remainingAfter = remainingBefore - hit.score

  if (remainingAfter < 0) {
    return true
  }

  if (variant === 'double-out' && remainingAfter === 1) {
    return true
  }

  if (remainingAfter === 0 && !isValidCheckout(hit, remainingBefore, variant)) {
    return true
  }

  return false
}

export const x01Engine: GameRulesEngine = {
  id: 'x01',
  name: 'X01',
  description: 'Классическая игра на вычитание очков',
  group: 'x01',
  mode: 'x01',

  initPlayerState(_player: Player, config) {
    const x01Config = config as X01Config
    return { remaining: x01Config.target }
  },

  isScoringHit() {
    return true
  },

  createTurnSnapshot(session: GameSession): TurnSnapshot {
    return {
      currentPlayerId: session.currentPlayerId,
      playerStates: clonePlayerStates(
        session.playerStates as Record<string, X01PlayerState>,
      ),
    }
  },

  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult {
    const config = session.config as X01Config
    const playerStates = clonePlayerStates(
      session.playerStates as Record<string, X01PlayerState>,
    )
    const currentState = playerStates[session.currentPlayerId]
    const remainingBefore = currentState.remaining

    if (isBust(hit, remainingBefore, config.variant)) {
      const restoredStates = clonePlayerStates(
        session.turnStartSnapshot.playerStates as Record<string, X01PlayerState>,
      )

      return {
        outcome: 'bust',
        message: 'Перебор! Ход не засчитан.',
        session: {
          ...session,
          playerStates: restoredStates,
          turnThrows: [],
        },
      }
    }

    const remainingAfter = remainingBefore - hit.score
    currentState.remaining = remainingAfter
    playerStates[session.currentPlayerId] = currentState

    const turnThrows = [...session.turnThrows, hit]
    const updatedSession: GameSession = {
      ...session,
      playerStates,
      turnThrows,
    }

    if (remainingAfter === 0) {
      return {
        outcome: 'win',
        session: {
          ...updatedSession,
          status: 'finished',
          winnerId: session.currentPlayerId,
        },
      }
    }

    if (turnThrows.length >= THROWS_PER_TURN) {
      return {
        outcome: 'continue',
        session: updatedSession,
      }
    }

    return {
      outcome: 'continue',
      session: updatedSession,
    }
  },

  canEndTurn(session: GameSession) {
    return session.turnThrows.length < THROWS_PER_TURN
  },

  checkWinner(session: GameSession) {
    if (session.winnerId) {
      return [session.winnerId]
    }
    return null
  },

  getScoreboardData(session: GameSession): ScoreboardRow[] {
    const states = session.playerStates as Record<string, X01PlayerState>

    return session.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      isCurrent: player.id === session.currentPlayerId,
      isRemoved: isPlayerRemoved(session, player.id),
      primary: String(states[player.id]?.remaining ?? 0),
      secondary: 'остаток',
    }))
  },
}
