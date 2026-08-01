import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { createPlayer, getDefaultPlayerName, isDefaultPlayerName, type Player } from '@/entities/player'
import { Button, Input } from '@/shared/ui'

interface ManagePlayersProps {
  players: Player[]
  onChange: (players: Player[]) => void
}

function reorder(players: Player[]): Player[] {
  return players.map((player, index) => ({ ...player, order: index }))
}

export function ManagePlayers({ players, onChange }: ManagePlayersProps) {
  const [name, setName] = useState('')

  const addPlayer = () => {
    const next = createPlayer(name, players.length)
    onChange(reorder([...players, next]))
    setName('')
  }

  const removePlayer = (id: string) => {
    if (players.length <= 2) {
      return
    }
    onChange(reorder(players.filter((player) => player.id !== id)))
  }

  const movePlayer = (id: string, direction: -1 | 1) => {
    const index = players.findIndex((player) => player.id === id)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= players.length) {
      return
    }

    const next = [...players]
    const [item] = next.splice(index, 1)
    next.splice(targetIndex, 0, item)
    onChange(reorder(next))
  }

  const updateName = (id: string, value: string) => {
    onChange(
      players.map((player) =>
        player.id === id ? { ...player, name: value } : player,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center gap-2 rounded-xl border border-border/70 bg-card p-2"
          >
            <span className="w-6 text-center text-sm text-muted-foreground">
              {index + 1}
            </span>
            <Input
              value={player.name}
              placeholder={getDefaultPlayerName(player.order)}
              onChange={(event) => updateName(player.id, event.target.value)}
              onFocus={() => {
                if (isDefaultPlayerName(player.name, player.order)) {
                  updateName(player.id, '')
                }
              }}
              onBlur={() => {
                if (!player.name.trim()) {
                  updateName(player.id, getDefaultPlayerName(player.order))
                }
              }}
              aria-label={`Имя игрока ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => movePlayer(player.id, -1)}
              disabled={index === 0}
            >
              <ChevronUp />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => movePlayer(player.id, 1)}
              disabled={index === players.length - 1}
            >
              <ChevronDown />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removePlayer(player.id)}
              disabled={players.length <= 2}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Имя игрока"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              addPlayer()
            }
          }}
        />
        <Button type="button" variant="inverse" onClick={addPlayer}>
          Добавить
        </Button>
      </div>
    </div>
  )
}
