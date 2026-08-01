import { UserMinus } from 'lucide-react'
import { useState } from 'react'

import {
  canRemovePlayer,
  isPlayerRemoved,
  useActiveSession,
  useGameStore,
} from '@/entities/game'
import type { Player } from '@/entities/player'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

interface RemovePlayerButtonProps {
  player: Player
}

export function RemovePlayerButton({ player }: RemovePlayerButtonProps) {
  const session = useActiveSession()
  const removePlayer = useGameStore((state) => state.removePlayer)
  const [open, setOpen] = useState(false)

  if (!session) {
    return null
  }

  const removed = isPlayerRemoved(session, player.id)
  const canRemove = canRemovePlayer(session, player.id)

  if (removed || !canRemove) {
    return null
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground"
        aria-label={`Убрать ${player.name} из партии`}
        onClick={() => setOpen(true)}
      >
        <UserMinus className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Убрать игрока из партии?</DialogTitle>
            <DialogDescription>
              {player.name} больше не будет участвовать в ходах. Игрок останется
              в списке со статусом «Вышел», его счёт сохранится.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                removePlayer(player.id)
                setOpen(false)
              }}
            >
              Убрать из партии
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
