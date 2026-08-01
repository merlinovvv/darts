import { Check, Copy, Users } from 'lucide-react'
import { useState } from 'react'

import { getPlayerRankings, useGameHistoryStore } from '@/entities/game-history'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

export function SocialPage() {
  const entries = useGameHistoryStore((state) => state.entries)
  const rankings = getPlayerRankings(entries)
  const [copied, setCopied] = useState(false)

  const inviteUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://darts.app'

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="flex flex-col gap-5 p-4 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Сообщество</h1>
        <p className="text-sm text-muted-foreground">
          Игроки с этого устройства и приглашение друзей
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-hub-green" />
            Пригласить друга
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Скопируйте ссылку на приложение и отправьте её другу
          </p>
          <p className="truncate rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm">
            {inviteUrl}
          </p>
          <Button
            variant="inverse"
            className="w-full font-bold uppercase tracking-wide"
            onClick={copyInvite}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? 'Скопировано' : 'Скопировать ссылку'}
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Игроки
        </h2>
        {rankings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Сыграйте партию — здесь появятся имена участников
          </p>
        ) : (
          <ul className="space-y-2">
            {rankings.map((player) => (
              <li
                key={player.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.games} игр · {player.wins} побед · лучший{' '}
                    {player.bestScore}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(player.lastPlayedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
