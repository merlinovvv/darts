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
    <main className="flex min-h-dvh flex-col gap-6 p-4 pb-6">
      <div className="space-y-2 pt-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-green">
          Самому
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Тренировки</h1>
        <p className="text-muted-foreground">
          Практика точности, даблов, окончаний и набора
        </p>
      </div>

      <SelectSoloGame
        selectedGameId={selectedGameId}
        onSelect={setSelectedGameId}
      />

      <div className="mt-auto flex gap-2 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(ROUTES.home)}
        >
          Назад
        </Button>
        <Button
          variant="inverse"
          className="flex-1 font-bold uppercase tracking-wide"
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
