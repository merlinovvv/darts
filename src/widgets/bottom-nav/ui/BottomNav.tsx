import { Crosshair, Target, Trophy, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib'

const TABS = [
  { to: ROUTES.home, label: 'Игра', icon: Target, end: true },
  { to: ROUTES.stats, label: 'Статистика', icon: Crosshair },
  { to: ROUTES.trophies, label: 'Трофеи', icon: Trophy },
  { to: ROUTES.social, label: 'Сообщество', icon: Users },
] as const

export function BottomNav() {
  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon

          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={'end' in tab ? tab.end : false}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium text-muted-foreground transition-colors',
                    isActive && 'bg-accent text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        isActive && 'bg-hub-green/25 text-hub-green',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="truncate">{tab.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
