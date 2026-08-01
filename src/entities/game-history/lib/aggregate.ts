import type { GameHistoryEntry } from '../model/types'

export interface PlayerRanking {
  name: string
  games: number
  wins: number
  bestScore: number
  lastPlayedAt: string
}

export interface HistoryTotals {
  games: number
  throws: number
  points: number
  soloGames: number
  dailySeries: number
  bestPlayerScore: number
  averageThrowScore: number
  favouriteGame: { gameName: string; games: number } | null
}

export function getHistoryTotals(entries: GameHistoryEntry[]): HistoryTotals {
  const gamesByName = new Map<string, number>()
  let throws = 0
  let points = 0
  let soloGames = 0
  let dailySeries = 0
  let bestPlayerScore = 0

  for (const entry of entries) {
    throws += entry.totalThrows
    gamesByName.set(entry.gameName, (gamesByName.get(entry.gameName) ?? 0) + 1)

    if (entry.category === 'solo') {
      soloGames += 1
    }

    if (entry.source === 'daily-challenge') {
      dailySeries += 1
    }

    for (const player of entry.players) {
      points += player.score
      bestPlayerScore = Math.max(bestPlayerScore, player.score)
    }
  }

  const favourite = [...gamesByName.entries()].sort(
    ([, left], [, right]) => right - left,
  )[0]

  return {
    games: entries.length,
    throws,
    points,
    soloGames,
    dailySeries,
    bestPlayerScore,
    averageThrowScore: throws === 0 ? 0 : points / throws,
    favouriteGame: favourite
      ? { gameName: favourite[0], games: favourite[1] }
      : null,
  }
}

export function getPlayerRankings(
  entries: GameHistoryEntry[],
): PlayerRanking[] {
  const rankings = new Map<string, PlayerRanking>()

  for (const entry of entries) {
    for (const player of entry.players) {
      const current = rankings.get(player.name) ?? {
        name: player.name,
        games: 0,
        wins: 0,
        bestScore: 0,
        lastPlayedAt: entry.finishedAt,
      }

      rankings.set(player.name, {
        name: player.name,
        games: current.games + 1,
        wins: current.wins + (player.isWinner ? 1 : 0),
        bestScore: Math.max(current.bestScore, player.score),
        lastPlayedAt:
          entry.finishedAt > current.lastPlayedAt
            ? entry.finishedAt
            : current.lastPlayedAt,
      })
    }
  }

  return [...rankings.values()].sort(
    (left, right) => right.wins - left.wins || right.games - left.games,
  )
}
