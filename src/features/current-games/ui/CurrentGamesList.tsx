import { ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { GameSession } from '@/entities/game'
import { getActivePlayers, useGameStore, useOpenSessions } from '@/entities/game'
import { getGameDefinition } from '@/entities/game-rules'
import { ROUTES } from '@/shared/config/routes'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

function getSessionSummary(session: GameSession): string {
  if (session.category === 'solo') {
    return `Бросков: ${session.throwHistory.length}`
  }

  const names = getActivePlayers(session)
    .map((player) => player.name)
    .join(', ')

  return `${names} · ход ${session.turnNumber}`
}

export function CurrentGamesList() {
  const navigate = useNavigate()
  const sessions = useOpenSessions()
  const setActiveSession = useGameStore((state) => state.setActiveSession)
  const removeSession = useGameStore((state) => state.removeSession)
  const [sessionToRemove, setSessionToRemove] = useState<GameSession | null>(
    null,
  )

  if (sessions.length === 0) {
    return null
  }

  const pendingName =
    sessionToRemove != null
      ? (getGameDefinition(sessionToRemove.gameId)?.name ??
        sessionToRemove.gameId)
      : ''

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Текущие игры ({sessions.length})
      </p>

      <ul className="space-y-1.5">
        {sessions.map((session) => {
          const definition = getGameDefinition(session.gameId)

          return (
            <li key={session.id} className="flex items-center gap-1">
              <button
                type="button"
                className="flex min-h-[44px] flex-1 items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-left transition-colors hover:bg-accent/60"
                onClick={() => {
                  setActiveSession(session.id)
                  navigate(ROUTES.game)
                }}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">
                      {definition?.name ?? session.gameId}
                    </span>
                    {session.status === 'waiting' ? (
                      <Badge variant="secondary" className="shrink-0 font-normal">
                        Пауза
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {getSessionSummary(session)}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground"
                aria-label={`Удалить игру ${definition?.name ?? session.gameId}`}
                onClick={() => setSessionToRemove(session)}
              >
                <X />
              </Button>
            </li>
          )
        })}
      </ul>

      <Dialog
        open={sessionToRemove !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSessionToRemove(null)
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить игру?</DialogTitle>
            <DialogDescription>
              Партия «{pendingName}» будет удалена без возможности восстановления.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSessionToRemove(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (sessionToRemove) {
                  removeSession(sessionToRemove.id)
                }
                setSessionToRemove(null)
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
