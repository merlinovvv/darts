export type AchievementId =
  | 'first-game'
  | 'first-win'
  | 'throws-100'
  | 'throws-500'
  | 'daily-3'
  | 'solo-5'
  | 'multiplayer-5'
  | 'favourite-x01'

export interface AchievementDefinition {
  id: AchievementId
  title: string
  description: string
}

export interface UnlockedAchievement {
  id: AchievementId
  unlockedAt: string
}
