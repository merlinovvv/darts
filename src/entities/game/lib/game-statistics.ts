import { formatDartHit } from '@/entities/dart-sector'
import { sortPlayersByOrder } from '@/entities/player'

import type { GameSession } from '../model/types'
import { isPlayerRemoved } from './session-players'

export interface PlayerHitEntry {
  id: string
  label: string
  score: number
  turnIndex: number
  throwIndex: number
}

export interface PlayerTurnHits {
  turnIndex: number
  hits: PlayerHitEntry[]
}

export interface PlayerHitSummary {
  playerId: string
  playerName: string
  isRemoved: boolean
  isWinner: boolean
  totalThrows: number
  totalScore: number
  turns: PlayerTurnHits[]
}

function groupHitsByTurn(hits: PlayerHitEntry[]): PlayerTurnHits[] {
  const turns = new Map<number, PlayerHitEntry[]>()

  for (const hit of hits) {
    const turnHits = turns.get(hit.turnIndex) ?? []
    turnHits.push(hit)
    turns.set(hit.turnIndex, turnHits)
  }

  return [...turns.entries()]
    .sort(([left], [right]) => left - right)
    .map(([turnIndex, turnHits]) => ({
      turnIndex,
      hits: turnHits.sort((left, right) => left.throwIndex - right.throwIndex),
    }))
}

export function getPlayerHitSummaries(session: GameSession): PlayerHitSummary[] {
  return sortPlayersByOrder(session.players).map((player) => {
    const hits = session.throwHistory
      .filter((record) => record.playerId === player.id)
      .map((record) => ({
        id: record.id,
        label: formatDartHit(record.hit),
        score: record.hit.score,
        turnIndex: record.turnIndex,
        throwIndex: record.throwIndex,
      }))

    return {
      playerId: player.id,
      playerName: player.name,
      isRemoved: isPlayerRemoved(session, player.id),
      isWinner: session.winnerId === player.id,
      totalThrows: hits.length,
      totalScore: hits.reduce((sum, hit) => sum + hit.score, 0),
      turns: groupHitsByTurn(hits),
    }
  })
}
