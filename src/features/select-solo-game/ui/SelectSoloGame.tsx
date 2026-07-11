import { getGameGroups } from '@/entities/game-rules'
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle, RadioGroup, RadioGroupItem } from '@/shared/ui'
import { cn } from '@/shared/lib'

interface SelectSoloGameProps {
  selectedGameId: string | null
  onSelect: (gameId: string) => void
}

export function SelectSoloGame({ selectedGameId, onSelect }: SelectSoloGameProps) {
  const groups = getGameGroups('solo')

  return (
    <RadioGroup
      value={selectedGameId ?? undefined}
      onValueChange={onSelect}
      className="space-y-3"
    >
      {groups.flatMap((group) =>
        group.games.map((game) => {
          const isSelected = selectedGameId === game.id

          return (
            <FieldLabel
              key={game.id}
              htmlFor={`solo-game-${game.id}`}
              className={cn(
                'rounded-xl border p-4 transition-colors',
                isSelected
                  ? 'border-foreground bg-muted/50 ring-1 ring-foreground'
                  : 'border-border hover:bg-muted/30',
              )}
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle className="text-base">{game.name}</FieldTitle>
                  <FieldDescription>{game.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  value={game.id}
                  id={`solo-game-${game.id}`}
                  className="mt-1"
                />
              </Field>
            </FieldLabel>
          )
        }),
      )}
    </RadioGroup>
  )
}
