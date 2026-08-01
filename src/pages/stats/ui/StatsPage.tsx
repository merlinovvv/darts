import { useGameHistoryStore, getHistoryTotals } from '@/entities/game-history'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function StatsPage() {
  const entries = useGameHistoryStore((state) => state.entries)
  const totals = getHistoryTotals(entries)
  const recent = entries.slice(0, 20)

  return (
    <main className="flex flex-col gap-5 p-4 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Статистика</h1>
        <p className="text-sm text-muted-foreground">
          Сводка по завершённым партиям на этом устройстве
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Игр" value={String(totals.games)} />
        <StatTile label="Бросков" value={String(totals.throws)} />
        <StatTile
          label="Средний бросок"
          value={totals.averageThrowScore.toFixed(1)}
        />
        <StatTile
          label="Лучший счёт"
          value={String(totals.bestPlayerScore)}
        />
      </div>

      {totals.favouriteGame ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Любимый режим</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {totals.favouriteGame.gameName} — {totals.favouriteGame.games} игр
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Последние игры
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет завершённых партий
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((entry) => {
              const winner = entry.players.find((player) => player.isWinner)

              return (
                <li
                  key={entry.id}
                  className="rounded-xl border border-border/70 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{entry.gameName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.finishedAt)} · {entry.totalThrows}{' '}
                        бросков
                      </p>
                    </div>
                    {entry.source === 'daily-challenge' ? (
                      <Badge className="shrink-0 font-normal">День</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.isTie
                      ? 'Ничья'
                      : winner
                        ? `Победитель: ${winner.name}`
                        : entry.players.map((player) => player.name).join(', ')}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}
