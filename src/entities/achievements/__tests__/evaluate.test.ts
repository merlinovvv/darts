import { describe, expect, it } from 'vitest'

import type { GameHistoryEntry } from '@/entities/game-history'

import { evaluateAchievements } from '../lib/evaluate'

function entry(
  overrides: Partial<GameHistoryEntry> & Pick<GameHistoryEntry, 'id'>,
): GameHistoryEntry {
  return {
    gameId: 'x01-501-double-out',
    gameName: '501',
    mode: 'x01',
    category: 'multiplayer',
    startedAt: '2026-01-01T00:00:00.000Z',
    finishedAt: '2026-01-01T01:00:00.000Z',
    totalThrows: 10,
    isTie: false,
    players: [
      {
        id: 'a',
        name: 'Я',
        throws: 10,
        score: 100,
        isWinner: true,
      },
    ],
    ...overrides,
  }
}

describe('evaluateAchievements', () => {
  it('returns nothing for empty history', () => {
    expect(evaluateAchievements([])).toEqual([])
  })

  it('unlocks first game and first win', () => {
    const unlocked = evaluateAchievements([entry({ id: '1' })])

    expect(unlocked).toContain('first-game')
    expect(unlocked).toContain('first-win')
  })

  it('unlocks throw milestones', () => {
    const unlocked = evaluateAchievements([
      entry({ id: '1', totalThrows: 100 }),
    ])

    expect(unlocked).toContain('throws-100')
    expect(unlocked).not.toContain('throws-500')
  })

  it('unlocks daily series trophy', () => {
    const unlocked = evaluateAchievements([
      entry({ id: '1', source: 'daily-challenge', category: 'solo', mode: 'around-the-clock' }),
      entry({ id: '2', source: 'daily-challenge', category: 'solo', mode: 'around-the-clock' }),
      entry({ id: '3', source: 'daily-challenge', category: 'solo', mode: 'around-the-clock' }),
    ])

    expect(unlocked).toContain('daily-3')
    expect(unlocked).not.toContain('solo-5')
  })

  it('unlocks solo-5 after five solo games', () => {
    const unlocked = evaluateAchievements(
      Array.from({ length: 5 }, (_, index) =>
        entry({
          id: String(index + 1),
          category: 'solo',
          mode: 'around-the-clock',
          gameId: 'around-the-clock',
          gameName: 'Around the Clock',
        }),
      ),
    )

    expect(unlocked).toContain('solo-5')
  })
})
