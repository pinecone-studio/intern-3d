export function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100))
}

export function getNextLevelXP(level: number): number {
  return Math.pow(level + 1, 2) * 100
}

export function getLevelProgress(xp: number): {
  level: number
  currentLevelXP: number
  nextLevelXP: number
  progress: number
} {
  const level = getLevel(xp)
  const currentLevelXP = Math.pow(level, 2) * 100
  const nextLevelXP = getNextLevelXP(level)
  const range = nextLevelXP - currentLevelXP
  const progress = range === 0 ? 100 : Math.round(((xp - currentLevelXP) / range) * 100)
  return { level, currentLevelXP, nextLevelXP, progress }
}
