export interface Player {
  id: string
  name: string
  order: number
}

export function getDefaultPlayerName(order: number): string {
  return `Игрок ${order + 1}`
}

export function isDefaultPlayerName(name: string, order: number): boolean {
  return name.trim() === getDefaultPlayerName(order)
}

export function createPlayer(name: string, order: number): Player {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || getDefaultPlayerName(order),
    order,
  }
}

export function sortPlayersByOrder(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.order - b.order)
}

export function getNextPlayerId(
  players: Player[],
  currentPlayerId: string,
): string {
  const sorted = sortPlayersByOrder(players)
  const currentIndex = sorted.findIndex((player) => player.id === currentPlayerId)
  const nextIndex = (currentIndex + 1) % sorted.length
  return sorted[nextIndex]?.id ?? currentPlayerId
}
