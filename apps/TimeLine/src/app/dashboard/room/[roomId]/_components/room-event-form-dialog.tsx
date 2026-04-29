'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/lib/constants'
import type { EventType, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'
import { createEventFormData } from '@/app/dashboard/room/[roomId]/_lib/room-detail-utils'
import type { EventFormData } from '@/app/dashboard/room/[roomId]/_lib/room-detail-types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type RoomEventFormDialogProps = {
  event: ScheduleEvent | null
  onOpenChange: (_open: boolean) => void
  onSave: (_formData: EventFormData) => void
  open: boolean
  saving: boolean
}

export function RoomEventFormDialog({ event, onOpenChange, onSave, open, saving }: RoomEventFormDialogProps) {
  const [formData, setFormData] = useState<EventFormData>(() => createEventFormData(event))
  const weekdays = DAYS_OF_WEEK.filter((day) => day.value >= 1 && day.value <= 5)

  useEffect(() => {
    if (open) setFormData(createEventFormData(event))
  }, [event, open])

  const toggleDay = (dayValue: number) => setFormData((current) => {
    const nextDays = current.daysOfWeek.includes(dayValue) ? current.daysOfWeek.filter((day) => day !== dayValue) : [...current.daysOfWeek, dayValue].sort((left, right) => left - right)
    return { ...current, daysOfWeek: nextDays.length > 0 ? nextDays : current.daysOfWeek }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Хуваарь засах' : 'Шинэ хуваарь нэмэх'}</DialogTitle>
          <DialogDescription>{event ? 'Үйл явдлын мэдээллийг өөрчилнө үү' : 'Шинэ үйл явдал үүсгэх'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label htmlFor="title">Нэр</Label><Input id="title" value={formData.title} onChange={(event_) => setFormData((current) => ({ ...current, title: event_.target.value }))} placeholder="Веб хөгжүүлэлт" /></div>
          <div className="grid gap-2"><Label htmlFor="type">Төрөл</Label><Select value={formData.type} onValueChange={(value) => setFormData((current) => ({ ...current, type: value as EventType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="class">Хичээл</SelectItem><SelectItem value="club">Клуб</SelectItem><SelectItem value="openlab">Нээлттэй (Open Lab)</SelectItem><SelectItem value="closed">Хаалттай</SelectItem></SelectContent></Select></div>
          <div className="grid gap-2"><Label>Гаригууд</Label><p className="mb-2 text-xs text-muted-foreground">Олон гариг сонгож болно. Жишээ нь: Даваа, Лхагва, Баасан</p><div className="flex flex-wrap gap-2">{weekdays.map((day) => { const isSelected = formData.daysOfWeek.includes(day.value); return <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={cn('rounded-full border px-3 py-1.5 text-sm font-medium transition-all', isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground')}>{day.short}</button> })}</div>{formData.daysOfWeek.length > 0 && <p className="mt-1 text-xs text-primary">Сонгосон: {formData.daysOfWeek.map((day) => DAYS_OF_WEEK.find((entry) => entry.value === day)?.label).join(', ')}</p>}</div>
          <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="startTime">Эхлэх цаг</Label><Input id="startTime" type="time" value={formData.startTime} onChange={(event_) => setFormData((current) => ({ ...current, startTime: event_.target.value }))} /></div><div className="grid gap-2"><Label htmlFor="endTime">Дуусах цаг</Label><Input id="endTime" type="time" value={formData.endTime} onChange={(event_) => setFormData((current) => ({ ...current, endTime: event_.target.value }))} /></div></div>
          {!formData.isOverride && <div className="space-y-4 rounded-lg border p-4"><div><Label className="text-sm font-medium">Хүчинтэй хугацаа</Label><p className="mt-1 text-xs text-muted-foreground">Долоо хоног бүр давтагдах хуваарийн хүчинтэй хугацаа</p></div><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="validFrom" className="text-xs">Эхлэх огноо</Label><Input id="validFrom" type="date" value={formData.validFrom} onChange={(event_) => setFormData((current) => ({ ...current, validFrom: event_.target.value }))} /></div><div className="grid gap-2"><Label htmlFor="validUntil" className="text-xs">Дуусах огноо</Label><Input id="validUntil" type="date" value={formData.validUntil} onChange={(event_) => setFormData((current) => ({ ...current, validUntil: event_.target.value }))} /></div></div>{formData.validFrom && formData.validUntil && <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CalendarDays className="h-3 w-3" />{formData.validFrom}-ээс {formData.validUntil} хүртэл хүчинтэй</p>}</div>}
          {formData.type === 'class' && <div className="grid gap-2"><Label htmlFor="instructor">Багш</Label><Input id="instructor" value={formData.instructor} onChange={(event_) => setFormData((current) => ({ ...current, instructor: event_.target.value }))} placeholder="Б. Болд" /></div>}
          <div className="grid gap-2"><Label htmlFor="notes">Тэмдэглэл</Label><Textarea id="notes" value={formData.notes} onChange={(event_) => setFormData((current) => ({ ...current, notes: event_.target.value }))} placeholder="Нэмэлт мэдээлэл..." rows={2} /></div>
          <div className="flex items-center justify-between rounded-lg border p-3"><div><Label htmlFor="isOverride" className="font-medium">Түр өөрчлөлт</Label><p className="text-xs text-muted-foreground">Тодорхой огноонд нэг удаагийн өөрчлөлт</p></div><Switch id="isOverride" checked={formData.isOverride} onCheckedChange={(checked) => setFormData((current) => ({ ...current, isOverride: checked }))} /></div>
          {formData.isOverride && <div className="grid gap-2"><Label htmlFor="date">Огноо (түр өөрчлөлтөнд)</Label><Input id="date" type="date" value={formData.date} onChange={(event_) => setFormData((current) => ({ ...current, date: event_.target.value }))} /></div>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Болих</Button><Button onClick={() => onSave(formData)} disabled={saving || formData.daysOfWeek.length === 0 || formData.title.trim().length === 0}>{saving ? 'Хадгалж байна...' : event ? 'Хадгалах' : 'Үүсгэх'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
