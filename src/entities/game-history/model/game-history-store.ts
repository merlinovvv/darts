import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { GameHistoryEntry } from './types'

const MAX_ENTRIES = 100

interface GameHistoryStore {
  entries: GameHistoryEntry[]
  recordGame: (entry: GameHistoryEntry) => void
  clearHistory: () => void
}

export const useGameHistoryStore = create<GameHistoryStore>()(
  persist(
    (set) => ({
      entries: [],

      recordGame(entry) {
        set((state) => {
          if (state.entries.some((item) => item.id === entry.id)) {
            return state
          }

          return { entries: [entry, ...state.entries].slice(0, MAX_ENTRIES) }
        })
      },

      clearHistory() {
        set({ entries: [] })
      },
    }),
    {
      name: 'darts-history-storage',
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
)
