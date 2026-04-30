'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MoveDraft } from '@/app/dashboard/_lib/scheduler-types'

type SchedulerMoveDraftsPanelProps = {
  drafts: MoveDraft[]
  onConfirm: (_draftId: string) => void
  onDelete: (_draftId: string) => void
}

const scopeLabels = { occurrence: 'Энэ удаа', series: 'Энэ хуваарь', group: 'Group' } as const

export function SchedulerMoveDraftsPanel({ drafts, onConfirm, onDelete }: SchedulerMoveDraftsPanelProps) {
  if (drafts.length === 0) return null
  return (
    <div className="rounded-md border border-dashed border-[#d7d8f4] bg-white p-3 text-sm shadow-sm dark:border-border dark:bg-card">
      <div className="mb-2 flex items-center gap-2">
        <p className="font-semibold text-foreground">Draft зөөх өөрчлөлт</p>
        <Badge variant="outline">{drafts.length}</Badge>
      </div>
      <div className="space-y-2">
        {drafts.map(draft => (
          <div key={draft.id} className="flex flex-col gap-2 rounded-md border border-[#e8e8eb] p-2 dark:border-border sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{draft.title} · {scopeLabels[draft.scope]}</p>
              <div className="mt-1 space-y-0.5 text-xs text-destructive">{draft.conflicts.slice(0, 3).map(conflict => <p key={conflict}>{conflict}</p>)}</div>
              {draft.conflicts.length > 3 ? <p className="text-xs text-muted-foreground">+{draft.conflicts.length - 3} давхцал</p> : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => onDelete(draft.id)}>Устгах</Button>
              <Button type="button" size="sm" className="bg-[#6264a7] hover:bg-[#5558a7]" onClick={() => onConfirm(draft.id)}>Батлах</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
