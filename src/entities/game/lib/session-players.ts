import type { GameSession } from '../model/types'
import type { Player } from '@/entities/player'
import { sortPlayersByOrder } from '@/entities/player'

export function getRemovedPlayerIds(session: GameSession): string[] {
  return session.removedPlayerIds ?? []
}

export function isPlayerRemoved(session: GameSession, playerId: string): boolean {
  return getRemovedPlayerIds(session).includes(playerId)
}

export function getActivePlayers(session: GameSession): Player[] {
  const removed = new Set(getRemovedPlayerIds(session))

  return sortPlayersByOrder(
    session.players.filter((player) => !removed.has(player.id)),
  )
}

export function getNextActivePlayerId(session: GameSession): string {
  const activePlayers = getActivePlayers(session)

  if (activePlayers.length === 0) {
    return session.currentPlayerId
  }

  const currentIndex = activePlayers.findIndex(
    (player) => player.id === session.currentPlayerId,
  )

  if (currentIndex >= 0) {
    const nextIndex = (currentIndex + 1) % activePlayers.length
    return activePlayers[nextIndex]?.id ?? session.currentPlayerId
  }

  const sortedPlayers = sortPlayersByOrder(session.players)
  const currentOrderIndex = sortedPlayers.findIndex(
    (player) => player.id === session.currentPlayerId,
  )

  for (let offset = 1; offset <= sortedPlayers.length; offset += 1) {
    const candidate =
      sortedPlayers[(currentOrderIndex + offset) % sortedPlayers.length]

    if (!isPlayerRemoved(session, candidate.id)) {
      return candidate.id
    }
  }

  return activePlayers[0]?.id ?? session.currentPlayerId
}

export function canAddPlayer(session: GameSession): boolean {
  return session.status === 'active' && session.category !== 'solo'
}

export function canRemovePlayer(session: GameSession, playerId: string): boolean {
  if (session.status !== 'active' || session.category === 'solo') {
    return false
  }

  if (isPlayerRemoved(session, playerId)) {
    return false
  }

  return getActivePlayers(session).length > 2
}
