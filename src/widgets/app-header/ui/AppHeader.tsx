import {
  BarChart3,
  CircleDot,
  Home,
  Menu,
  Target,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useState, type SVGProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/shared/config/routes'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M20 2.5 33 8v11.5c0 8.2-5.4 15.7-13 18.5-7.6-2.8-13-10.3-13-18.5V8L20 2.5Z"
        fill="currentColor"
        className="text-hub-green"
      />
      <path
        d="M20 7.2 28.5 11v8.2c0 5.4-3.5 10.4-8.5 12.3-5-1.9-8.5-6.9-8.5-12.3V11L20 7.2Z"
        fill="currentColor"
        className="text-background"
      />
      <path
        d="M14 22.5 26 12l1.2 1.6-12 10.5-1.2-1.6Zm13.2-12.8 2.4.9-.7 1.9-2.4-.9.7-1.9Z"
        fill="currentColor"
        className="text-hub-gold"
      />
      <circle cx="20" cy="22" r="2.2" fill="currentColor" className="text-hub-gold" />
    </svg>
  )
}

const MENU_LINKS: Array<{
  to: (typeof ROUTES)[keyof typeof ROUTES]
  label: string
  icon: LucideIcon
}> = [
  { to: ROUTES.home, label: 'Главная', icon: Home },
  { to: ROUTES.friends, label: 'Играть с друзьями', icon: Users },
  { to: ROUTES.solo, label: 'Тренировки', icon: Target },
  { to: ROUTES.board, label: 'Доска', icon: CircleDot },
  { to: ROUTES.stats, label: 'Статистика', icon: BarChart3 },
  { to: ROUTES.trophies, label: 'Трофеи', icon: Trophy },
  { to: ROUTES.social, label: 'Сообщество', icon: UsersRound },
]

export function AppHeader() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3">
      <Link to={ROUTES.home} className="flex min-w-0 items-center gap-2.5">
        <BrandMark className="h-9 w-9 shrink-0" />
        <span className="truncate text-sm font-extrabold tracking-wide">
          DARTS.COM{' '}
          <span className="text-hub-gold">PRO</span>
        </span>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Открыть меню"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm gap-2">
          <DialogHeader className="space-y-0">
            <DialogTitle>Меню</DialogTitle>
            <DialogDescription className="sr-only">
              Навигация по разделам приложения
            </DialogDescription>
          </DialogHeader>
          <nav className="flex flex-col gap-0.5">
            {MENU_LINKS.map((link) => {
              const Icon = link.icon

              return (
                <Button
                  key={link.to}
                  variant="ghost"
                  className="h-12 justify-start gap-3 px-3 text-base font-medium"
                  onClick={() => {
                    setOpen(false)
                    navigate(link.to)
                  }}
                >
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  {link.label}
                </Button>
              )
            })}
            <Button
              variant="inverse"
              className="mt-3 font-bold uppercase tracking-wide"
              onClick={() => {
                setOpen(false)
                navigate(ROUTES.friends)
              }}
            >
              Новая игра
            </Button>
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  )
}
