'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { MoveConflictPreview, MoveScope, PendingEventMove } from '@/app/dashboard/_lib/scheduler-types'

type SchedulerMoveDialogProps = {
  canMoveGroup: boolean
  conflictPreview: MoveConflictPreview | null
  onApply: (_scope: MoveScope) => void
  onClose: () => void
  onSaveDraft: () => void
  pendingMove: PendingEventMove | null
}

const scopeLabel: Record<MoveScope, string> = {
  occurrence: 'Зөвхөн энэ удаа',
  series: 'Энэ хуваарь',
  group: 'Хамт үүсгэсэн бүгд',
}

export function SchedulerMoveDialog({ canMoveGroup, conflictPreview, onApply, onClose, onSaveDraft, pendingMove }: SchedulerMoveDialogProps) {
  const scope = conflictPreview?.scope
  return (
    <Dialog open={Boolean(pendingMove)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Хуваарь зөөх</DialogTitle>
          <DialogDescription>{pendingMove?.event.title} хуваарийг яаж зөөхөө сонгоно уу.{canMoveGroup ? ' Энэ хуваарь сонговол хамт үүсгэсэн хуваариуд цуг зөөгдөнө.' : ''}</DialogDescription>
        </DialogHeader>
        {conflictPreview ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">{scope ? scopeLabel[scope] : 'Зөөх'} үед давхцал гарлаа</p>
            <div className="mt-2 space-y-1 text-destructive/90">{conflictPreview.conflicts.map(conflict => <p key={conflict}>{conflict}</p>)}</div>
          </div>
        ) : null}
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>Болих</Button>
          {conflictPreview ? (
            <Button type="button" className="bg-[#6264a7] hover:bg-[#5558a7]" onClick={onSaveDraft}>Draft хадгалах</Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => onApply('occurrence')}>Зөвхөн энэ удаа</Button>
              <Button type="button" className={canMoveGroup ? 'bg-[#6264a7] hover:bg-[#5558a7]' : undefined} variant={canMoveGroup ? 'default' : 'outline'} onClick={() => onApply('series')}>{canMoveGroup ? 'Энэ хуваарь бүгд' : 'Энэ хуваарь'}</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
