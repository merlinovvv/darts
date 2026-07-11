import { useGameStore } from '@/entities/game'
import { UndoThrowButton } from '@/features/undo-throw'
import { GameStatistics } from '@/widgets/game-statistics'
import { VictoryFireworks } from '@/widgets/victory-fireworks'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

export function GameResultDialog() {
  const session = useGameStore((state) => state.session)
  const abandonGame = useGameStore((state) => state.abandonGame)

  if (!session || session.status !== 'finished') {
    return null
  }

  const isTie = Boolean(session.tiePlayerIds?.length)
  const winner = session.players.find((player) => player.id === session.winnerId)
  const tiePlayers = session.tiePlayerIds
    ?.map((id) => session.players.find((player) => player.id === id)?.name)
    .filter(Boolean)

  return (
    <>
      <Dialog open>
        <DialogContent className="grid max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
            <DialogTitle>
              {isTie ? 'Ничья!' : 'Игра окончена!'}
            </DialogTitle>
            <DialogDescription>
              {isTie
                ? `Ничья между: ${tiePlayers?.join(', ')}`
                : `Победитель: ${winner?.name ?? 'Неизвестно'}`}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
            <GameStatistics session={session} className="pb-4 pt-2" />
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-background px-6 py-4 sm:flex-col">
            <UndoThrowButton />
            <Button
              className="w-full"
              onClick={() => {
                abandonGame()
                window.location.href = '/'
              }}
            >
              На главную
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {!isTie ? <VictoryFireworks className="z-[100]" /> : null}
    </>
  )
}
