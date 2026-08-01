import type { GameHistoryEntry } from '@/entities/game-history'
import { getHistoryTotals } from '@/entities/game-history'

import type { AchievementId } from '../model/types'

/** Возвращает id достижений, которые уже выполнены по истории игр. */
export function evaluateAchievements(
  entries: GameHistoryEntry[],
): AchievementId[] {
  const totals = getHistoryTotals(entries)
  const unlocked: AchievementId[] = []

  if (totals.games >= 1) {
    unlocked.push('first-game')
  }

  if (entries.some((entry) => entry.players.some((player) => player.isWinner))) {
    unlocked.push('first-win')
  }

  if (totals.throws >= 100) {
    unlocked.push('throws-100')
  }

  if (totals.throws >= 500) {
    unlocked.push('throws-500')
  }

  if (totals.dailySeries >= 3) {
    unlocked.push('daily-3')
  }

  if (totals.soloGames >= 5) {
    unlocked.push('solo-5')
  }

  const multiplayerGames = entries.filter(
    (entry) => entry.category === 'multiplayer',
  ).length

  if (multiplayerGames >= 5) {
    unlocked.push('multiplayer-5')
  }

  const x01Games = entries.filter((entry) => entry.mode === 'x01' || entry.mode === 'x01-solo').length

  if (x01Games >= 3) {
    unlocked.push('favourite-x01')
  }

  return unlocked
}
