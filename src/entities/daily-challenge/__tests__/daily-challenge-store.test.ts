import { beforeEach, describe, expect, it } from 'vitest'

import { useDailyChallengeStore } from '../model/daily-challenge-store'

describe('daily challenge store', () => {
  beforeEach(() => {
    useDailyChallengeStore.setState({ record: null })
  })

  it('registers the first series of the day', () => {
    useDailyChallengeStore.getState().registerSeries({
      date: '2026-08-01',
      gameId: 'around-the-clock',
      sessionId: 's1',
      score: 40,
    })

    const record = useDailyChallengeStore.getState().record

    expect(record).toEqual({
      date: '2026-08-01',
      gameId: 'around-the-clock',
      sessionIds: ['s1'],
      bestScore: 40,
    })
  })

  it('is idempotent for the same session id', () => {
    const register = useDailyChallengeStore.getState().registerSeries

    register({
      date: '2026-08-01',
      gameId: 'around-the-clock',
      sessionId: 's1',
      score: 40,
    })
    register({
      date: '2026-08-01',
      gameId: 'around-the-clock',
      sessionId: 's1',
      score: 90,
    })

    expect(useDailyChallengeStore.getState().record?.sessionIds).toEqual(['s1'])
    expect(useDailyChallengeStore.getState().record?.bestScore).toBe(40)
  })

  it('resets progress when the date changes', () => {
    const register = useDailyChallengeStore.getState().registerSeries

    register({
      date: '2026-08-01',
      gameId: 'around-the-clock',
      sessionId: 's1',
      score: 40,
    })
    register({
      date: '2026-08-02',
      gameId: 'bobs-27',
      sessionId: 's2',
      score: 27,
    })

    expect(useDailyChallengeStore.getState().record).toEqual({
      date: '2026-08-02',
      gameId: 'bobs-27',
      sessionIds: ['s2'],
      bestScore: 27,
    })
  })
})
