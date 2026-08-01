import type { DartHit } from '@/entities/dart-sector'
import type { GameSession } from '@/entities/game'
import type { ScoreboardRow } from '@/entities/game-rules'
import { getMaxThrowsPerTurn } from '@/entities/game-rules'
import { AddPlayerForm } from '@/features/add-player'
import { RemovePlayerButton } from '@/features/remove-player'
import { Badge, Card, CardContent, CardHeader, CardTitle, DartboardMark } from '@/shared/ui'
import { cn } from '@/shared/lib'

import { CricketMarks } from './CricketMarks'

/** Порядок ячеек как на макете: 15→20, затем Bull. */
const CRICKET_DISPLAY_LABELS = ['15', '16', '17', '18', '19', '20', 'B'] as const

interface CricketTableProps {
  session: GameSession
  rows: ScoreboardRow[]
}

function hitToCricketLabel(hit: DartHit): string | null {
  if (hit.sector === 25 || hit.sector === 50) {
    return 'B'
  }

  if (
    typeof hit.sector === 'number' &&
    hit.sector >= 15 &&
    hit.sector <= 20
  ) {
    return String(hit.sector)
  }

  return null
}

function getCellClass(status: 'open' | 'closed-player' | 'closed-all') {
  switch (status) {
    case 'closed-all':
      return 'border-destructive/40 bg-destructive/15'
    case 'closed-player':
      return 'border-hub-green/45 bg-hub-green/15'
    default:
      return 'border-border/50 bg-background/30'
  }
}

export function CricketTable({ session, rows }: CricketTableProps) {
  const throwNumber = session.turnThrows.length + 1
  const maxThrows = getMaxThrowsPerTurn(session)
  const lastThrow = session.throwHistory.at(-1)
  const lastThrowLabel = lastThrow ? hitToCricketLabel(lastThrow.hit) : null
  const lastThrowPlayerId = lastThrow?.playerId ?? null

  return (
    <div className="mx-4">
      <Card variant="feature" className="relative overflow-hidden shadow-none">
        <DartboardMark className="pointer-events-none absolute -right-8 top-0 h-44 w-44 text-foreground/[0.07]" />

        <CardHeader className="relative space-y-2 pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-bold">Таблица очков</CardTitle>
            {session.status === 'finished' ? (
              <Badge variant="secondary">Игра окончена</Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-hub-green" />
              — закрыто у игрока
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-destructive" />
              — закрыто у всех
            </span>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-3">
          {rows.map((row) => {
            const player = session.players.find(
              (sessionPlayer) => sessionPlayer.id === row.playerId,
            )
            const isActive =
              row.isCurrent && !row.isRemoved && session.status === 'active'

            return (
              <div
                key={row.playerId}
                className={cn(
                  'rounded-2xl border border-border/70 bg-card/80 p-3',
                  isActive &&
                    'border-hub-green bg-hub-green/10 ring-1 ring-hub-green/40',
                  row.isRemoved && 'border-dashed opacity-60',
                  !isActive && !row.isRemoved && 'opacity-75',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-start gap-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'font-semibold',
                            row.isRemoved &&
                              'text-muted-foreground line-through',
                          )}
                        >
                          {row.playerName}
                        </span>
                        {isActive ? (
                          <Badge className="rounded-full bg-hub-green text-[10px] font-semibold text-background">
                            Бросает · {Math.min(throwNumber, maxThrows)}-й
                          </Badge>
                        ) : null}
                        {row.isRemoved ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal"
                          >
                            Вышел из партии
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    {player && !row.isRemoved ? (
                      <RemovePlayerButton player={player} />
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-extrabold leading-none tabular-nums">
                      {row.primary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.secondary ?? 'очков'}
                    </p>
                  </div>
                </div>

                {row.cricketDetails ? (
                  <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                    {CRICKET_DISPLAY_LABELS.map((label) => {
                      const detail = row.cricketDetails?.[label]
                      if (!detail) {
                        return null
                      }

                      const isLastThrow =
                        lastThrowLabel === label &&
                        lastThrowPlayerId === row.playerId

                      return (
                        <div
                          key={label}
                          className={cn(
                            'rounded-xl border px-1.5 py-2 text-center transition-colors',
                            getCellClass(detail.status),
                            detail.status === 'closed-all' &&
                              !isLastThrow &&
                              'bg-[repeating-linear-gradient(-45deg,transparent,transparent_3px,rgba(220,38,38,0.12)_3px,rgba(220,38,38,0.12)_6px)]',
                            isLastThrow &&
                              'border-hub-green bg-hub-green/35 ring-2 ring-hub-green',
                          )}
                        >
                          <p
                            className={cn(
                              'text-sm font-bold',
                              isLastThrow && 'text-hub-green',
                              !isLastThrow &&
                                detail.status === 'closed-player' &&
                                'text-hub-green',
                              !isLastThrow &&
                                detail.status === 'closed-all' &&
                                'text-destructive',
                            )}
                          >
                            {label}
                          </p>
                          <div className="mt-1.5">
                            <CricketMarks
                              marks={detail.marks}
                              status={detail.status}
                              highlightLast={isLastThrow}
                            />
                          </div>
                          <p
                            className={cn(
                              'mt-1 text-[11px] tabular-nums text-muted-foreground',
                              isLastThrow && 'font-semibold text-hub-green',
                            )}
                          >
                            {detail.points}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}

          <AddPlayerForm compact />
        </CardContent>
      </Card>
    </div>
  )
}
