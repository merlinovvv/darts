import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getGameDefinition } from '@/entities/game-rules'
import { useActiveSession, useGameStore } from '@/entities/game'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function GameHeader() {
  const navigate = useNavigate()
  const session = useActiveSession()
  const abandonGame = useGameStore((state) => state.abandonGame)
  const pauseActiveSession = useGameStore((state) => state.pauseActiveSession)

  if (!session) {
    return null
  }

  const definition = getGameDefinition(session.gameId)

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-hub-green">
          Текущая игра
        </p>
        <h1 className="truncate text-lg font-bold">
          {definition?.name ?? session.gameId}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="На главную, игра сохранится"
          onClick={() => {
            pauseActiveSession()
            navigate(ROUTES.home)
          }}
        >
          <Home />
        </Button>
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
      </div>
    </header>
  )
}
