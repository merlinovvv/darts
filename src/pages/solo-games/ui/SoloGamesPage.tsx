import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SelectSoloGame } from '@/features/select-solo-game'
import { getGameDefinition, SOLO_GAME_DEFINITIONS } from '@/entities/game-rules'
import { useGameStore } from '@/entities/game'
import { createPlayer } from '@/entities/player'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function SoloGamesPage() {
  const navigate = useNavigate()
  const startGame = useGameStore((state) => state.startGame)
  const [selectedGameId, setSelectedGameId] = useState(
    SOLO_GAME_DEFINITIONS[0]?.id ?? null,
  )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 p-4">
      <div className="space-y-2 pt-4">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Самому
        </p>
        <h1 className="text-3xl font-bold">Тренировки</h1>
        <p className="text-muted-foreground">
          Практика точности, даблов, окончаний и набора
        </p>
      </div>

      <SelectSoloGame
        selectedGameId={selectedGameId}
        onSelect={setSelectedGameId}
      />

      <div className="mt-auto flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(ROUTES.home)}
        >
          Назад
        </Button>
        <Button
          className="flex-1"
          disabled={!selectedGameId}
          onClick={() => {
            const definition = selectedGameId
              ? getGameDefinition(selectedGameId)
              : undefined

            if (!definition) {
              return
            }

            startGame(
              definition.id,
              definition.config,
              [createPlayer('Я', 0)],
              'solo',
            )
            navigate(ROUTES.game)
          }}
        >
          Начать
        </Button>
      </div>
    </main>
  )
}
