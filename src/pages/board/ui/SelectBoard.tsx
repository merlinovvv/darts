import {
  BOARD_THEMES,
  useBoardThemeStore,
  type BoardThemeId,
} from '@/entities/board-theme'
import { Dartboard } from '@/widgets/dartboard'
import { cn } from '@/shared/lib'

export function SelectBoard() {
  const selectedThemeId = useBoardThemeStore((state) => state.selectedThemeId)
  const setThemeId = useBoardThemeStore((state) => state.setThemeId)

  return (
    <ul className="grid grid-cols-1 gap-3">
      {BOARD_THEMES.map((theme) => {
        const selected = selectedThemeId === theme.id

        return (
          <li key={theme.id}>
            <button
              type="button"
              onClick={() => setThemeId(theme.id as BoardThemeId)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-colors',
                selected
                  ? 'border-hub-green bg-hub-green/10 ring-1 ring-hub-green'
                  : 'border-border/70 hover:bg-accent/40',
              )}
            >
              <div className="w-24 shrink-0 sm:w-28">
                <Dartboard preview palette={theme.palette} className="max-w-none" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-base font-bold">{theme.name}</p>
                <p className="text-sm text-muted-foreground">
                  {theme.description}
                </p>
                {selected ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-hub-green">
                    Выбрано
                  </p>
                ) : null}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
