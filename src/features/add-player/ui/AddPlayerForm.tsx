import { Plus, UserPlus } from 'lucide-react'
import { useState } from 'react'

import { canAddPlayer, useActiveSession, useGameStore } from '@/entities/game'
import { Button, Input } from '@/shared/ui'
import { cn } from '@/shared/lib'

interface AddPlayerFormProps {
  /** Компактный вид для таблицы крикета. */
  compact?: boolean
}

export function AddPlayerForm({ compact = false }: AddPlayerFormProps) {
  const session = useActiveSession()
  const addPlayer = useGameStore((state) => state.addPlayer)
  const [name, setName] = useState('')

  if (!session || !canAddPlayer(session)) {
    return null
  }

  const handleAdd = () => {
    addPlayer(name)
    setName('')
  }

  return (
    <div className={cn('space-y-2', compact ? 'pt-1' : 'border-t pt-3')}>
      {!compact ? (
        <p className="text-xs text-muted-foreground">
          Новый игрок встанет в конец очереди с начальным счётом
        </p>
      ) : null}
      <div className="flex gap-2">
        <Input
          placeholder={compact ? 'Новый игрок' : 'Имя игрока'}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAdd()
            }
          }}
          aria-label="Имя нового игрока"
        />
        <Button
          type="button"
          variant={compact ? 'default' : 'secondary'}
          className={cn(
            compact &&
              'bg-hub-green font-semibold text-background hover:bg-hub-green/90',
          )}
          onClick={handleAdd}
        >
          {compact ? <Plus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          Добавить
        </Button>
      </div>
    </div>
  )
}
