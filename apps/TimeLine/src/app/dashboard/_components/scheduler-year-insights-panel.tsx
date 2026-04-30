'use client'

import type { YearCalendarSummary, YearMonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import { cn } from '@/lib/utils'

type SchedulerYearInsightsPanelProps = {
  monthName: string
  selectedYearSummary: YearMonthSummary | null
  yearLabel: string
  yearSummary: YearCalendarSummary
}

function getCapacityLabel(utilization: number) {
  if (utilization >= 75) return 'Ачаалалтай'
  if (utilization >= 45) return 'Дунд'
  return 'Сул'
}

function getCapacityTone(utilization: number) {
  if (utilization >= 75) return 'text-[#c4314b]'
  if (utilization >= 45) return 'text-[#8a5a00]'
  return 'text-[#1f7a52]'
}

function getSuggestion(summary: YearMonthSummary | null) {
  const busiestRoom = summary?.roomLoads[0] ?? null
  const quietestRoom = summary?.roomLoads.at(-1) ?? null
  if (!summary || summary.totalCount === 0) return 'Одоогоор дата алга'
  if (summary.roomLoads.length === 0) return 'Event hall-ыг хасахад ангийн ачааллын дата алга'
  if (summary.conflictCount > 0) return 'Давхцалтай өдрүүдийг эхэлж шалгаарай'
  if (busiestRoom && quietestRoom && busiestRoom.roomId !== quietestRoom.roomId) return `Шинэ хуваарийг ${quietestRoom.roomNumber} ангид эхэлж тавих нь зөв`
  return 'Шинэ хичээл нэмэхэд тохиромжтой'
}

export function SchedulerYearInsightsPanel({ monthName, selectedYearSummary, yearLabel, yearSummary }: SchedulerYearInsightsPanelProps) {
  const roomLoads = selectedYearSummary?.roomLoads ?? []
  const busiestRoom = roomLoads[0] ?? null
  const quietestRoom = roomLoads.at(-1) ?? null
  const utilization = selectedYearSummary?.utilization ?? 0

  return (
    <div className="space-y-4 text-xs text-muted-foreground">
      <div className="space-y-1.5">
        <div className="font-semibold text-foreground">{yearLabel} оны тойм</div>
        <div>{yearSummary.uniqueTotal} төрлийн хуваарь</div>
        <div>{yearSummary.activeMonths} идэвхтэй сар</div>
        <div>{yearSummary.classes} хичээл · {yearSummary.clubs} клуб · {yearSummary.events} event</div>
        <div>Ачаалалтай: {yearSummary.busiestMonth ? `${yearSummary.busiestMonth.shortLabel} (${yearSummary.busiestMonth.utilization}%)` : '-'}</div>
        <div>Сул: {yearSummary.quietestMonth ? `${yearSummary.quietestMonth.shortLabel} (${yearSummary.quietestMonth.utilization}%)` : '-'}</div>
      </div>

      <div className="border-t border-dashed border-[#d7d8f4] pt-3 dark:border-[#323858]">
        <div className="font-semibold text-foreground">{monthName}</div>
        <div className={cn('mt-1 text-lg font-semibold', getCapacityTone(utilization))}>{utilization}% {getCapacityLabel(utilization)}</div>
        <div className="mt-1">{selectedYearSummary?.uniqueCounts.class ?? 0} хичээл · {selectedYearSummary?.uniqueCounts.club ?? 0} клуб · {selectedYearSummary?.uniqueCounts.event ?? 0} event</div>
        <div>{selectedYearSummary?.activeDays ?? 0} идэвхтэй өдөр · {selectedYearSummary?.conflictCount ?? 0} давхцал</div>
      </div>

      <div>
        <div className="mb-2 font-medium text-foreground">Анги бүрийн ачаалал</div>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {roomLoads.length === 0 ? (
            <div>Ангийн дата алга</div>
          ) : roomLoads.map((load) => (
            <div key={load.roomId}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate font-medium text-foreground">{load.roomNumber}</span>
                <span>{load.utilization}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#ebeefe] dark:bg-[#232b45]">
                <div className="h-1.5 rounded-full bg-[#6264a7]" style={{ width: `${load.utilization}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div>{quietestRoom ? `${quietestRoom.roomNumber} хамгийн сул` : 'Сул ангийн дата алга'}</div>
        <div>{busiestRoom ? `${busiestRoom.roomNumber} хамгийн ачаалалтай` : 'Ачаалалтай ангийн дата алга'}</div>
      </div>

      <div className="rounded-xl border border-dashed border-[#d7d8f4] bg-white/70 p-2.5 dark:border-[#323858] dark:bg-[#111522]">
        <div className="mb-1 font-medium text-foreground">Санал</div>
        <div>{getSuggestion(selectedYearSummary)}</div>
      </div>
    </div>
  )
}
