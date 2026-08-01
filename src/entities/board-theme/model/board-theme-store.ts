import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { DEFAULT_BOARD_THEME_ID, getBoardTheme } from './themes'
import type { BoardThemeId } from './types'

interface BoardThemeStore {
  selectedThemeId: BoardThemeId
  setThemeId: (themeId: BoardThemeId) => void
}

export const useBoardThemeStore = create<BoardThemeStore>()(
  persist(
    (set) => ({
      selectedThemeId: DEFAULT_BOARD_THEME_ID,

      setThemeId(themeId) {
        set({ selectedThemeId: themeId })
      },
    }),
    {
      name: 'darts-board-theme-storage',
      partialize: (state) => ({ selectedThemeId: state.selectedThemeId }),
    },
  ),
)

export function useSelectedBoardTheme() {
  const selectedThemeId = useBoardThemeStore((state) => state.selectedThemeId)
  return getBoardTheme(selectedThemeId)
}
