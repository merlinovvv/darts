import { Outlet } from 'react-router-dom'

import { useHubTheme } from '@/app/lib/use-hub-theme'

/** Оболочка игрового флоу без нижней навигации, с hub-темой. */
export function FlowLayout() {
  useHubTheme()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background text-foreground">
      <Outlet />
    </div>
  )
}
