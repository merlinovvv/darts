import { describe, expect, it } from 'vitest'

import {
  DAILY_CHALLENGE_GAME_IDS,
  getDailyChallengeGameId,
  toDateKey,
} from '../lib/rotation'

describe('daily challenge rotation', () => {
  it('formats date key as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 7, 1))).toBe('2026-08-01')
  })

  it('picks a game from the pool for a date', () => {
    const gameId = getDailyChallengeGameId('2026-08-01')

    expect(DAILY_CHALLENGE_GAME_IDS).toContain(gameId)
  })

  it('returns the same game for the same date', () => {
    expect(getDailyChallengeGameId('2026-03-15')).toBe(
      getDailyChallengeGameId('2026-03-15'),
    )
  })

  it('can rotate to a different game on another day', () => {
    const ids = new Set(
      Array.from({ length: 14 }, (_, index) =>
        getDailyChallengeGameId(`2026-01-${String(index + 1).padStart(2, '0')}`),
      ),
    )

    expect(ids.size).toBeGreaterThan(1)
  })
})
