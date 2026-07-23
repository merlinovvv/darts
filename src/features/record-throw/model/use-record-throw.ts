import { useState } from 'react'

import {
  type DartHit,
  type WedgeSelection,
} from '@/entities/dart-sector'
import { useGameStore } from '@/entities/game'
import { getMaxThrowsPerTurn } from '@/entities/game-rules'

export function useRecordThrow() {
  const recordThrow = useGameStore((state) => state.recordThrow)
  const session = useGameStore((state) => state.session)
  const [pendingSelection, setPendingSelection] = useState<WedgeSelection | null>(
    null,
  )

  const maxThrows = session ? getMaxThrowsPerTurn(session) : 3

  const isDisabled =
    !session ||
    session.status !== 'active' ||
    session.turnThrows.length >= maxThrows

  const handleWedgeSelect = (selection: WedgeSelection) => {
    if (isDisabled) {
      return
    }

    setPendingSelection(selection)
  }

  const handleConfirmHit = (hit: DartHit) => {
    if (!isDisabled) {
      recordThrow(hit)
      setPendingSelection(null)
    }
  }

  const cancelPending = () => {
    setPendingSelection(null)
  }

  return {
    handleWedgeSelect,
    handleConfirmHit,
    cancelPending,
    pendingSelection,
    isDisabled,
    turnThrows: session?.turnThrows ?? [],
  }
}
