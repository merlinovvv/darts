import type { CricketSectorCellStatus } from '@/entities/game-rules'
import { cn } from '@/shared/lib'

interface CricketMarksProps {
  marks: number
  status: CricketSectorCellStatus
  /** Подсветить марки зелёным после последнего броска в этот сектор. */
  highlightLast?: boolean
}

/** Три полоски-марки для сектора крикета. */
export function CricketMarks({
  marks,
  status,
  highlightLast = false,
}: CricketMarksProps) {
  const filled = Math.min(3, Math.max(0, marks))

  return (
    <div className="flex items-center justify-center gap-0.5" aria-hidden>
      {[0, 1, 2].map((index) => {
        const isFilled = index < filled
        const isNewestMark = highlightLast && isFilled && index === filled - 1

        return (
          <span
            key={index}
            className={cn(
              'h-1 w-3.5 rounded-full',
              !isFilled && 'bg-muted-foreground/25',
              isFilled &&
                !highlightLast &&
                status === 'closed-all' &&
                'bg-destructive',
              isFilled &&
                !highlightLast &&
                status === 'closed-player' &&
                'bg-hub-green',
              isFilled &&
                !highlightLast &&
                status === 'open' &&
                'bg-foreground/85',
              isFilled && highlightLast && 'bg-hub-green',
              isNewestMark && 'bg-hub-green shadow-[0_0_6px_var(--hub-green)]',
            )}
          />
        )
      })}
    </div>
  )
}
