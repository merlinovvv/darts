import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Прогресс испытания за один день. Хранится только за текущую дату. */
export interface DailyChallengeRecord {
  date: string
  gameId: string
  sessionIds: string[]
  bestScore: number
}

interface DailyChallengeStore {
  record: DailyChallengeRecord | null
  registerSeries: (params: {
    date: string
    gameId: string
    sessionId: string
    score: number
  }) => void
}

export const useDailyChallengeStore = create<DailyChallengeStore>()(
  persist(
    (set) => ({
      record: null,

      registerSeries({ date, gameId, sessionId, score }) {
        set((state) => {
          const isSameDay =
            state.record?.date === date && state.record.gameId === gameId
          const current = isSameDay ? state.record : null

          if (current?.sessionIds.includes(sessionId)) {
            return state
          }

          return {
            record: {
              date,
              gameId,
              sessionIds: [...(current?.sessionIds ?? []), sessionId],
              bestScore: Math.max(current?.bestScore ?? 0, score),
            },
          }
        })
      },
    }),
    {
      name: 'darts-daily-challenge-storage',
      partialize: (state) => ({ record: state.record }),
    },
  ),
)
