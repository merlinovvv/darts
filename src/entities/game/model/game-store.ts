import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { persist } from 'zustand/middleware'

import type { DartHit } from '@/entities/dart-sector'
import type {
  GameCategory,
  GameConfig,
  GameSession,
  GameSource,
  TurnSnapshot,
} from '@/entities/game'
import { getNextActivePlayerId } from '../lib/session-players'
import { getGameEngine, getMaxThrowsPerTurn } from '@/entities/game-rules'
import type { Player } from '@/entities/player'
import { createPlayer, sortPlayersByOrder } from '@/entities/player'
import { generateId } from '@/shared/lib'

interface GameStore {
  sessions: GameSession[]
  activeSessionId: string | null
  pendingGameId: string | null
  undoStacks: Record<string, GameSession[]>
  startGame: (
    gameId: string,
    config: GameConfig,
    players: Player[],
    category?: GameCategory,
    source?: GameSource,
  ) => void
  setActiveSession: (sessionId: string) => void
  pauseActiveSession: () => void
  removeSession: (sessionId: string) => void
  setPendingGameId: (gameId: string | null) => void
  recordThrow: (hit: DartHit) => void
  undoLastThrow: () => void
  endTurn: () => void
  removePlayer: (playerId: string) => void
  addPlayer: (name?: string) => void
  abandonGame: () => void
}

interface PersistedGameState {
  sessions: GameSession[]
  activeSessionId: string | null
  pendingGameId: string | null
}

function createInitialSession(
  gameId: string,
  config: GameConfig,
  players: Player[],
  category: GameCategory,
  source?: GameSource,
): GameSession {
  const engine = getGameEngine(config)
  const sortedPlayers = sortPlayersByOrder(players)
  const playerStates = Object.fromEntries(
    sortedPlayers.map((player) => [
      player.id,
      engine.initPlayerState(player, config),
    ]),
  )

  const currentPlayerId = sortedPlayers[0]?.id ?? ''

  const session: GameSession = {
    id: generateId(),
    gameId,
    category,
    mode: config.mode,
    config,
    players: sortedPlayers,
    playerStates,
    currentPlayerId,
    turnThrows: [],
    turnStartSnapshot: {
      currentPlayerId,
      playerStates: structuredClone(playerStates),
    },
    throwHistory: [],
    turnNumber: 1,
    status: 'active',
    startedAt: new Date().toISOString(),
    ...(source ? { source } : {}),
  }

  return {
    ...session,
    turnStartSnapshot: engine.createTurnSnapshot(session),
  }
}

function advanceTurn(session: GameSession): GameSession {
  const nextPlayerId = getNextActivePlayerId(session)
  const engine = getGameEngine(session.config)
  const nextSession: GameSession = {
    ...session,
    currentPlayerId: nextPlayerId,
    turnThrows: [],
    turnNumber: session.turnNumber + 1,
  }

  return {
    ...nextSession,
    turnStartSnapshot: engine.createTurnSnapshot(nextSession),
  }
}

function findActiveSession(state: {
  sessions: GameSession[]
  activeSessionId: string | null
}): GameSession | null {
  return (
    state.sessions.find((session) => session.id === state.activeSessionId) ??
    null
  )
}

function replaceSession(
  sessions: GameSession[],
  next: GameSession,
): GameSession[] {
  return sessions.map((session) => (session.id === next.id ? next : session))
}

function pauseIfActive(session: GameSession): GameSession {
  return session.status === 'active' ? { ...session, status: 'waiting' } : session
}

