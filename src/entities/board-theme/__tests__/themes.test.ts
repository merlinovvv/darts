import { beforeEach, describe, expect, it } from 'vitest'

import { useBoardThemeStore } from '../model/board-theme-store'
import {
  BOARD_THEMES,
  DEFAULT_BOARD_THEME_ID,
  getBoardTheme,
} from '../model/themes'

describe('board themes', () => {
  beforeEach(() => {
    useBoardThemeStore.setState({ selectedThemeId: DEFAULT_BOARD_THEME_ID })
  })

  it('defines three selectable themes without brand names', () => {
    expect(BOARD_THEMES).toHaveLength(3)
    expect(BOARD_THEMES.map((theme) => theme.id)).toEqual([
      'classic',
      'pro',
      'blade',
    ])
  })

  it('returns palette fields for each theme', () => {
    for (const theme of BOARD_THEMES) {
      const resolved = getBoardTheme(theme.id)
      expect(resolved.palette.numberRing).toMatch(/^#/)
      expect(resolved.palette.light).toMatch(/^#/)
      expect(resolved.palette.accentDark).toMatch(/^#/)
    }
  })

  it('persists selection in the store', () => {
    useBoardThemeStore.getState().setThemeId('blade')
    expect(useBoardThemeStore.getState().selectedThemeId).toBe('blade')
    expect(getBoardTheme('blade').name).toBe('Турнир')
  })
})
