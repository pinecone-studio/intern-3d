'use client'

import type { YearMonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import { cn } from '@/lib/utils'

type SchedulerYearMonthCardProps = {
  isSelected: boolean
  summary: YearMonthSummary
  onSelectMonth: (_date: Date) => void
}

function RoomLoadLine({ label, room }: { label: string; room: YearMonthSummary['roomLoads'][number] | null }) {
  return (
    <div className="rounded-xl border border-[#e7e9f6] bg-white/70 px-2.5 py-2 text-[11px] dark:border-[#2c3149] dark:bg-[#151a27]">
      <div className="text-muted-foreground">{label}</div>
      {room ? (
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate font-semibold text-foreground">{room.roomNumber}</span>
          <span className="font-medium text-[#323769] dark:text-[#dfe3ff]">{room.utilization}%</span>
        </div>
      ) : (
        <div className="mt-1 font-medium text-muted-foreground">Дата алга</div>
      )}
    </div>
  )
}

export function SchedulerYearMonthCard({ isSelected, summary, onSelectMonth }: SchedulerYearMonthCardProps) {
  const busiestRoom = summary.roomLoads[0] ?? null
  const quietestRoom = summary.roomLoads.at(-1) ?? null

  return (
    <button
      type="button"
      className={cn(
        'rounded-3xl border border-[#e7e9f6] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfe_100%)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#2c3149] dark:bg-[linear-gradient(180deg,#171b27_0%,#121724_100%)]',
        isSelected && 'ring-2 ring-inset ring-[#6264a7]',
      )}
      onClick={() => onSelectMonth(summary.monthStart)}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-foreground">{summary.shortLabel}</div>
          <div className="text-[11px] text-muted-foreground">{summary.activeDays} идэвхтэй өдөр</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-foreground">{summary.uniqueTotal}</div>
          <div className="text-[10px] text-muted-foreground">төрөл</div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-[#ebeefe] dark:bg-[#232b45]">
          <div className="h-2 rounded-full bg-[#6264a7]" style={{ width: `${summary.utilization}%` }} />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{summary.utilization}%</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {summary.uniqueCounts.class > 0 ? <span className="rounded-full bg-[#eaf2ff] px-2 py-1 text-[10px] font-medium text-[#17375e]">{summary.uniqueCounts.class} хичээл</span> : null}
        {summary.uniqueCounts.club > 0 ? <span className="rounded-full bg-[#f1ecff] px-2 py-1 text-[10px] font-medium text-[#3f2a76]">{summary.uniqueCounts.club} клуб</span> : null}
        {summary.uniqueCounts.event > 0 ? <span className="rounded-full bg-[#fde7e9] px-2 py-1 text-[10px] font-medium text-[#7c2030]">{summary.uniqueCounts.event} event</span> : null}
        {summary.conflictCount > 0 ? <span className="rounded-full bg-[#fde7e9] px-2 py-1 text-[10px] font-medium text-[#c4314b]">{summary.conflictCount} давхцал</span> : null}
      </div>

      <div className="grid gap-2">
        <RoomLoadLine label="Хамгийн сул анги" room={quietestRoom} />
        <RoomLoadLine label="Хамгийн ачаалалтай анги" room={busiestRoom} />
      </div>
    </button>
  )
}
