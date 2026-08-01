import { useNavigate } from 'react-router-dom'

import {
  DAILY_CHALLENGE_TARGET_SERIES,
  getDailyChallengeGameId,
  toDateKey,
  useDailyChallengeStore,
} from '@/entities/daily-challenge'
import { useGameStore } from '@/entities/game'
import { getGameDefinition } from '@/entities/game-rules'
import { createPlayer } from '@/entities/player'
import { ROUTES } from '@/shared/config/routes'

export function useDailyChallenge() {
  const navigate = useNavigate()
  const record = useDailyChallengeStore((state) => state.record)
  const startGame = useGameStore((state) => state.startGame)

  const dateKey = toDateKey(new Date())
  const gameId = getDailyChallengeGameId(dateKey)
  const definition = getGameDefinition(gameId)
  const isToday = record?.date === dateKey && record.gameId === gameId

  const completedSeries = isToday ? record.sessionIds.length : 0
  const bestScore = isToday ? record.bestScore : 0

  const start = () => {
    if (!definition) {
      return
    }

    startGame(
      definition.id,
      definition.config,
      [createPlayer('Я', 0)],
      'solo',
      'daily-challenge',
    )
    navigate(ROUTES.game)
  }

  return {
    definition,
    completedSeries,
    targetSeries: DAILY_CHALLENGE_TARGET_SERIES,
    isCompleted: completedSeries >= DAILY_CHALLENGE_TARGET_SERIES,
    bestScore,
    start,
  }
}
