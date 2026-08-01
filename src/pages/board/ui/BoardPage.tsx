import { SelectBoard } from './SelectBoard'

export function BoardPage() {
  return (
    <main className="flex flex-col gap-5 p-4 pb-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-green">
          Настройки
        </p>
        <h1 className="text-2xl font-bold">Доска</h1>
        <p className="text-sm text-muted-foreground">
          Выберите внешний вид мишени. Выбор сохранится на этом устройстве.
        </p>
      </div>

      <SelectBoard />
    </main>
  )
}
