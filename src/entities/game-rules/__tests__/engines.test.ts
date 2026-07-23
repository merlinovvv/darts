import { describe, expect, it } from 'vitest'

import { createDartHit } from '@/entities/dart-sector'
import type { GameSession } from '@/entities/game'
import { CRICKET_TARGETS, createEmptyCricketState } from '@/entities/game'
import { cricketEngine } from '@/entities/game-rules/lib/cricket-engine'
import { x01Engine } from '@/entities/game-rules/lib/x01-engine'
import { createPlayer } from '@/entities/player'

function createX01Session(
  variant: 'double-out' | 'straight-out',
  remaining = 32,
): GameSession {
  const players = [
    createPlayer('A', 0),
    createPlayer('B', 1),
  ]

  return {
    id: '1',
    gameId: 'x01-501-double-out',
    category: 'multiplayer',
    mode: 'x01',
    config: { mode: 'x01', target: 501, variant },
    players,
    playerStates: {
      [players[0].id]: { remaining },
      [players[1].id]: { remaining: 501 },
    },
    currentPlayerId: players[0].id,
    turnThrows: [],
    turnStartSnapshot: {
      currentPlayerId: players[0].id,
      playerStates: {
        [players[0].id]: { remaining },
        [players[1].id]: { remaining: 501 },
      },
    },
    throwHistory: [],
    turnNumber: 1,
    status: 'active',
    startedAt: new Date().toISOString(),
  }
}

function createCricketSession(): GameSession {
  const players = [
    createPlayer('A', 0),
    createPlayer('B', 1),
  ]

  return {
    id: '1',
    gameId: 'cricket',
    category: 'multiplayer',
    mode: 'cricket',
    config: { mode: 'cricket' },
    players,
    playerStates: {
      [players[0].id]: cricketEngine.initPlayerState(players[0], {
        mode: 'cricket',
      }),
      [players[1].id]: cricketEngine.initPlayerState(players[1], {
        mode: 'cricket',
      }),
    },
    currentPlayerId: players[0].id,
    turnThrows: [],
    turnStartSnapshot: {
      currentPlayerId: players[0].id,
      playerStates: {},
    },
    throwHistory: [],
    turnNumber: 1,
    status: 'active',
    startedAt: new Date().toISOString(),
  }
}

describe('x01Engine', () => {
  it('busts when score goes below zero', () => {
    const session = createX01Session('straight-out', 10)
    const result = x01Engine.applyThrow(session, createDartHit(20, 'triple'))

    expect(result.outcome).toBe('bust')
    expect(
      (result.session.playerStates[session.currentPlayerId] as { remaining: number })
        .remaining,
    ).toBe(10)
  })

  it('requires double-out finish on last throw', () => {
    const session = createX01Session('double-out', 16)
    const invalidFinish = x01Engine.applyThrow(
      session,
      createDartHit(16, 'single'),
    )

    expect(invalidFinish.outcome).toBe('bust')

    const validSession = createX01Session('double-out', 32)
    const validFinish = x01Engine.applyThrow(
      validSession,
      createDartHit(16, 'double'),
    )

    expect(validFinish.outcome).toBe('win')
    expect(validFinish.session.status).toBe('finished')
  })

  it('allows straight-out finish with single', () => {
    const session = createX01Session('straight-out', 16)
    const result = x01Engine.applyThrow(session, createDartHit(16, 'single'))

    expect(result.outcome).toBe('win')
  })
})

describe('cricketEngine', () => {
  it('ignores non-cricket sectors for scoring state', () => {
    const session = createCricketSession()
    const result = cricketEngine.applyThrow(session, createDartHit(10, 'triple'))

    expect(result.outcome).toBe('continue')
    expect(cricketEngine.isScoringHit(createDartHit(10, 'triple'), session.config)).toBe(
      false,
    )
  })

  it('closes sector and awards overflow points', () => {
    const session = createCricketSession()
    const result = cricketEngine.applyThrow(session, createDartHit(20, 'triple'))

    const state = result.session.playerStates[session.currentPlayerId] as {
      20: { marks: number; points: number }
    }

    expect(state[20].marks).toBe(3)
    expect(state[20].points).toBe(0)
  })

  it('awards points after sector is closed', () => {
    let session = createCricketSession()

    session = cricketEngine.applyThrow(session, createDartHit(20, 'triple')).session
    const result = cricketEngine.applyThrow(session, createDartHit(20, 'single'))

    const state = result.session.playerStates[session.currentPlayerId] as {
      20: { marks: number; points: number }
    }

    expect(state[20].marks).toBe(3)
    expect(state[20].points).toBe(20)
  })

  it('does not award overflow points when opponent already closed the sector', () => {
    const session = createCricketSession()
    const players = session.players
    const playerA = players[0].id
    const playerB = players[1].id

    const closedByA = createEmptyCricketState()
    closedByA[20].marks = 3

    const openForB = createEmptyCricketState()
    openForB[20].marks = 2

    let riggedSession: GameSession = {
      ...session,
      currentPlayerId: playerB,
      playerStates: {
        [playerA]: closedByA,
        [playerB]: openForB,
      },
    }

    riggedSession = cricketEngine.applyThrow(
      riggedSession,
      createDartHit(20, 'triple'),
    ).session

    const state = riggedSession.playerStates[playerB] as {
      20: { marks: number; points: number }
    }

    expect(state[20].marks).toBe(3)
    expect(state[20].points).toBe(0)
  })

  it('does not win when all sectors closed but opponent has more points', () => {
    const session = createCricketSession()
    const players = session.players
    const playerA = players[0].id
    const playerB = players[1].id

    const closedAllState = CRICKET_TARGETS.reduce(
      (acc, target) => {
        acc[target] = { marks: 3, points: 0 }
        return acc
      },
      createEmptyCricketState(),
    )
    closedAllState[20].points = 30

    const leadingState = createEmptyCricketState()
    leadingState[20].marks = 2
    leadingState[20].points = 100

    const riggedSession: GameSession = {
      ...session,
      currentPlayerId: playerA,
      playerStates: {
        [playerA]: closedAllState,
        [playerB]: leadingState,
      },
    }

    const result = cricketEngine.applyThrow(riggedSession, createDartHit(19, 'single'))

    expect(result.outcome).toBe('continue')
    expect(result.session.status).toBe('active')
    expect(result.session.winnerId).toBeUndefined()
  })

  it('wins when all sectors closed and has the most points', () => {
    const session = createCricketSession()
    const players = session.players
    const playerA = players[0].id
    const playerB = players[1].id

    const winningState = CRICKET_TARGETS.reduce(
      (acc, target) => {
        acc[target] = { marks: 3, points: 0 }
        return acc
      },
      createEmptyCricketState(),
    )
    winningState[20].points = 120

    const trailingState = createEmptyCricketState()
    trailingState[20].marks = 2
    trailingState[20].points = 40

    const riggedSession: GameSession = {
      ...session,
      currentPlayerId: playerA,
      playerStates: {
        [playerA]: winningState,
        [playerB]: trailingState,
      },
    }

    const result = cricketEngine.applyThrow(riggedSession, createDartHit(18, 'single'))

    expect(result.outcome).toBe('win')
    expect(result.session.winnerId).toBe(playerA)
  })
})
