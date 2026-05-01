import { useState, type Dispatch, type SetStateAction } from 'react'
import { DAY_VIEW_SLOT_COUNT, DAY_VIEW_SLOT_MINUTES, PLANNING_END_HOUR, PLANNING_START_HOUR, SLOT_COUNT } from '@/app/dashboard/_lib/scheduler-constants'
import { addDays, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { findScheduleConflict, formatScheduleConflict } from '@/app/dashboard/_lib/scheduler-conflicts'
import { createMutationInputFromEvent, getSelectionTimeRange } from '@/app/dashboard/_lib/scheduler-form-utils'
import { timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { MoveConflictPreview, MoveDraft, MoveScope, PendingEventMove, ScheduleEventMutationInput, Selection } from '@/app/dashboard/_lib/scheduler-types'
import type { Room, ScheduleEvent } from '@/lib/types'

type MutateCreate = (_options: { variables: { input: ScheduleEventMutationInput } }) => Promise<unknown>
type MutateDelete = (_options: { variables: { id: string } }) => Promise<unknown>
type MutateUpdate = (_options: { variables: { id: string; input: ScheduleEventMutationInput } }) => Promise<unknown>
type MovePlanItem = { event: ScheduleEvent; input: ScheduleEventMutationInput }
type MovePlan = { conflicts: string[]; items: MovePlanItem[] }
type ScheduleConflict = NonNullable<ReturnType<typeof findScheduleConflict>>

type ControllerProps = {
  createScheduleEvent: MutateCreate
  deleteScheduleEvent: MutateDelete
  events: ScheduleEvent[]
  refetch: () => Promise<unknown>
  resetComposerState: () => void
  rooms: Room[]
  setLocalEvents: Dispatch<SetStateAction<ScheduleEvent[]>>
  setMutationError: (_message: string | null) => void
  updateScheduleEvent: MutateUpdate
}

const dateFromIso = (dateIso: string) => new Date(`${dateIso}T00:00:00`)
const isDailyEvent = (event: ScheduleEvent) => event.daysOfWeek.length >= 5
const recurringDaysForMove = (event: ScheduleEvent, targetDayOfWeek: number) => isDailyEvent(event) ? event.daysOfWeek : [targetDayOfWeek]
const isValidDateRange = (validFrom: string, validUntil: string | null) => !validUntil || validFrom <= validUntil
const minutesToTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const shiftDate = (dateIso: string, deltaDays: number) => toIsoDate(addDays(dateFromIso(dateIso), deltaDays))
const moveDay = (day: number, delta: number) => ((day - 1 + delta) % 7 + 7) % 7 + 1
const getImplicitGroupKey = (event: ScheduleEvent) => JSON.stringify([event.title.trim().toLowerCase(), event.type, event.isOverride ? event.date ?? '' : event.validFrom ?? '', event.isOverride ? event.date ?? '' : event.validUntil ?? '', event.notes ?? ''])

export function useSchedulerMoveController({ createScheduleEvent, deleteScheduleEvent, events, refetch, resetComposerState, rooms, setLocalEvents, setMutationError, updateScheduleEvent }: ControllerProps) {
  const [pendingMove, setPendingMove] = useState<PendingEventMove | null>(null)
  const [conflictPreview, setConflictPreview] = useState<MoveConflictPreview | null>(null)
  const [moveDrafts, setMoveDrafts] = useState<MoveDraft[]>([])
  const groupEventsFor = (event: ScheduleEvent) => {
    if (event.groupId) return events.filter(candidate => candidate.groupId === event.groupId)
    const groupKey = getImplicitGroupKey(event)
    const implicitGroup = events.filter(candidate => !candidate.groupId && getImplicitGroupKey(candidate) === groupKey)
    return implicitGroup.length > 1 ? implicitGroup : [event]
  }
  const canMoveGroup = Boolean(pendingMove && groupEventsFor(pendingMove.event).length > 1)
  const buildMoveSelection = (event: ScheduleEvent, roomId: string, dayOfWeek: number, startSlot: number, slotMinutes: number): Selection => {
    const slotCount = slotMinutes === DAY_VIEW_SLOT_MINUTES ? DAY_VIEW_SLOT_COUNT : SLOT_COUNT
    const durationSlots = Math.max(1, Math.ceil((timeToMinutes(event.endTime) - timeToMinutes(event.startTime)) / slotMinutes))
    return { roomId, dayOfWeek, startSlot, endSlot: Math.min(slotCount - 1, startSlot + durationSlots - 1), slotMinutes }
  }
  const buildMovedInput = (pending: PendingEventMove, scope: MoveScope): ScheduleEventMutationInput => {
    const event = events.find(candidate => candidate.id === pending.event.id) ?? pending.event
    const { startTime, endTime } = getSelectionTimeRange(pending.selection)
    const isOccurrence = scope === 'occurrence' || event.isOverride
    return createMutationInputFromEvent(event, { roomId: pending.selection.roomId, startTime, endTime, daysOfWeek: isOccurrence ? [pending.selection.dayOfWeek] : recurringDaysForMove(event, pending.selection.dayOfWeek), date: isOccurrence ? pending.targetDateIso : null, isOverride: isOccurrence, validFrom: isOccurrence ? null : event.validFrom ?? pending.targetDateIso, validUntil: isOccurrence ? null : event.validUntil ?? null })
  }
  const conflictsFor = (items: MovePlanItem[], excludeEventIds: string[], sourceOccurrence?: { dateIso: string; event: ScheduleEvent }) => items.map(({ input }) => findScheduleConflict({ ...input, excludeEventIds, sourceOccurrence }, events, rooms)).filter((conflict): conflict is ScheduleConflict => conflict !== null).map(formatScheduleConflict)
  const buildSinglePlan = (pending: PendingEventMove, scope: MoveScope): MovePlan => {
    const event = events.find(candidate => candidate.id === pending.event.id) ?? pending.event
    const input = buildMovedInput({ ...pending, event }, scope)
    const sourceOccurrence = scope === 'occurrence' ? { dateIso: pending.sourceDateIso, event } : undefined
    const items = [{ event, input }]
    return { items, conflicts: conflictsFor(items, scope === 'occurrence' ? [] : [event.id], sourceOccurrence) }
  }
  const buildGroupPlan = (pending: PendingEventMove): MovePlan => {
    const groupEvents = groupEventsFor(pending.event)
    const deltaMinutes = timeToMinutes(getSelectionTimeRange(pending.selection).startTime) - timeToMinutes(pending.event.startTime)
    const deltaDays = pending.selection.dayOfWeek - pending.sourceDayOfWeek
    const moveRoomTogether = groupEvents.every(event => event.roomId === pending.event.roomId)
    const invalids: string[] = []
    const items = groupEvents.map((event) => {
      const startMinutes = timeToMinutes(event.startTime) + deltaMinutes
      const endMinutes = timeToMinutes(event.endTime) + deltaMinutes
      if (startMinutes < PLANNING_START_HOUR * 60 || endMinutes > PLANNING_END_HOUR * 60) invalids.push(`${event.title} ажлын цагийн гадна гарна.`)
      const nextDay = moveDay(event.dayOfWeek, deltaDays)
      const input = createMutationInputFromEvent(event, { roomId: moveRoomTogether || event.id === pending.event.id ? pending.selection.roomId : event.roomId, startTime: minutesToTime(startMinutes), endTime: minutesToTime(endMinutes), daysOfWeek: event.isOverride ? [nextDay] : recurringDaysForMove(event, nextDay), date: event.isOverride ? shiftDate(event.date ?? pending.sourceDateIso, deltaDays) : null, isOverride: event.isOverride, validFrom: event.isOverride ? null : event.validFrom ?? pending.targetDateIso, validUntil: event.isOverride ? null : event.validUntil ?? null })
      return { event, input }
    })
    return { items, conflicts: [...invalids, ...conflictsFor(items, groupEvents.map(event => event.id))] }
  }
  const buildPlan = (scope: MoveScope, pending: PendingEventMove): MovePlan => (scope === 'group' || scope === 'series') && groupEventsFor(pending.event).length > 1 ? buildGroupPlan(pending) : buildSinglePlan(pending, scope)
  const moveLocalEvents = (items: MovePlanItem[]) => setLocalEvents(current => current.map((event) => {
    const moveItem = items.find(item => item.event.id === event.id)
    if (!moveItem) return event
    const { input } = moveItem
    return {
      ...event,
      roomId: input.roomId,
      title: input.title,
      groupId: input.groupId ?? undefined,
      type: input.type,
      startTime: input.startTime,
      endTime: input.endTime,
      dayOfWeek: input.daysOfWeek[0] ?? event.dayOfWeek,
      daysOfWeek: input.daysOfWeek,
      date: input.date ?? undefined,
      isOverride: input.isOverride,
      instructor: input.instructor ?? undefined,
      notes: input.notes ?? undefined,
      validFrom: input.validFrom ?? undefined,
      validUntil: input.validUntil ?? undefined,
    }
  }))
  const applyRecurringOccurrenceMove = async (pending: PendingEventMove) => {
    const event = events.find(candidate => candidate.id === pending.event.id) ?? pending.event
    const originalValidFrom = event.validFrom ?? pending.sourceDateIso
    const originalValidUntil = event.validUntil ?? null
    const beforeUntil = shiftDate(pending.sourceDateIso, -1)
    const afterFrom = shiftDate(pending.sourceDateIso, 1)
    const baseInput = createMutationInputFromEvent(event, { date: null, isOverride: false, validFrom: originalValidFrom, validUntil: originalValidUntil })
    if (isValidDateRange(originalValidFrom, beforeUntil)) {
      await updateScheduleEvent({ variables: { id: event.id, input: { ...baseInput, validUntil: beforeUntil } } })
      if (isValidDateRange(afterFrom, originalValidUntil)) await createScheduleEvent({ variables: { input: { ...baseInput, validFrom: afterFrom } } })
    } else if (isValidDateRange(afterFrom, originalValidUntil)) await updateScheduleEvent({ variables: { id: event.id, input: { ...baseInput, validFrom: afterFrom } } })
    else await deleteScheduleEvent({ variables: { id: event.id } })
    await createScheduleEvent({ variables: { input: buildMovedInput(pending, 'occurrence') } })
  }
  const applyPlan = async (plan: MovePlan, scope: MoveScope, pending: PendingEventMove) => {
    const localItems = plan.items.filter(item => item.event.id.startsWith('local-'))
    const remoteItems = plan.items.filter(item => !item.event.id.startsWith('local-'))
    if (localItems.length > 0) moveLocalEvents(localItems)
    if (scope === 'occurrence' && !pending.event.isOverride) await applyRecurringOccurrenceMove(pending)
    else for (const item of remoteItems) await updateScheduleEvent({ variables: { id: item.event.id, input: item.input } })
    await refetch(); resetComposerState(); setPendingMove(null); setConflictPreview(null)
  }
  const applyMove = async (scope: MoveScope) => {
    if (!pendingMove) return
    const plan = buildPlan(scope, pendingMove)
    if (plan.conflicts.length > 0) { setConflictPreview({ scope, conflicts: plan.conflicts }); return }
    try { setMutationError(null); await applyPlan(plan, scope, pendingMove) } catch (error) { setMutationError(error instanceof Error ? error.message : 'Хуваарийг зөөж чадсангүй') }
  }
  const saveConflictDraft = () => {
    if (!pendingMove || !conflictPreview) return
    setMoveDrafts(current => [{ id: `move-draft-${crypto.randomUUID()}`, pending: pendingMove, scope: conflictPreview.scope, conflicts: conflictPreview.conflicts, title: pendingMove.event.title }, ...current])
    setPendingMove(null); setConflictPreview(null); setMutationError('Давхцалтай зөөх өөрчлөлтийг draft болгож хадгаллаа.')
  }
  const confirmDraft = async (draftId: string) => {
    const draft = moveDrafts.find(candidate => candidate.id === draftId)
    if (!draft) return
    const plan = buildPlan(draft.scope, draft.pending)
    if (plan.conflicts.length > 0) { setMoveDrafts(current => current.map(item => item.id === draftId ? { ...item, conflicts: plan.conflicts } : item)); setMutationError('Draft дээр давхцал хэвээр байна.'); return }
    try { setMutationError(null); await applyPlan(plan, draft.scope, draft.pending); setMoveDrafts(current => current.filter(item => item.id !== draftId)) } catch (error) { setMutationError(error instanceof Error ? error.message : 'Draft баталж чадсангүй') }
  }
  const handleEventDrop = (event: ScheduleEvent, roomId: string, dayOfWeek: number, slot: number, slotMinutes: number, targetDateIso: string, sourceDateIso: string, sourceDayOfWeek: number) => { setPendingMove({ event, selection: buildMoveSelection(event, roomId, dayOfWeek, slot, slotMinutes), sourceDateIso, sourceDayOfWeek, targetDateIso }); setConflictPreview(null); setMutationError(null) }
  return { applyMove, canMoveGroup, closePendingMove: () => { setPendingMove(null); setConflictPreview(null) }, confirmDraft, conflictPreview, deleteDraft: (id: string) => setMoveDrafts(current => current.filter(item => item.id !== id)), handleEventDrop, moveDrafts, pendingMove, saveConflictDraft }
}
