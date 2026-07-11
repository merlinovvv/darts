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

function getCurrentVariant(
  selectedGameId: string | null,
): 'double-out' | 'straight-out' {
  const selected = selectedGameId ? getGameDefinition(selectedGameId) : undefined
  if (selected && isX01Config(selected.config)) {
    return selected.config.variant
  }

  return 'double-out'
}

function getVariantForGroup(
  games: GameDefinition[],
  selectedGameId: string | null,
): 'double-out' | 'straight-out' {
  const selected = games.find((game) => game.id === selectedGameId)
  if (selected && isX01Config(selected.config)) {
    return selected.config.variant
  }

  return getCurrentVariant(selectedGameId)
}

function findGameByGroupAndVariant(
  games: GameDefinition[],
  variant: 'double-out' | 'straight-out',
) {
  return games.find(
    (game) => isX01Config(game.config) && game.config.variant === variant,
  )
}

export function SelectGame({ selectedGameId, onSelect }: SelectGameProps) {
  const groups = getGameGroups('multiplayer')
  const selectedGroup = getSelectedGroup(groups, selectedGameId)

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

        const variant = getCurrentVariant(selectedGameId)
        const game = findGameByGroupAndVariant(groupGames, variant)
        if (game) {
          onSelect(game.id)
        }
      }}
      className="space-y-3"
    >
      {groups.map((group) => {
        const isSelected = selectedGroup === group.group
        const isX01 = group.games.length > 1
        const variant = isX01
          ? getVariantForGroup(group.games, selectedGameId)
          : null
        const activeGame =
          group.games.find((game) => game.id === selectedGameId) ??
          findGameByGroupAndVariant(group.games, variant ?? 'double-out') ??
          group.games[0]

        return (
          <FieldLabel
            key={group.group}
            htmlFor={`game-${group.group}`}
            className={cn(
              'rounded-xl border p-4 transition-colors',
              isSelected
                ? 'border-foreground bg-muted/50 ring-1 ring-foreground'
                : 'border-border hover:bg-muted/30',
            )}
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-base">{group.groupLabel}</FieldTitle>
                <FieldDescription>{activeGame.description}</FieldDescription>

                {isX01 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={cn(
                        'min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                        variant === 'double-out'
                          ? 'border-foreground bg-background text-foreground shadow-sm'
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
                        'min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                        variant === 'straight-out'
                          ? 'border-foreground bg-background text-foreground shadow-sm'
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
