import { isSoloSession, useGameStore } from '@/entities/game'
import { isCricketConfig, isX01Config } from '@/entities/game'
import { getGameDefinition, getGameEngine, getCricketStatusLabel, getMaxThrowsPerTurn } from '@/entities/game-rules'
import { AddPlayerForm } from '@/features/add-player'
import { RemovePlayerButton } from '@/features/remove-player'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { cn } from '@/shared/lib'

function getCricketCellClass(status: 'open' | 'closed-player' | 'closed-all') {
  switch (status) {
    case 'closed-all':
      return 'border-red-600/60 bg-red-50 dark:bg-red-950/30'
    case 'closed-player':
      return 'border-green-600/60 bg-green-50 dark:bg-green-950/30'
    default:
      return ''
  }
}

export function Scoreboard() {
  const session = useGameStore((state) => state.session)

  if (!session) {
    return null
  }

  const engine = getGameEngine(session.config)
  const rows = engine.getScoreboardData(session)
  const isSolo = isSoloSession(session)
  const isCricket = isCricketConfig(session.config)
  const isX01 =
    isX01Config(session.config) ||
    session.config.mode === 'x01-solo' ||
    session.config.mode === 'checkout-121'
  const throwNumber = session.turnThrows.length + 1
  const maxThrows = getMaxThrowsPerTurn(session)
  const gameName = getGameDefinition(session.gameId)?.name

  return (
    <Card className="mx-4 border shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {isSolo
              ? gameName ?? 'Тренировка'
              : isCricket
                ? 'Таблица крикета'
                : 'Счёт'}
          </CardTitle>
          {session.status === 'finished' ? (
            <Badge variant="secondary">Игра окончена</Badge>
          ) : null}
        </div>
        {isX01 ? (
          <p className="text-xs text-muted-foreground">
            На доске: серая подсветка — перебор, зелёные полоски — финиш
          </p>
        ) : null}
        {isCricket ? (
          <p className="text-xs text-muted-foreground">
            Зелёный — закрыт игроком, красный — закрыт всеми
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row, index) => {
          const player = session.players.find(
            (sessionPlayer) => sessionPlayer.id === row.playerId,
          )

          return (
          <div
            key={row.playerId}
            className={cn(
              'rounded-lg border p-3',
              row.isCurrent && !row.isRemoved && 'border-foreground bg-muted/40',
              row.isRemoved && 'border-dashed bg-muted/20 opacity-70',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-1">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'font-medium',
                        row.isRemoved && 'text-muted-foreground line-through',
                      )}
                    >
                      {index + 1}. {row.playerName}
                    </span>
                    {row.isCurrent && !row.isRemoved && session.status === 'active' ? (
                      <Badge className="text-[10px] font-normal">
                        Бросает · {Math.min(throwNumber, maxThrows)}-й
                      </Badge>
                    ) : null}
                    {row.isRemoved ? (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        Вышел из партии
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {player && !row.isRemoved && !isSolo ? (
                  <RemovePlayerButton player={player} />
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold leading-none">{row.primary}</p>
                {row.secondary ? (
                  <p className="text-xs text-muted-foreground">{row.secondary}</p>
                ) : null}
              </div>
            </div>

            {row.cricketDetails ? (
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                {Object.entries(row.cricketDetails).map(([label, detail]) => {
                  const statusLabel = getCricketStatusLabel(detail.status)

                  return (
                    <div
                      key={label}
                      className={cn(
                        'rounded border px-2 py-1.5 text-center',
                        getCricketCellClass(detail.status),
                      )}
                    >
                      <p className="font-semibold">{label}</p>
                      <p className="text-muted-foreground">
                        {detail.marks}/3 · {detail.points}
                      </p>
                      {statusLabel ? (
                        <Badge
                          variant="outline"
                          className="mt-1 px-1.5 py-0 text-[10px] font-normal"
                        >
                          {statusLabel}
                        </Badge>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}

            {!row.cricketDetails && row.details ? (
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                {Object.entries(row.details).map(([label, value]) => (
                  <div key={label} className="rounded border px-2 py-1 text-center">
                    <p className="font-semibold">{label}</p>
                    <p className="text-muted-foreground">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          )
        })}
        {!isSolo ? <AddPlayerForm /> : null}
      </CardContent>
    </Card>
  )
}
