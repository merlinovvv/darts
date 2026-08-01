import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useActiveSession, useGameStore } from '@/entities/game'
import { ROUTES } from '@/shared/config/routes'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

export function ResumeGameDialog() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useActiveSession()
  const abandonGame = useGameStore((state) => state.abandonGame)
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(() =>
    useGameStore.persist.hasHydrated(),
  )
  const hasEvaluatedResume = useRef(false)

  useEffect(() => {
    if (useGameStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }

    return useGameStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!hydrated || hasEvaluatedResume.current) {
      return
    }

    hasEvaluatedResume.current = true

    if (location.pathname === ROUTES.game) {
      return
    }

    if (session?.status === 'active') {
      setOpen(true)
    }
  }, [hydrated, location.pathname, session?.status])

  const handleDismiss = () => {
    setOpen(false)
  }

  if (!session || session.status !== 'active') {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Продолжить игру?</DialogTitle>
          <DialogDescription>
            Найдена незавершённая игра. Хотите продолжить с сохранённого места
            или начать новую?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              abandonGame()
              handleDismiss()
            }}
          >
            Начать новую
          </Button>
          <Button
            variant="inverse"
            className="font-bold uppercase tracking-wide"
            onClick={() => {
              handleDismiss()
              navigate(ROUTES.game)
            }}
          >
            Продолжить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
