import type { DartHit } from '@/entities/dart-sector'

export type GameCategory = 'multiplayer' | 'solo'

export type GameMode =
  | 'x01'
  | 'cricket'
  | 'around-the-clock'
  | 'bobs-27'
  | 'cricket-practice'
  | 'checkout-121'
  | 'shanghai'
  | 'hundred-at-20'
  | 'bull-challenge'
  | 'x01-solo'
  | 'jdc-challenge'

export type X01Target = 301 | 501
export type X01Variant = 'double-out' | 'straight-out'
export type GameStatus = 'active' | 'waiting' | 'finished'

export type GameSource = 'daily-challenge'

export interface X01Config {
  mode: 'x01'
  target: X01Target
  variant: X01Variant
}

export interface CricketConfig {
  mode: 'cricket' | 'cricket-practice'
}

export interface AroundTheClockConfig {
  mode: 'around-the-clock'
}

export interface Bobs27Config {
  mode: 'bobs-27'
}

export interface Checkout121Config {
  mode: 'checkout-121'
}

export interface ShanghaiConfig {
  mode: 'shanghai'
}

export interface HundredAt20Config {
  mode: 'hundred-at-20'
}

export interface BullChallengeConfig {
  mode: 'bull-challenge'
  variant: 'dart-limit' | 'hit-target'
  dartLimit?: number
  hitTarget?: number
}

export interface X01SoloConfig {
  mode: 'x01-solo'
  target: 501
  variant: 'double-out'
}

export interface JdcChallengeConfig {
  mode: 'jdc-challenge'
}

export type GameConfig =
  | X01Config
  | CricketConfig
  | AroundTheClockConfig
  | Bobs27Config
  | Checkout121Config
  | ShanghaiConfig
  | HundredAt20Config
  | BullChallengeConfig
  | X01SoloConfig
  | JdcChallengeConfig

export interface X01PlayerState {
  remaining: number
}

export type CricketTarget = 15 | 16 | 17 | 18 | 19 | 20 | 'bull'

export interface CricketSectorState {
  marks: number
  points: number
}

export type CricketPlayerState = Record<CricketTarget, CricketSectorState>

export type AroundTheClockTarget = number | 'bull'

export interface AroundTheClockPlayerState {
  targetIndex: number
  dartsAtTarget: number
}

export interface Bobs27PlayerState {
  score: number
  doubleIndex: number
  dartsAtTarget: number
  hitsAtTarget: number
}

export interface Checkout121PlayerState {
  level: number
  remaining: number
  dartsUsed: number
}

export interface ShanghaiPlayerState {
  round: number
  dartsInRound: number
  hasSingle: boolean
  hasDouble: boolean
  hasTriple: boolean
}

export interface HundredAt20PlayerState {
  dartsThrown: number
  singles: number
  doubles: number
  triples: number
  misses: number
}

export interface BullChallengePlayerState {
  dartsThrown: number
  bullHits: number
  misses: number
}

export interface X01SoloPlayerState {
  remaining: number
  turnCount: number
  turnTotals: number[]
  checkoutAttempts: number
  checkoutSuccesses: number
  firstDartT20Hits: number
  currentTurnScore: number
}

export type JdcPhase = 'around' | 'doubles' | 'shanghai' | 'checkout'

export interface JdcChallengePlayerState {
  phase: JdcPhase
  totalScore: number
  phaseScore: number
  targetIndex: number
  dartsAtTarget: number
  shanghaiRound: number
  shanghaiDarts: number
  shanghaiHits: { single: boolean; double: boolean; triple: boolean }
  checkoutLevel: number
  checkoutRemaining: number
  checkoutDarts: number
}

export type PlayerState =
  | X01PlayerState
  | CricketPlayerState
  | AroundTheClockPlayerState
  | Bobs27PlayerState
  | Checkout121PlayerState
  | ShanghaiPlayerState
  | HundredAt20PlayerState
  | BullChallengePlayerState
  | X01SoloPlayerState
  | JdcChallengePlayerState

export interface ThrowRecord {
  id: string
  playerId: string
  hit: DartHit
  turnIndex: number
  throwIndex: number
  scoring: boolean
  timestamp: string
}

export interface TurnSnapshot {
  playerStates: Record<string, PlayerState>
  currentPlayerId: string
}

export interface GameSession {
  id: string
  gameId: string
  category: GameCategory
  mode: GameMode
  config: GameConfig
  players: import('@/entities/player').Player[]
  playerStates: Record<string, PlayerState>
  currentPlayerId: string
  turnThrows: DartHit[]
  turnStartSnapshot: TurnSnapshot
  throwHistory: ThrowRecord[]
  turnNumber: number
  status: GameStatus
  winnerId?: string
  tiePlayerIds?: string[]
  removedPlayerIds?: string[]
  startedAt: string
  source?: GameSource
}

export const CRICKET_TARGETS: CricketTarget[] = [
  20, 19, 18, 17, 16, 15, 'bull',
]

export const AROUND_THE_CLOCK_TARGETS: AroundTheClockTarget[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 'bull',
]

export function createEmptyCricketState(): CricketPlayerState {
  return {
    20: { marks: 0, points: 0 },
    19: { marks: 0, points: 0 },
    18: { marks: 0, points: 0 },
    17: { marks: 0, points: 0 },
    16: { marks: 0, points: 0 },
    15: { marks: 0, points: 0 },
    bull: { marks: 0, points: 0 },
  }
}

export function isX01Config(config: GameConfig): config is X01Config {
  return config.mode === 'x01'
}

export function isCricketConfig(config: GameConfig): config is CricketConfig {
  return config.mode === 'cricket' || config.mode === 'cricket-practice'
}

export function isSoloConfig(config: GameConfig): boolean {
  return config.mode !== 'x01' && config.mode !== 'cricket'
}

export function isX01PlayerState(state: PlayerState): state is X01PlayerState {
  return 'remaining' in state && !('level' in state) && !('turnTotals' in state)
}

export function isCricketPlayerState(
  state: PlayerState,
): state is CricketPlayerState {
  return '20' in state && typeof (state as CricketPlayerState)['20'] === 'object'
}

export function isSoloSession(session: GameSession): boolean {
  return session.category === 'solo'
}
