import type { GameSession, PlayerState } from '@/entities/game'
import type { Player } from '@/entities/player'

import type { ScoreboardRow } from '../../model/types'

export function cloneState<T extends PlayerState>(state: T): T {
  return structuredClone(state)
}

export function cloneStates<T extends PlayerState>(
  states: Record<string, T>,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(states).map(([id, state]) => [id, cloneState(state)]),
  )
}

export function soloScoreboardRow(
  _session: GameSession,
  player: Player,
  primary: string,
  secondary?: string,
  details?: Record<string, string | number>,
): ScoreboardRow {
  return {
    playerId: player.id,
    playerName: player.name,
    isCurrent: true,
    isRemoved: false,
    primary,
    secondary,
    details,
  }
}

export function getSoloPlayerState<T extends PlayerState>(
  session: GameSession,
): T {
  return session.playerStates[session.currentPlayerId] as T
}

export function updateSoloPlayerState<T extends PlayerState>(
  session: GameSession,
  state: T,
): GameSession {
  return {
    ...session,
    playerStates: {
      ...session.playerStates,
      [session.currentPlayerId]: state,
    },
  }
}
