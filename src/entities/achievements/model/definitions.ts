import type { AchievementDefinition } from './types'

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-game',
    title: 'Первый бросок',
    description: 'Завершите первую партию',
  },
  {
    id: 'first-win',
    title: 'Победа!',
    description: 'Выиграйте хотя бы одну партию',
  },
  {
    id: 'throws-100',
    title: 'Сотня',
    description: 'Сделайте 100 бросков суммарно',
  },
  {
    id: 'throws-500',
    title: 'Марафонец',
    description: 'Сделайте 500 бросков суммарно',
  },
  {
    id: 'daily-3',
    title: 'Серия дня',
    description: 'Сыграйте 3 серии ежедневного испытания',
  },
  {
    id: 'solo-5',
    title: 'Одиночка',
    description: 'Завершите 5 тренировок',
  },
  {
    id: 'multiplayer-5',
    title: 'В компании',
    description: 'Завершите 5 игр с друзьями',
  },
  {
    id: 'favourite-x01',
    title: 'Классика',
    description: 'Сыграйте 3 партии в режиме X01',
  },
]
