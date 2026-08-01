import type { BoardThemeDefinition, BoardThemeId } from './types'

export const BOARD_THEMES: BoardThemeDefinition[] = [
  {
    id: 'classic',
    name: 'Классика',
    description: 'Тёплый крем и чёрный, привычные красный и зелёный',
    palette: {
      dark: '#141414',
      light: '#f3e6c8',
      accentDark: '#c81e1e',
      accentLight: '#1f8a3d',
      bullOuter: '#1f8a3d',
      bullInner: '#c81e1e',
      numberRing: '#0d0d0d',
      numberText: '#c4c4c4',
      wire: '#1a1a1a',
    },
  },
  {
    id: 'pro',
    name: 'Про',
    description: 'Холодный крем и серебристая сетка',
    palette: {
      dark: '#111111',
      light: '#efe8d6',
      accentDark: '#d21f1f',
      accentLight: '#178a3a',
      bullOuter: '#178a3a',
      bullInner: '#d21f1f',
      numberRing: '#0a0a0a',
      numberText: '#c4c4c4',
      wire: '#9ca3af',
    },
  },
  {
    id: 'blade',
    name: 'Турнир',
    description: 'Плотный крем и яркие кольца',
    palette: {
      dark: '#0f0f0f',
      light: '#f7ead0',
      accentDark: '#e11d1d',
      accentLight: '#16a34a',
      bullOuter: '#16a34a',
      bullInner: '#e11d1d',
      numberRing: '#050505',
      numberText: '#c4c4c4',
      wire: '#2a2a2a',
    },
  },
]

export const DEFAULT_BOARD_THEME_ID: BoardThemeId = 'classic'

export function getBoardTheme(id: BoardThemeId): BoardThemeDefinition {
  return (
    BOARD_THEMES.find((theme) => theme.id === id) ?? BOARD_THEMES[0]
  )
}
