import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { GameHistoryEntry } from '@/entities/game-history'

import { evaluateAchievements } from '../lib/evaluate'
import type { AchievementId, UnlockedAchievement } from './types'

interface AchievementsStore {
  unlocked: UnlockedAchievement[]
  syncFromHistory: (entries: GameHistoryEntry[]) => void
}

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlocked: [],

      syncFromHistory(entries) {
        const earned = new Set(evaluateAchievements(entries))
        const now = new Date().toISOString()
        const existing = new Map(
          get().unlocked.map((item) => [item.id, item] as const),
        )

        let changed = false
        const next: UnlockedAchievement[] = [...get().unlocked]

        for (const id of earned) {
          if (!existing.has(id)) {
            next.push({ id, unlockedAt: now })
            changed = true
          }
        }

        if (changed) {
          set({ unlocked: next })
        }
      },
    }),
    {
      name: 'darts-achievements-storage',
      partialize: (state) => ({ unlocked: state.unlocked }),
    },
  ),
)

export function isAchievementUnlocked(
  unlocked: UnlockedAchievement[],
  id: AchievementId,
): boolean {
  return unlocked.some((item) => item.id === id)
}
