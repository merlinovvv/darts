import type { GameSession } from '@/entities/game'
import { getPlayerHitSummaries } from '@/entities/game'
import type { GameHistoryEntry } from '@/entities/game-history'
import { getGameDefinition } from '@/entities/game-rules'

export function toHistoryEntry(
  session: GameSession,
  finishedAt: string,
): GameHistoryEntry {
  const summaries = getPlayerHitSummaries(session)

  return {
    id: session.id,
    gameId: session.gameId,
    gameName: getGameDefinition(session.gameId)?.name ?? session.gameId,
    mode: session.mode,
    category: session.category,
    source: session.source,
    startedAt: session.startedAt,
    finishedAt,
    totalThrows: session.throwHistory.length,
    isTie: Boolean(session.tiePlayerIds?.length),
    players: summaries.map((summary) => ({
      id: summary.playerId,
      name: summary.playerName,
      throws: summary.totalThrows,
      score: summary.totalScore,
      isWinner: summary.isWinner,
    })),
  }
}
