/** Пул тренировок, из которого выбирается испытание дня. */
export const DAILY_CHALLENGE_GAME_IDS = [
  'around-the-clock',
  'bobs-27',
  'checkout-121',
  'shanghai',
  'hundred-at-20',
  'bull-challenge-25',
  'x01-solo-501',
  'jdc-challenge',
] as const

/** Сколько серий нужно сыграть, чтобы закрыть испытание дня. */
export const DAILY_CHALLENGE_TARGET_SERIES = 3

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function hashDateKey(dateKey: string): number {
  let hash = 0

  for (let index = 0; index < dateKey.length; index += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(index)) % 2147483647
  }

  return hash
}

export function getDailyChallengeGameId(dateKey: string): string {
  const index = hashDateKey(dateKey) % DAILY_CHALLENGE_GAME_IDS.length

  return DAILY_CHALLENGE_GAME_IDS[index]
}
