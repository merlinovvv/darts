import { beforeEach, describe, expect, it } from 'vitest'

import { createPlayer } from '@/entities/player'

import { useGameStore } from '../model/game-store'

describe('game store multi-session', () => {
  beforeEach(() => {
    useGameStore.setState({
      sessions: [],
      activeSessionId: null,
      pendingGameId: null,
      undoStacks: {},
    })
  })

  it('starts a game as the active session', () => {
    useGameStore
      .getState()
      .startGame(
        'x01-501-double-out',
        { mode: 'x01', target: 501, variant: 'double-out' },
        [createPlayer('Аня', 0), createPlayer('Боря', 1)],
      )

    const state = useGameStore.getState()

    expect(state.sessions).toHaveLength(1)
    expect(state.activeSessionId).toBe(state.sessions[0]?.id)
    expect(state.sessions[0]?.status).toBe('active')
  })

  it('pauses previous game when starting another', () => {
    const store = useGameStore.getState()

    store.startGame(
      'x01-501-double-out',
      { mode: 'x01', target: 501, variant: 'double-out' },
      [createPlayer('Аня', 0), createPlayer('Боря', 1)],
    )
    const firstId = useGameStore.getState().activeSessionId

    store.startGame(
      'cricket',
      { mode: 'cricket' },
      [createPlayer('Аня', 0), createPlayer('Боря', 1)],
    )

    const state = useGameStore.getState()
    const first = state.sessions.find((session) => session.id === firstId)

    expect(state.sessions).toHaveLength(2)
    expect(first?.status).toBe('waiting')
    expect(state.sessions.find((session) => session.id === state.activeSessionId)?.status).toBe(
      'active',
    )
  })

  it('reactivates a paused session', () => {
    const store = useGameStore.getState()

    store.startGame(
      'x01-501-double-out',
      { mode: 'x01', target: 501, variant: 'double-out' },
      [createPlayer('Аня', 0), createPlayer('Боря', 1)],
    )
    const firstId = useGameStore.getState().activeSessionId!

    store.pauseActiveSession()
    expect(useGameStore.getState().activeSessionId).toBeNull()

    store.setActiveSession(firstId)

    const state = useGameStore.getState()
    expect(state.activeSessionId).toBe(firstId)
    expect(state.sessions.find((session) => session.id === firstId)?.status).toBe(
      'active',
    )
  })
})
