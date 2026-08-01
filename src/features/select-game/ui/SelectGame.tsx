import { getGameDefinition, getGameGroups } from '@/entities/game-rules'
import type { GameDefinition } from '@/entities/game-rules'
import { isX01Config } from '@/entities/game'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
  RadioGroup,
  RadioGroupItem,
} from '@/shared/ui'
import { cn } from '@/shared/lib'

interface SelectGameProps {
  selectedGameId: string | null
  onSelect: (gameId: string) => void
}

type X01Variant = 'double-out' | 'straight-out'

function getSelectedGroup(
  groups: ReturnType<typeof getGameGroups>,
  selectedGameId: string | null,
) {
  if (!selectedGameId) {
    return groups[0]?.group ?? null
  }

  return (
    groups
      .find((group) => group.games.some((game) => game.id === selectedGameId))
      ?.group ?? null
  )
}

function getCurrentVariant(selectedGameId: string | null): X01Variant {
  const selected = selectedGameId ? getGameDefinition(selectedGameId) : undefined
  if (selected && isX01Config(selected.config)) {
    return selected.config.variant
  }

  return 'double-out'
}

function findGameByGroupAndVariant(
  games: GameDefinition[],
  variant: X01Variant,
) {
  return games.find(
    (game) => isX01Config(game.config) && game.config.variant === variant,
  )
}

function getGroupDescription(games: GameDefinition[]): string {
  if (games.length === 1) {
    return games[0].description
  }

  return 'Финиш double-out или любым попаданием на 0'
}

export function SelectGame({ selectedGameId, onSelect }: SelectGameProps) {
  const groups = getGameGroups('multiplayer')
  const selectedGroup = getSelectedGroup(groups, selectedGameId)
  const variant = getCurrentVariant(selectedGameId)

  return (
    <RadioGroup
      value={selectedGroup ?? undefined}
      onValueChange={(group) => {
        const groupGames = groups.find((item) => item.group === group)?.games
        if (!groupGames?.length) {
          return
        }

        if (groupGames.length === 1) {
          onSelect(groupGames[0].id)
          return
        }

        const nextVariant = getCurrentVariant(selectedGameId)
        const game = findGameByGroupAndVariant(groupGames, nextVariant)
        if (game) {
          onSelect(game.id)
        }
      }}
      className="space-y-3"
    >
      {groups.map((group) => {
        const isSelected = selectedGroup === group.group
        const hasVariants = group.games.length > 1

        return (
          <FieldLabel
            key={group.group}
            htmlFor={`game-${group.group}`}
            className={cn(
              'rounded-2xl border bg-card p-4 transition-colors',
              isSelected
                ? 'border-hub-green bg-hub-green/10 ring-1 ring-hub-green'
                : 'border-border/70 hover:bg-accent/40',
            )}
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-base">{group.groupLabel}</FieldTitle>
                <FieldDescription>
                  {getGroupDescription(group.games)}
                </FieldDescription>

                {isSelected && hasVariants ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Режим финиша
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className={cn(
                          'min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                          variant === 'double-out'
                            ? 'border-hub-green bg-background text-foreground shadow-sm'
                            : 'border-transparent bg-muted text-muted-foreground',
                        )}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          const game = findGameByGroupAndVariant(
                            group.games,
                            'double-out',
                          )
                          if (game) {
                            onSelect(game.id)
                          }
                        }}
                      >
                        Double-out
                      </button>
                      <button
                        type="button"
                        className={cn(
                          'min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                          variant === 'straight-out'
                            ? 'border-hub-green bg-background text-foreground shadow-sm'
                            : 'border-transparent bg-muted text-muted-foreground',
                        )}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          const game = findGameByGroupAndVariant(
                            group.games,
                            'straight-out',
                          )
                          if (game) {
                            onSelect(game.id)
                          }
                        }}
                      >
                        Без правила
                      </button>
                    </div>
                  </div>
                ) : null}
              </FieldContent>
              <RadioGroupItem
                value={group.group}
                id={`game-${group.group}`}
                className="mt-1"
              />
            </Field>
          </FieldLabel>
        )
      })}
    </RadioGroup>
  )
}
