import { Lock, Trophy } from 'lucide-react'
import { useEffect } from 'react'

import {
  ACHIEVEMENT_DEFINITIONS,
  isAchievementUnlocked,
  useAchievementsStore,
} from '@/entities/achievements'
import { useGameHistoryStore } from '@/entities/game-history'
import { cn } from '@/shared/lib'
import { Card, CardContent } from '@/shared/ui'

export function TrophiesPage() {
  const entries = useGameHistoryStore((state) => state.entries)
  const unlocked = useAchievementsStore((state) => state.unlocked)
  const syncFromHistory = useAchievementsStore((state) => state.syncFromHistory)

  useEffect(() => {
    syncFromHistory(entries)
  }, [entries, syncFromHistory])

  const unlockedCount = unlocked.length

  return (
    <main className="flex flex-col gap-5 p-4 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Трофеи</h1>
        <p className="text-sm text-muted-foreground">
          Открыто {unlockedCount} из {ACHIEVEMENT_DEFINITIONS.length}
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
          const open = isAchievementUnlocked(unlocked, achievement.id)

          return (
            <li key={achievement.id}>
              <Card
                className={cn(
                  'h-full',
                  open ? 'border-hub-gold/50' : 'opacity-70',
                )}
              >
                <CardContent className="flex gap-3 p-4">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                      open ? 'bg-hub-gold/20 text-hub-gold' : 'bg-muted',
                    )}
                  >
                    {open ? (
                      <Trophy className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
