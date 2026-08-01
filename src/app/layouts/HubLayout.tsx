import { Outlet } from 'react-router-dom'

import { useHubTheme } from '@/app/lib/use-hub-theme'
import { AppHeader } from '@/widgets/app-header'
import { BottomNav } from '@/widgets/bottom-nav'
import { DartboardMark } from '@/shared/ui'

/**
 * Оболочка hub-зоны: тёмная тема через класс `.hub` на body
 * (чтобы токены доходили до порталов диалогов).
 */
export function HubLayout() {
  useHubTheme()

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-x-hidden bg-background text-foreground">
      <DartboardMark className="pointer-events-none absolute -right-36 h-72 w-72 text-foreground/[0.14]" />
      <AppHeader />
      <div className="relative flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
