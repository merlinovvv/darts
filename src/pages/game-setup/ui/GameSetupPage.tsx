import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { ManagePlayers } from '@/features/manage-players'
import { getGameDefinition } from '@/entities/game-rules'
import { useGameStore } from '@/entities/game'
import { createPlayer, type Player } from '@/entities/player'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function GameSetupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('game')
  const pendingGameId = useGameStore((state) => state.pendingGameId)
  const startGame = useGameStore((state) => state.startGame)

  const resolvedGameId = gameId ?? pendingGameId
  const definition = useMemo(
    () => (resolvedGameId ? getGameDefinition(resolvedGameId) : undefined),
    [resolvedGameId],
  )

  const [players, setPlayers] = useState<Player[]>([
    createPlayer('Игрок 1', 0),
    createPlayer('Игрок 2', 1),
  ])

  if (!resolvedGameId || !definition) {
    return <Navigate to={ROUTES.home} replace />
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 p-4">
      <div className="space-y-2 pt-4">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Настройка
        </p>
        <h1 className="text-3xl font-bold">{definition.name}</h1>
        <p className="text-muted-foreground">{definition.description}</p>
      </div>

      <ManagePlayers players={players} onChange={setPlayers} />

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
          onClick={() => {
            startGame(definition.id, definition.config, players, 'multiplayer')
            navigate(ROUTES.game)
          }}
        >
          Начать игру
        </Button>
      </div>
    </main>
  )
}
