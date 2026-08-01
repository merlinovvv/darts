import { formatDartHit } from '@/entities/dart-sector'
import { useActiveSession } from '@/entities/game'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib'

export function ThrowFeedback() {
  const session = useActiveSession()

  if (!session || session.status !== 'active') {
    return null
  }

  const lastThrow = session.throwHistory.at(-1)
  const lastHitLabel = lastThrow ? formatDartHit(lastThrow.hit) : null

  return (
    <div className="space-y-3 px-4">
      <div
        className={cn(
          'rounded-xl border-2 px-4 py-4 text-center transition-all',
          lastHitLabel
            ? 'border-hub-green bg-hub-green text-background'
            : 'border-dashed border-muted-foreground/40 bg-card text-muted-foreground',
        )}
      >
        <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
          Последний бросок
        </p>
        <p className="mt-1 text-3xl font-bold">
          {lastHitLabel ?? '—'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {session.turnThrows.length === 0 ? (
          <Badge variant="outline">В этом ходе пока нет бросков</Badge>
        ) : (
          session.turnThrows.map((hit, index) => (
            <Badge
              key={`${index}-${formatDartHit(hit)}`}
              variant={index === session.turnThrows.length - 1 ? 'default' : 'secondary'}
              className="min-h-[32px] px-3 text-sm"
            >
              {index + 1}. {formatDartHit(hit)}
            </Badge>
          ))
        )}
      </div>
    </div>
  )
}
