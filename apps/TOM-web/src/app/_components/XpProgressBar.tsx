import { getLevelProgress } from '@/lib/level-service'

type Props = {
  xp: number
  showDetails?: boolean
}

export function XpProgressBar({ xp, showDetails = true }: Props) {
  const { level, currentLevelXP, nextLevelXP, progress } = getLevelProgress(xp)

  return (
    <div className="w-full">
      {showDetails && (
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Lv.{level}</span>
          <span>
            {xp - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
          </span>
          <span>Lv.{level + 1}</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
