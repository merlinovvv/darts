import { UserPlus } from 'lucide-react'
import { useState } from 'react'

import { canAddPlayer, useGameStore } from '@/entities/game'
import { Button, Input } from '@/shared/ui'

export function AddPlayerForm() {
  const session = useGameStore((state) => state.session)
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
    <div className="space-y-2 border-t pt-3">
      <p className="text-xs text-muted-foreground">
        Новый игрок встанет в конец очереди с начальным счётом
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Имя игрока"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAdd()
            }
          }}
          aria-label="Имя нового игрока"
        />
        <Button type="button" variant="secondary" onClick={handleAdd}>
          <UserPlus className="h-4 w-4" />
          Добавить
        </Button>
      </div>
    </div>
  )
}
