import { describe, expect, it } from 'vitest'

import type { GameHistoryEntry } from '../model/types'
import { getHistoryTotals, getPlayerRankings } from '../lib/aggregate'

const sample: GameHistoryEntry[] = [
  {
    id: '1',
    gameId: 'x01-501-double-out',
    gameName: '501',
    mode: 'x01',
    category: 'multiplayer',
    startedAt: '2026-01-01T00:00:00.000Z',
    finishedAt: '2026-01-01T01:00:00.000Z',
    totalThrows: 20,
    isTie: false,
    players: [
      { id: 'a', name: 'Аня', throws: 12, score: 200, isWinner: true },
      { id: 'b', name: 'Боря', throws: 8, score: 80, isWinner: false },
    ],
  },
  {
    id: '2',
    gameId: 'around-the-clock',
    gameName: 'Around the Clock',
    mode: 'around-the-clock',
    category: 'solo',
    source: 'daily-challenge',
    startedAt: '2026-01-02T00:00:00.000Z',
    finishedAt: '2026-01-02T01:00:00.000Z',
    totalThrows: 30,
    isTie: false,
    players: [
      { id: 'a', name: 'Я', throws: 30, score: 150, isWinner: true },
    ],
  },
]

describe('history aggregates', () => {
  it('computes totals and favourite game', () => {
    const totals = getHistoryTotals(sample)

    expect(totals.games).toBe(2)
    expect(totals.throws).toBe(50)
    expect(totals.soloGames).toBe(1)
    expect(totals.dailySeries).toBe(1)
    expect(totals.favouriteGame?.gameName).toBeDefined()
  })

  it('ranks players by wins then games', () => {
    const rankings = getPlayerRankings(sample)

    expect(rankings[0]?.name).toBe('Аня')
    expect(rankings.find((player) => player.name === 'Боря')?.wins).toBe(0)
  })
})
