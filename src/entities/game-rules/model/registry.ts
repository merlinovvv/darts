import type { GameConfig } from '@/entities/game'

import { cricketEngine } from '../lib/cricket-engine'
import { aroundTheClockEngine } from '../lib/solo/around-the-clock-engine'
import { bobs27Engine } from '../lib/solo/bobs-27-engine'
import { bullChallengeEngine } from '../lib/solo/bull-challenge-engine'
import { checkout121Engine } from '../lib/solo/checkout-121-engine'
import { hundredAt20Engine } from '../lib/solo/hundred-at-20-engine'
import { jdcChallengeEngine } from '../lib/solo/jdc-challenge-engine'
import { shanghaiEngine } from '../lib/solo/shanghai-engine'
import { x01SoloEngine } from '../lib/solo/x01-solo-engine'
import { x01Engine } from '../lib/x01-engine'
import type { GameDefinition, GameRulesEngine } from './types'

export const MULTIPLAYER_GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'x01-501-double-out',
    name: '501 (double-out)',
    description: 'Финиш только удвоением или Bull 50',
    group: '501',
    groupLabel: '501',
    category: 'multiplayer',
    mode: 'x01',
    config: { mode: 'x01', target: 501, variant: 'double-out' },
  },
  {
    id: 'x01-501-straight-out',
    name: '501 (без double-out)',
    description: 'Финиш любым попаданием на 0',
    group: '501',
    groupLabel: '501',
    category: 'multiplayer',
    mode: 'x01',
    config: { mode: 'x01', target: 501, variant: 'straight-out' },
  },
  {
    id: 'x01-301-double-out',
    name: '301 (double-out)',
    description: 'Финиш только удвоением или Bull 50',
    group: '301',
    groupLabel: '301',
    category: 'multiplayer',
    mode: 'x01',
    config: { mode: 'x01', target: 301, variant: 'double-out' },
  },
  {
    id: 'x01-301-straight-out',
    name: '301 (без double-out)',
    description: 'Финиш любым попаданием на 0',
    group: '301',
    groupLabel: '301',
    category: 'multiplayer',
    mode: 'x01',
    config: { mode: 'x01', target: 301, variant: 'straight-out' },
  },
  {
    id: 'cricket',
    name: 'Крикет',
    description: 'Закройте 15–20 и Bull, набирайте очки',
    group: 'cricket',
    groupLabel: 'Крикет',
    category: 'multiplayer',
    mode: 'cricket',
    config: { mode: 'cricket' },
  },
]

export const SOLO_GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'around-the-clock',
    name: 'Around the Clock',
    description: 'Одинарные 1→20→Bull, 3 дротика на сектор',
    group: 'solo-accuracy',
    groupLabel: 'Точность',
    category: 'solo',
    mode: 'around-the-clock',
    config: { mode: 'around-the-clock' },
  },
  {
    id: 'bobs-27',
    name: "Bob's 27",
    description: 'Даблы D1→D20→Bull, старт с 27 очков',
    group: 'solo-doubles',
    groupLabel: 'Даблы',
    category: 'solo',
    mode: 'bobs-27',
    config: { mode: 'bobs-27' },
  },
  {
    id: 'cricket-practice',
    name: 'Cricket Practice',
    description: 'Закрой 15–20 и Bull в одиночку',
    group: 'solo-cricket',
    groupLabel: 'Крикет',
    category: 'solo',
    mode: 'cricket-practice',
    config: { mode: 'cricket-practice' },
  },
  {
    id: 'checkout-121',
    name: '121 Checkout',
    description: 'Закончи за 9 дротиков, затем 122…',
    group: 'solo-checkout',
    groupLabel: 'Окончания',
    category: 'solo',
    mode: 'checkout-121',
    config: { mode: 'checkout-121' },
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    description: 'S, D и T за раунд — мгновенная победа',
    group: 'solo-shanghai',
    groupLabel: 'Shanghai',
    category: 'solo',
    mode: 'shanghai',
    config: { mode: 'shanghai' },
  },
  {
    id: 'hundred-at-20',
    name: '100 at 20',
    description: '100 бросков в сектор 20, учёт S/D/T',
    group: 'solo-scoring',
    groupLabel: 'Набор',
    category: 'solo',
    mode: 'hundred-at-20',
    config: { mode: 'hundred-at-20' },
  },
  {
    id: 'bull-challenge-50',
    name: 'Bull Challenge (50)',
    description: '50 дротиков только в Bull',
    group: 'solo-bull',
    groupLabel: 'Центр',
    category: 'solo',
    mode: 'bull-challenge',
    config: {
      mode: 'bull-challenge',
      variant: 'dart-limit',
      dartLimit: 50,
    },
  },
  {
    id: 'bull-challenge-25',
    name: 'Bull Challenge (25)',
    description: 'Попади в Bull 25 раз',
    group: 'solo-bull',
    groupLabel: 'Центр',
    category: 'solo',
    mode: 'bull-challenge',
    config: {
      mode: 'bull-challenge',
      variant: 'hit-target',
      hitTarget: 25,
    },
  },
  {
    id: 'x01-solo-501',
    name: '501 Solo',
    description: '501 с отслеживанием среднего и финишей',
    group: 'solo-x01',
    groupLabel: '501',
    category: 'solo',
    mode: 'x01-solo',
    config: { mode: 'x01-solo', target: 501, variant: 'double-out' },
  },
  {
    id: 'jdc-challenge',
    name: 'JDC Challenge',
    description: 'Around + Doubles + Shanghai + Checkouts',
    group: 'solo-jdc',
    groupLabel: 'JDC',
    category: 'solo',
    mode: 'jdc-challenge',
    config: { mode: 'jdc-challenge' },
  },
]

export const GAME_DEFINITIONS: GameDefinition[] = [
  ...MULTIPLAYER_GAME_DEFINITIONS,
  ...SOLO_GAME_DEFINITIONS,
]

const engines: Record<GameConfig['mode'], GameRulesEngine> = {
  x01: x01Engine,
  cricket: cricketEngine,
  'cricket-practice': cricketEngine,
  'around-the-clock': aroundTheClockEngine,
  'bobs-27': bobs27Engine,
  'checkout-121': checkout121Engine,
  shanghai: shanghaiEngine,
  'hundred-at-20': hundredAt20Engine,
  'bull-challenge': bullChallengeEngine,
  'x01-solo': x01SoloEngine,
  'jdc-challenge': jdcChallengeEngine,
}

export function getGameDefinition(gameId: string): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.id === gameId)
}

export function getGameEngine(config: GameConfig): GameRulesEngine {
  return engines[config.mode]
}

export function getMaxThrowsPerTurn(session: import('@/entities/game').GameSession): number {
  const engine = getGameEngine(session.config)
  return engine.getMaxThrowsPerTurn?.(session) ?? 3
}

export function getGameDefinitionsByCategory(
  category: GameDefinition['category'],
): GameDefinition[] {
  return GAME_DEFINITIONS.filter((game) => game.category === category)
}

export function getGameGroups(category?: GameDefinition['category']): Array<{
  group: string
  groupLabel: string
  games: GameDefinition[]
}> {
  const games = category
    ? getGameDefinitionsByCategory(category)
    : GAME_DEFINITIONS
  const groups = new Map<string, GameDefinition[]>()

  for (const game of games) {
    const existing = groups.get(game.group) ?? []
    existing.push(game)
    groups.set(game.group, existing)
  }

  return Array.from(groups.entries()).map(([group, groupGames]) => ({
    group,
    groupLabel: groupGames[0]?.groupLabel ?? group,
    games: groupGames,
  }))
}
