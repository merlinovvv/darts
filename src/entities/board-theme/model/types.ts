export type BoardThemeId = 'classic' | 'pro' | 'blade'

export interface BoardPalette {
  dark: string
  light: string
  accentDark: string
  accentLight: string
  bullOuter: string
  bullInner: string
  numberRing: string
  numberText: string
  wire: string
}

export interface BoardThemeDefinition {
  id: BoardThemeId
  name: string
  description: string
  palette: BoardPalette
}
