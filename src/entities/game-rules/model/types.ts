import type { DartHit } from '@/entities/dart-sector'
import type {
  GameConfig,
  GameSession,
  PlayerState,
  TurnSnapshot,
} from '@/entities/game'
import type { Player } from '@/entities/player'

export type ApplyThrowOutcome = 'continue' | 'bust' | 'win' | 'tie'

export interface ApplyThrowResult {
  outcome: ApplyThrowOutcome
  session: GameSession
  message?: string
}

export interface ScoreboardRow {
  playerId: string
  playerName: string
  isCurrent: boolean
  primary: string
  secondary?: string
  details?: Record<string, string | number>
  cricketDetails?: Record<
    string,
    import('../lib/board-overlays').CricketSectorDetail
  >
  isRemoved?: boolean
}

export interface GameRulesEngine {
  id: string
  name: string
  description: string
  group: string
  mode: GameConfig['mode']
  initPlayerState(player: Player, config: GameConfig): PlayerState
  isScoringHit(hit: DartHit, config: GameConfig): boolean
  applyThrow(session: GameSession, hit: DartHit): ApplyThrowResult
  canEndTurn(session: GameSession): boolean
  checkWinner(session: GameSession): string[] | null
  getScoreboardData(session: GameSession): ScoreboardRow[]
  createTurnSnapshot(session: GameSession): TurnSnapshot
  getMaxThrowsPerTurn?(session: GameSession): number
}

export interface GameDefinition {
  id: string
  name: string
  description: string
  group: string
  groupLabel: string
  category: import('@/entities/game').GameCategory
  mode: GameConfig['mode']
  config: GameConfig
}
