import { useActiveSession, useGameStore } from '@/entities/game'
import { getMaxThrowsPerTurn } from '@/entities/game-rules'
import { UndoThrowButton } from '@/features/undo-throw'
import { Button } from '@/shared/ui'

export function EndTurnButton() {
  const session = useActiveSession()
  const endTurn = useGameStore((state) => state.endTurn)

  if (!session || session.status !== 'active') {
    return null
  }

  const maxThrows = getMaxThrowsPerTurn(session)
  const canEnd = session.turnThrows.length < maxThrows

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-border/70 px-4 py-2">
      <UndoThrowButton className="w-full" />
      <Button
        className="w-full"
        variant="outline"
        disabled={!canEnd}
        onClick={endTurn}
      >
        Завершить ход
      </Button>
    </div>
  )
}