function withoutUndoStack(
  undoStacks: Record<string, GameSession[]>,
  sessionId: string,
): Record<string, GameSession[]> {
  const next = { ...undoStacks }
  delete next[sessionId]
  return next
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      pendingGameId: null,
      undoStacks: {},

      setPendingGameId(gameId) {
        set({ pendingGameId: gameId })
      },

      startGame(gameId, config, players, category = 'multiplayer', source) {
        const session = createInitialSession(
          gameId,
          config,
          players,
          category,
          source,
        )

        set((state) => ({
          sessions: [
            ...state.sessions
              .filter((item) => item.status !== 'finished')
              .map(pauseIfActive),
            session,
          ],
          activeSessionId: session.id,
          pendingGameId: null,
          undoStacks: { ...state.undoStacks, [session.id]: [] },
        }))
      },

      setActiveSession(sessionId) {
        set((state) => ({
          activeSessionId: sessionId,
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) {
              return pauseIfActive(session)
            }

            return session.status === 'waiting'
              ? { ...session, status: 'active' }
              : session
          }),
        }))
      },

      pauseActiveSession() {
        set((state) => ({
          activeSessionId: null,
          sessions: state.sessions.map((session) =>
            session.id === state.activeSessionId ? pauseIfActive(session) : session,
          ),
        }))
      },

      removeSession(sessionId) {
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== sessionId),
          activeSessionId:
            state.activeSessionId === sessionId ? null : state.activeSessionId,
          undoStacks: withoutUndoStack(state.undoStacks, sessionId),
        }))
      },

      recordThrow(hit) {
        const state = get()
        const session = findActiveSession(state)
        if (!session || session.status !== 'active') {
          return
        }

        const maxThrows = getMaxThrowsPerTurn(session)

        if (session.turnThrows.length >= maxThrows) {
          return
        }

        const snapshot = structuredClone(session)
        const engine = getGameEngine(session.config)
        const scoring = engine.isScoringHit(hit, session.config)
        const throwRecord = {
          id: generateId(),
          playerId: session.currentPlayerId,
          hit,
          turnIndex: session.turnNumber,
          throwIndex: session.turnThrows.length + 1,
          scoring,
          timestamp: new Date().toISOString(),
        }

        const result = engine.applyThrow(session, hit)
        let nextSession: GameSession = {
          ...result.session,
          throwHistory: [...session.throwHistory, throwRecord],
        }

        const undoStack = state.undoStacks[session.id] ?? []

        if (
          result.outcome === 'win' ||
          result.outcome === 'tie' ||
          (result.outcome === 'bust' && nextSession.turnThrows.length === 0)
        ) {
          if (result.outcome !== 'win' && result.outcome !== 'tie') {
            nextSession = advanceTurn(nextSession)
          }

          set({
            sessions: replaceSession(state.sessions, nextSession),
            undoStacks: {
              ...state.undoStacks,
              [session.id]: [...undoStack, snapshot],
            },
          })
          return
        }

        if (nextSession.turnThrows.length >= maxThrows) {
          nextSession = advanceTurn(nextSession)
        }

        set({
          sessions: replaceSession(state.sessions, nextSession),
          undoStacks: {
            ...state.undoStacks,
            [session.id]: [...undoStack, snapshot],
          },
        })
      },

      undoLastThrow() {
        const state = get()
        const session = findActiveSession(state)
        const undoStack = session ? state.undoStacks[session.id] ?? [] : []

        if (!session || undoStack.length === 0) {
          return
        }

        const previous = undoStack[undoStack.length - 1]

        set({
          sessions: replaceSession(state.sessions, structuredClone(previous)),
          undoStacks: {
            ...state.undoStacks,
            [session.id]: undoStack.slice(0, -1),
          },
        })
      },

      endTurn() {
        const state = get()
        const session = findActiveSession(state)
        if (!session || session.status !== 'active') {
          return
        }

        const engine = getGameEngine(session.config)
        if (!engine.canEndTurn(session)) {
          return
        }

        set({ sessions: replaceSession(state.sessions, advanceTurn(session)) })
      },

      removePlayer(playerId) {
        const state = get()
        const session = findActiveSession(state)
        if (!session || session.status !== 'active' || session.category === 'solo') {
          return
        }

        const removed = new Set(session.removedPlayerIds ?? [])
        if (removed.has(playerId)) {
          return
        }

        const activeCount = session.players.filter(
          (player) => !removed.has(player.id),
        ).length

        if (activeCount <= 2) {
          return
        }

        const removedPlayerIds = [...(session.removedPlayerIds ?? []), playerId]
        const isCurrentPlayer = session.currentPlayerId === playerId
        const engine = getGameEngine(session.config)

        let nextSession: GameSession = {
          ...session,
          removedPlayerIds,
        }

        if (isCurrentPlayer) {
          nextSession = {
            ...nextSession,
            currentPlayerId: getNextActivePlayerId(nextSession),
            turnThrows: [],
          }
          nextSession = {
            ...nextSession,
            turnStartSnapshot: engine.createTurnSnapshot(nextSession),
          }
        }

        set({ sessions: replaceSession(state.sessions, nextSession) })
      },

      addPlayer(name) {
        const state = get()
        const session = findActiveSession(state)
        if (!session || session.status !== 'active' || session.category === 'solo') {
          return
        }

        const engine = getGameEngine(session.config)
        const player = createPlayer(name ?? '', session.players.length)

        set({
          sessions: replaceSession(state.sessions, {
            ...session,
            players: [...session.players, player],
            playerStates: {
              ...session.playerStates,
              [player.id]: engine.initPlayerState(player, session.config),
            },
          }),
        })
      },

      abandonGame() {
        set((state) => {
          const activeId = state.activeSessionId

          return {
            sessions: state.sessions.filter((session) => session.id !== activeId),
            activeSessionId: null,
            pendingGameId: null,
            undoStacks: activeId
              ? withoutUndoStack(state.undoStacks, activeId)
              : state.undoStacks,
          }
        })
      },
    }),
    {
      name: 'darts-game-storage',
      version: 2,
      migrate: (persisted, version) => {
        if (version >= 2) {
          return persisted as PersistedGameState
        }

        const legacy = persisted as {
          session?: GameSession | null
          pendingGameId?: string | null
        } | null
        const session = legacy?.session ?? null

        return {
          sessions: session ? [session] : [],
          activeSessionId: session?.id ?? null,
          pendingGameId: legacy?.pendingGameId ?? null,
        }
      },
      partialize: (state): PersistedGameState => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        pendingGameId: state.pendingGameId,
      }),
    },
  ),
)

export function useActiveSession(): GameSession | null {
  return useGameStore((state) => findActiveSession(state))
}

export function useOpenSessions(): GameSession[] {
  return useGameStore(
    useShallow((state) =>
      state.sessions.filter((session) => session.status !== 'finished'),
    ),
  )
}

export function useUndoCount(): number {
  return useGameStore(
    (state) =>
      (state.activeSessionId
        ? state.undoStacks[state.activeSessionId]?.length
        : 0) ?? 0,
  )
}

export function createTurnSnapshotFromSession(session: GameSession): TurnSnapshot {
  return getGameEngine(session.config).createTurnSnapshot(session)
}
