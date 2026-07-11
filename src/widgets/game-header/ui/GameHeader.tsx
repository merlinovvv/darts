import { useNavigate } from 'react-router-dom'

import { getGameDefinition } from '@/entities/game-rules'
import { useGameStore } from '@/entities/game'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function GameHeader() {
  const navigate = useNavigate()
  const session = useGameStore((state) => state.session)
  const abandonGame = useGameStore((state) => state.abandonGame)

  if (!session) {
    return null
  }

  const definition = getGameDefinition(session.gameId)

  return (
    <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Текущая игра
        </p>
        <h1 className="text-lg font-semibold">
          {definition?.name ?? session.gameId}
        </h1>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          abandonGame()
          navigate(ROUTES.home)
        }}
      >
        Новая игра
      </Button>
    </header>
  )
}
