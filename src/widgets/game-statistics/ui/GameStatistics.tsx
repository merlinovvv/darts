import type { GameSession } from '@/entities/game'
import { getPlayerHitSummaries } from '@/entities/game'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib'

interface GameStatisticsProps {
  session: GameSession
  className?: string
}

export function GameStatistics({ session, className }: GameStatisticsProps) {
  const summaries = getPlayerHitSummaries(session)

  return (
    <div className={cn('space-y-4', className)}>
      <p className="text-sm font-medium">Статистика бросков</p>

      {summaries.map((summary) => (
        <div
          key={summary.playerId}
          className={cn(
            'rounded-lg border p-3',
            summary.isWinner && 'border-foreground bg-muted/30',
            summary.isRemoved && 'border-dashed opacity-80',
          )}
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'font-medium',
                summary.isRemoved && 'text-muted-foreground line-through',
              )}
            >
              {summary.playerName}
            </span>
            {summary.isWinner ? (
              <Badge className="text-[10px] font-normal">Победитель</Badge>
            ) : null}
            {summary.isRemoved ? (
              <Badge variant="outline" className="text-[10px] font-normal">
                Вышел
              </Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {summary.totalThrows} бросков · {summary.totalScore} очков
            </span>
          </div>

          {summary.turns.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет бросков</p>
          ) : (
            <div className="space-y-2">
              {summary.turns.map((turn) => (
                <div key={`${summary.playerId}-${turn.turnIndex}`}>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Ход {turn.turnIndex}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {turn.hits.map((hit) => (
                      <Badge
                        key={hit.id}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {hit.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
