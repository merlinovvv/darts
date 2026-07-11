import { describe, expect, it } from 'vitest'

import { createDartHit } from '@/entities/dart-sector'
import type { GameSession } from '@/entities/game'
import { aroundTheClockEngine } from '@/entities/game-rules/lib/solo/around-the-clock-engine'
import { bobs27Engine } from '@/entities/game-rules/lib/solo/bobs-27-engine'
import { createPlayer } from '@/entities/player'

function createSoloSession(
  engine: typeof aroundTheClockEngine,
  config: GameSession['config'],
): GameSession {
  const player = createPlayer('Я', 0)

  return {
    id: 'solo-1',
    gameId: 'test',
    category: 'solo',
    mode: config.mode,
    config,
    players: [player],
    playerStates: {
      [player.id]: engine.initPlayerState(player, config),
    },
    currentPlayerId: player.id,
    turnThrows: [],
    turnStartSnapshot: {
      currentPlayerId: player.id,
      playerStates: {},
    },
    throwHistory: [],
    turnNumber: 1,
    status: 'active',
    startedAt: new Date().toISOString(),
  }
}

describe('solo engines', () => {
  it('around the clock advances on single hit', () => {
    const session = createSoloSession(aroundTheClockEngine, {
      mode: 'around-the-clock',
    })
    const result = aroundTheClockEngine.applyThrow(
      session,
      createDartHit(1, 'single'),
    )

    const state = result.session.playerStates[session.currentPlayerId] as {
      targetIndex: number
    }

    expect(state.targetIndex).toBe(1)
  })

  it("bob's 27 subtracts when all three darts miss", () => {
    const session = createSoloSession(bobs27Engine, { mode: 'bobs-27' })
    let current = session

    for (let index = 0; index < 3; index += 1) {
      const result = bobs27Engine.applyThrow(
        current,
        createDartHit('miss', 'miss'),
      )
      current = result.session
    }

    const state = current.playerStates[current.currentPlayerId] as {
      score: number
      doubleIndex: number
    }

    expect(state.score).toBe(25)
    expect(state.doubleIndex).toBe(1)
  })
})
