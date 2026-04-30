'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useRole } from '@/lib/role-context'
import { useTimelineClock } from '@/lib/use-timeline-clock'
import { useTimelineLiveUpdates } from '@/lib/use-timeline-live-updates'
import { CREATE_SCHEDULE_EVENT, GET_ROOM_DETAIL, UPDATE_SCHEDULE_EVENT } from '@/app/dashboard/room/[roomId]/_lib/room-detail-queries'
import type { EventFormData, RoomDetailQueryResult } from '@/app/dashboard/room/[roomId]/_lib/room-detail-types'
import { createMutationInput } from '@/app/dashboard/room/[roomId]/_lib/room-detail-utils'
import { RoomDetailHeader } from '@/app/dashboard/room/[roomId]/_components/room-detail-header'
import { RoomEventFormDialog } from '@/app/dashboard/room/[roomId]/_components/room-event-form-dialog'
import { RoomWeeklyScheduleGrid } from '@/app/dashboard/room/[roomId]/_components/room-weekly-schedule-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PineconeLoader } from '@/components/ui/pinecone-loader'
import { applyRealtimeRoomStatus } from '@/lib/timeline-status'
import type { ScheduleEvent } from '@/lib/types'

export function RoomDetailContent({ roomId }: { roomId: string }) {
  const { role } = useRole()
  const clock = useTimelineClock()
  const { data, loading, error, refetch } = useQuery<RoomDetailQueryResult>(GET_ROOM_DETAIL, { variables: { roomId } })
  const [createScheduleEvent, { loading: creatingEvent }] = useMutation(CREATE_SCHEDULE_EVENT)
  const [updateScheduleEvent, { loading: updatingEvent }] = useMutation(UPDATE_SCHEDULE_EVENT)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useTimelineLiveUpdates({ enabled: !loading, roomId, onEventsChanged: () => refetch() })

  const liveRoom = useMemo(() => {
    if (!data?.room?.room) return null
    return applyRealtimeRoomStatus([data.room.room], data.room.events ?? [], clock?.now ?? new Date())[0] ?? data.room.room
  }, [clock?.now, data?.room?.events, data?.room?.room])

  if (loading || !clock) return <PineconeLoader className="min-h-[420px]" />
  if (error) return <div className="flex flex-col items-center justify-center gap-3 p-8 text-center"><h1 className="text-xl font-bold">Өрөөний мэдээлэл ачаалж чадсангүй</h1><p className="max-w-md text-sm text-muted-foreground">{error.message}</p><Button onClick={() => refetch()}>Дахин оролдох</Button></div>
  if (!data?.room?.room || !liveRoom) return <div className="flex flex-col items-center justify-center p-8"><h1 className="text-xl font-bold">Өрөө олдсонгүй</h1><Button variant="link" asChild><a href="/dashboard">Буцах</a></Button></div>

  const isAdmin = role === 'admin'
  const room = liveRoom
  const regularEvents = (data.room.events ?? []).filter((event) => !event.isOverride)

  const handleSaveEvent = async (formData: EventFormData) => {
    try {
      setMutationError(null)
      const input = createMutationInput(roomId, formData)
      if (editingEvent) await updateScheduleEvent({ variables: { id: editingEvent.id, input } })
      else await createScheduleEvent({ variables: { input } })
      await refetch()
      setEditDialogOpen(false)
      setEditingEvent(null)
    } catch (saveError) {
      setMutationError(saveError instanceof Error ? saveError.message : 'Хуваарь хадгалж чадсангүй')
    }
  }

  return (
    <div className="space-y-6">
      <RoomDetailHeader isAdmin={isAdmin} onCreateEvent={() => { setMutationError(null); setEditingEvent(null); setEditDialogOpen(true) }} room={room} />
      {mutationError && <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{mutationError}</div>}
      <Card><CardHeader><CardTitle>Долоо хоногийн хуваарь</CardTitle><CardDescription>Даваа - Баасан гариг</CardDescription></CardHeader><CardContent><RoomWeeklyScheduleGrid currentDay={clock.currentDay} currentTime={clock.currentTime} events={regularEvents} isAdmin={isAdmin} onEditEvent={(event) => { setMutationError(null); setEditingEvent(event); setEditDialogOpen(true) }} /></CardContent></Card>
      <RoomEventFormDialog event={editingEvent} onOpenChange={setEditDialogOpen} onSave={handleSaveEvent} open={editDialogOpen} saving={creatingEvent || updatingEvent} />
    </div>
  )
}
