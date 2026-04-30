type Props = {
  level: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function LevelBadge({ level, size = 'md' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-indigo-100 font-semibold text-indigo-700 ${sizeClasses[size]}`}
    >
      ⭐ Lv.{level}
    </span>
  )
}
