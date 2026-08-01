import { Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/shared/config/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DartboardMark,
  Progress,
} from '@/shared/ui'

import { useDailyChallenge } from '../model/use-daily-challenge'

export function DailyChallengeCard() {
  const navigate = useNavigate()
  const {
    definition,
    completedSeries,
    targetSeries,
    isCompleted,
    bestScore,
    start,
  } = useDailyChallenge()

  if (!definition) {
    return null
  }

  return (
    <Card variant="gradient">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 h-6 w-6 shrink-0 text-hub-gold" />
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-extrabold uppercase tracking-wide">
              Ежедневное испытание
            </CardTitle>
            <CardDescription>
              {definition.name} — {definition.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Прогресс дня: {completedSeries} из {targetSeries} серий
            </p>
            {isCompleted ? (
              <Badge className="shrink-0 font-normal">Выполнено</Badge>
            ) : null}
          </div>
          <Progress value={completedSeries} max={targetSeries} />
          {bestScore > 0 ? (
            <p className="text-xs text-muted-foreground">
              Лучший результат за день: {bestScore} очков
            </p>
          ) : null}
        </div>

        <Button
          variant="inverse"
          className="w-full font-bold uppercase tracking-wide"
          onClick={start}
        >
          Начать тренировку
        </Button>

        <div className="relative h-24 overflow-hidden rounded-xl border border-border/60 bg-background/60">
          <DartboardMark className="absolute left-1/2 top-5 h-40 w-40 -translate-x-1/2 text-hub-green/55" />
        </div>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => navigate(ROUTES.solo)}
        >
          Все тренировки
        </Button>
      </CardContent>
    </Card>
  )
}
