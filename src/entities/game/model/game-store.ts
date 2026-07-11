import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { DartHit } from '@/entities/dart-sector'
import type { GameCategory, GameConfig, GameSession, TurnSnapshot } from '@/entities/game'
import { getNextActivePlayerId } from '../lib/session-players'
import { getGameEngine, getMaxThrowsPerTurn } from '@/entities/game-rules'
import type { Player } from '@/entities/player'
import { createPlayer, sortPlayersByOrder } from '@/entities/player'
import { generateId } from '@/shared/lib'

interface GameStore {
  session: GameSession | null
  pendingGameId: string | null
  undoStack: GameSession[]
  startGame: (
    gameId: string,
    config: GameConfig,
    players: Player[],
    category?: GameCategory,
  ) => void
  setPendingGameId: (gameId: string | null) => void
  recordThrow: (hit: DartHit) => void
  undoLastThrow: () => void
  endTurn: () => void
  removePlayer: (playerId: string) => void
  addPlayer: (name?: string) => void
  abandonGame: () => void
}

function createInitialSession(
  gameId: string,
  config: GameConfig,
  players: Player[],
  category: GameCategory,
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

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      session: null,
      pendingGameId: null,
      undoStack: [],

      setPendingGameId(gameId) {
        set({ pendingGameId: gameId })
      },

      startGame(gameId, config, players, category = 'multiplayer') {
        set({
          session: createInitialSession(gameId, config, players, category),
          pendingGameId: null,
          undoStack: [],
        })
      },

      recordThrow(hit) {
        const { session, undoStack } = get()
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

        if (
          result.outcome === 'win' ||
          result.outcome === 'tie' ||
          (result.outcome === 'bust' && nextSession.turnThrows.length === 0)
        ) {
          if (result.outcome !== 'win' && result.outcome !== 'tie') {
            nextSession = advanceTurn(nextSession)
          }

          set({ session: nextSession, undoStack: [...undoStack, snapshot] })
          return
        }

        if (nextSession.turnThrows.length >= maxThrows) {
          nextSession = advanceTurn(nextSession)
        }

        set({ session: nextSession, undoStack: [...undoStack, snapshot] })
      },

      undoLastThrow() {
        const { session, undoStack } = get()
        if (!session || undoStack.length === 0) {
          return
        }

        const previous = undoStack[undoStack.length - 1]
        set({
          session: structuredClone(previous),
          undoStack: undoStack.slice(0, -1),
        })
      },

      endTurn() {
        const { session } = get()
        if (!session || session.status !== 'active') {
          return
        }

        const engine = getGameEngine(session.config)
        if (!engine.canEndTurn(session)) {
          return
        }

        set({ session: advanceTurn(session) })
      },

      removePlayer(playerId) {
        const { session } = get()
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

        set({ session: nextSession })
      },

      addPlayer(name) {
        const { session } = get()
        if (!session || session.status !== 'active' || session.category === 'solo') {
          return
        }

        const engine = getGameEngine(session.config)
        const player = createPlayer(name ?? '', session.players.length)

        set({
          session: {
            ...session,
            players: [...session.players, player],
            playerStates: {
              ...session.playerStates,
              [player.id]: engine.initPlayerState(player, session.config),
            },
          },
        })
      },

      abandonGame() {
        set({ session: null, pendingGameId: null, undoStack: [] })
      },
    }),
    {
      name: 'darts-game-storage',
      partialize: (state) => ({
        session: state.session,
        pendingGameId: state.pendingGameId,
      }),
    },
  ),
)

export function createTurnSnapshotFromSession(session: GameSession): TurnSnapshot {
  return getGameEngine(session.config).createTurnSnapshot(session)
}
