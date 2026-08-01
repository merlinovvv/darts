import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { CurrentGamesList } from "@/features/current-games";
import { DailyChallengeCard } from "@/features/daily-challenge";
import { ROUTES } from "@/shared/config/routes";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/ui";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="relative flex flex-col gap-6 overflow-hidden p-4 pb-6">
      <div className="relative space-y-2 pt-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-green">
          Дартс
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Как играем?</h1>
        <p className="max-w-sm text-muted-foreground">
          Партия с друзьями или ежедневное испытание для тренировки
        </p>
      </div>

      <div className="relative space-y-4">
        <Card variant="feature">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-6 w-6 shrink-0 text-hub-green" />
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-base font-extrabold uppercase tracking-wide">
                  Играть с друзьями
                </CardTitle>
                <CardDescription>301 · 501 · Крикет</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            <CurrentGamesList />
            <Button
              variant="inverse"
              className="w-full font-bold uppercase tracking-wide"
              onClick={() => navigate(ROUTES.friends)}
            >
              Play now
            </Button>
          </CardContent>
        </Card>

        <DailyChallengeCard />
      </div>
    </main>
  );
}
