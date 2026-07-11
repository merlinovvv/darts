import { Undo2 } from 'lucide-react'

import { useGameStore } from '@/entities/game'
import { Button } from '@/shared/ui'

interface UndoThrowButtonProps {
  className?: string
}

export function UndoThrowButton({ className }: UndoThrowButtonProps) {
  const session = useGameStore((state) => state.session)
  const undoStack = useGameStore((state) => state.undoStack)
  const undoLastThrow = useGameStore((state) => state.undoLastThrow)

  if (!session) {
    return null
  }

  const canUndo = undoStack.length > 0

  return (
    <Button
      type="button"
      variant="outline"
      className={className ?? 'w-full'}
      disabled={!canUndo}
      onClick={undoLastThrow}
    >
      <Undo2 />
      Отменить бросок
    </Button>
  )
}
