import { useEffect } from 'react'

import { useAchievementsStore } from '@/entities/achievements'
import { toDateKey, useDailyChallengeStore } from '@/entities/daily-challenge'
import { useActiveSession } from '@/entities/game'
import { useGameHistoryStore } from '@/entities/game-history'

import { toHistoryEntry } from '../lib/to-history-entry'

/**
 * Переносит завершённую партию в историю и обновляет прогресс испытания дня.
 * Обе записи идемпотентны по id сессии.
 */
export function useFinishGameEffects() {
  const session = useActiveSession()
  const recordGame = useGameHistoryStore((state) => state.recordGame)
  const registerSeries = useDailyChallengeStore((state) => state.registerSeries)
  const syncFromHistory = useAchievementsStore((state) => state.syncFromHistory)

  useEffect(() => {
    if (!session || session.status !== 'finished') {
      return
    }

    const entry = toHistoryEntry(session, new Date().toISOString())
    recordGame(entry)

    if (session.source === 'daily-challenge') {
      registerSeries({
        date: toDateKey(new Date()),
        gameId: session.gameId,
        sessionId: session.id,
        score: entry.players.reduce((sum, player) => sum + player.score, 0),
      })
    }

    const history = useGameHistoryStore.getState().entries
    syncFromHistory(history)
  }, [session, recordGame, registerSeries, syncFromHistory])
}
