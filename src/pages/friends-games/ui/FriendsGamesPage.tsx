import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SelectGame } from '@/features/select-game'
import { MULTIPLAYER_GAME_DEFINITIONS } from '@/entities/game-rules'
import { useGameStore } from '@/entities/game'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function FriendsGamesPage() {
  const navigate = useNavigate()
  const setPendingGameId = useGameStore((state) => state.setPendingGameId)
  const [selectedGameId, setSelectedGameId] = useState(
    MULTIPLAYER_GAME_DEFINITIONS[0]?.id ?? null,
  )

  useEffect(() => {
    if (selectedGameId) {
      setPendingGameId(selectedGameId)
    }
  }, [selectedGameId, setPendingGameId])

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 p-4">
      <div className="space-y-2 pt-4">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          С друзьями
        </p>
        <h1 className="text-3xl font-bold">Выберите игру</h1>
        <p className="text-muted-foreground">301, 501 и Крикет для компании</p>
      </div>

      <SelectGame
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
            if (selectedGameId) {
              setPendingGameId(selectedGameId)
              navigate(`${ROUTES.setup}?game=${selectedGameId}`)
            }
          }}
        >
          Настроить игроков
        </Button>
      </div>
    </main>
  )
}
