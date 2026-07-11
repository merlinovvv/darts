import { Users, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/shared/config/routes'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 p-4">
      <div className="space-y-2 pt-4">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Дартс
        </p>
        <h1 className="text-3xl font-bold">Как играем?</h1>
        <p className="text-muted-foreground">
          Партия с друзьями или тренировка в одиночку
        </p>
      </div>

      <div className="space-y-3">
        <Card
          className="cursor-pointer transition-colors hover:bg-muted/30"
          onClick={() => navigate(ROUTES.friends)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">Играть с друзьями</CardTitle>
                <CardDescription>301, 501, Крикет</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate(ROUTES.friends)}>
              Выбрать игру
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted/30"
          onClick={() => navigate(ROUTES.solo)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">Играть самому</CardTitle>
                <CardDescription>9 режимов тренировки</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(ROUTES.solo)}
            >
              Выбрать тренировку
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
