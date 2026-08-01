import type { GameCategory, GameMode, GameSource } from '@/entities/game'

export interface GameHistoryPlayer {
  id: string
  name: string
  throws: number
  score: number
  isWinner: boolean
}

/** Снимок завершённой партии: денормализован, чтобы не зависеть от движков правил. */
export interface GameHistoryEntry {
  id: string
  gameId: string
  gameName: string
  mode: GameMode
  category: GameCategory
  source?: GameSource
  startedAt: string
  finishedAt: string
  totalThrows: number
  isTie: boolean
  players: GameHistoryPlayer[]
}
