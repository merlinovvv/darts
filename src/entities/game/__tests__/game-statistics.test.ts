import { describe, expect, it } from 'vitest'

import { createDartHit } from '@/entities/dart-sector'
import type { GameSession } from '@/entities/game'
import { getPlayerHitSummaries } from '@/entities/game'

function createSession(): GameSession {
  const playerA = { id: 'a', name: 'Игрок 1', order: 0 }
  const playerB = { id: 'b', name: 'Игрок 2', order: 1 }

  return {
    id: 'session-1',
    gameId: '501-double-out',
    category: 'multiplayer',
    mode: 'x01',
    config: { mode: 'x01', target: 501, variant: 'double-out' },
    players: [playerA, playerB],
    playerStates: {
      a: { remaining: 441 },
      b: { remaining: 501 },
    },
    currentPlayerId: 'a',
    turnThrows: [],
    turnStartSnapshot: {
      currentPlayerId: 'a',
      playerStates: {
        a: { remaining: 441 },
        b: { remaining: 501 },
      },
    },
    throwHistory: [
      {
        id: 't1',
        playerId: 'a',
        hit: createDartHit(20, 'single'),
        turnIndex: 1,
        throwIndex: 1,
        scoring: true,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 't2',
        playerId: 'a',
        hit: createDartHit(20, 'triple'),
        turnIndex: 1,
        throwIndex: 2,
        scoring: true,
        timestamp: '2026-01-01T00:00:01.000Z',
      },
      {
        id: 't3',
        playerId: 'b',
        hit: createDartHit('miss', 'miss'),
        turnIndex: 2,
        throwIndex: 1,
        scoring: false,
        timestamp: '2026-01-01T00:00:02.000Z',
      },
    ],
    turnNumber: 2,
    status: 'finished',
    winnerId: 'a',
    startedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('getPlayerHitSummaries', () => {
  it('groups throws by player and turn', () => {
    const summaries = getPlayerHitSummaries(createSession())

    expect(summaries).toHaveLength(2)
    expect(summaries[0]).toMatchObject({
      playerName: 'Игрок 1',
      totalThrows: 2,
      totalScore: 80,
      isWinner: true,
      turns: [
        {
          turnIndex: 1,
          hits: [{ label: 'S20' }, { label: 'T20' }],
        },
      ],
    })
    expect(summaries[1]).toMatchObject({
      playerName: 'Игрок 2',
      totalThrows: 1,
      totalScore: 0,
      turns: [
        {
          turnIndex: 2,
          hits: [{ label: 'Мимо' }],
        },
      ],
    })
  })
})
