'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { MousePointer2 } from 'lucide-react'
import { useMutation, useQuery } from '@apollo/client/react'
import { DAY_VIEW_SLOT_COUNT, DAY_VIEW_SLOT_MINUTES, SLOT_COUNT, SLOT_MINUTES, WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { findScheduleConflict, formatScheduleConflict } from '@/app/dashboard/_lib/scheduler-conflicts'
import { addDays, formatMonthDayLabel, formatWeekdayName, getMonthDays, getMonthStart, getWeekStart, getYearMonths, getYearStart, isDateBefore, isSameMonth, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { buildMonthSummaries, buildYearSummaries, createMonthFilterTotals, createYearFilterTotals, getWeekDates, shouldRenderTimelineEvent } from '@/app/dashboard/_lib/scheduler-event-utils'
import { buildLocalEvent, createDefaultForm, createFormFromEvent, createMutationInputFromEvent, createSchedulerMutationInput, getSelectionForEvent, getSelectionTimeRange } from '@/app/dashboard/_lib/scheduler-form-utils'
import { CREATE_SCHEDULE_EVENT, DELETE_SCHEDULE_EVENT, GET_SCHEDULER_DATA, UPDATE_SCHEDULE_EVENT } from '@/app/dashboard/_lib/scheduler-queries'
import { normalizeTimelineTime, timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { DraftForm, MonthViewFilter, ScheduleEventMutationInput, SchedulerQueryResult, SchedulerViewMode, Selection } from '@/app/dashboard/_lib/scheduler-types'
import { SchedulerCalendarSidebar } from '@/app/dashboard/_components/scheduler-calendar-sidebar'
import { SchedulerDayView } from '@/app/dashboard/_components/scheduler-day-view'
import { SchedulerEventDialog } from '@/app/dashboard/_components/scheduler-event-dialog'
import { SchedulerLegend } from '@/app/dashboard/_components/scheduler-legend'
import { SchedulerMonthSummaryView } from '@/app/dashboard/_components/scheduler-month-summary-view'
import { SchedulerToolbar } from '@/app/dashboard/_components/scheduler-toolbar'
import { SchedulerWeekView } from '@/app/dashboard/_components/scheduler-week-view'
import { SchedulerYearOverviewView } from '@/app/dashboard/_components/scheduler-year-overview-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs } from '@/components/ui/tabs'
import type { ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

const normalizeSelection = (selection: Selection): Selection => ({ ...selection, startSlot: Math.min(selection.startSlot, selection.endSlot), endSlot: Math.max(selection.startSlot, selection.endSlot) })
const selectionKey = (selection: Selection) => { const normalized = normalizeSelection(selection); return `${normalized.roomId}:${normalized.dayOfWeek}:${normalized.startSlot}:${normalized.endSlot}:${normalized.slotMinutes}` }
const dedupeSelections = (selections: Selection[]) => { const seen = new Set<string>(); const nextSelections: Selection[] = []; for (const selection of selections.map(normalizeSelection)) { const key = selectionKey(selection); if (seen.has(key)) continue; seen.add(key); nextSelections.push(selection) } return nextSelections }
type EventMoveScope = 'occurrence' | 'series'
type PendingEventMove = { event: ScheduleEvent; selection: Selection; sourceDateIso: string; sourceDayOfWeek: number; targetDateIso: string }
const dateFromIso = (dateIso: string) => new Date(`${dateIso}T00:00:00`)
const isDailyEvent = (event: ScheduleEvent) => event.daysOfWeek.length >= 5
const recurringDaysForMove = (event: ScheduleEvent, targetDayOfWeek: number) => isDailyEvent(event) ? event.daysOfWeek : [targetDayOfWeek]
const isValidDateRange = (validFrom: string, validUntil: string | null) => !validUntil || validFrom <= validUntil

export function AdminScheduler() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date())); const [calendarMonth, setCalendarMonth] = useState(() => getMonthStart(new Date())); const [viewMode, setViewMode] = useState<SchedulerViewMode>('week'); const [focusedDate, setFocusedDate] = useState(() => { const today = new Date(); today.setHours(0, 0, 0, 0); return today }); const [weekMotionClass, setWeekMotionClass] = useState('opacity-100 translate-x-0 scale-100'); const [selectedBlocks, setSelectedBlocks] = useState<Selection[]>([]); const [previewSelection, setPreviewSelection] = useState<Selection | null>(null); const [stagedMultiSelect, setStagedMultiSelect] = useState(false); const [dialogOpen, setDialogOpen] = useState(false); const [batchCreateMode, setBatchCreateMode] = useState(false); const [form, setForm] = useState<DraftForm | null>(null); const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null); const [pendingMove, setPendingMove] = useState<PendingEventMove | null>(null); const [localEvents, setLocalEvents] = useState<ScheduleEvent[]>([]); const [mutationError, setMutationError] = useState<string | null>(null); const [selectedRoomTab, setSelectedRoomTab] = useState('all'); const [monthFilter, setMonthFilter] = useState<MonthViewFilter>('all'); const [yearFilter, setYearFilter] = useState<MonthViewFilter>('all')
  const { data, loading, error, refetch } = useQuery<SchedulerQueryResult>(GET_SCHEDULER_DATA); const [createScheduleEvent, { loading: saving }] = useMutation(CREATE_SCHEDULE_EVENT); const [updateScheduleEvent, { loading: updating }] = useMutation(UPDATE_SCHEDULE_EVENT); const [deleteScheduleEvent, { loading: deleting }] = useMutation(DELETE_SCHEDULE_EVENT)
  const rooms = useMemo(() => [...(data?.rooms ?? [])].sort((left, right) => left.number.localeCompare(right.number, 'mn', { numeric: true })), [data?.rooms]); const roomLookup = useMemo(() => new Map(rooms.map((room) => [room.id, room] as const)), [rooms]); const events = useMemo(() => [...(data?.events ?? []), ...localEvents].filter(shouldRenderTimelineEvent), [data?.events, localEvents]); const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]); const monthDays = useMemo(() => getMonthDays(calendarMonth), [calendarMonth]); const yearMonths = useMemo(() => getYearMonths(calendarMonth), [calendarMonth]); const yearStart = useMemo(() => getYearStart(calendarMonth), [calendarMonth]); const focusedDateLabel = useMemo(() => new Intl.DateTimeFormat('mn-MN', { month: '2-digit', day: '2-digit', weekday: 'long' }).format(focusedDate), [focusedDate]); const focusedDateTitle = useMemo(() => `${formatWeekdayName(focusedDate)} · ${formatMonthDayLabel(focusedDate)}`, [focusedDate]); const focusedDateIso = useMemo(() => toIsoDate(focusedDate), [focusedDate]); const focusedDayOfWeek = useMemo(() => focusedDate.getDay() === 0 ? 7 : focusedDate.getDay(), [focusedDate]); const selectedRoomView = useMemo(() => selectedRoomTab === 'all' ? null : rooms.find((room) => room.id === selectedRoomTab) ?? null, [rooms, selectedRoomTab]); const roomsForFocusedView = useMemo(() => selectedRoomView ? [selectedRoomView] : rooms, [rooms, selectedRoomView]); const scopedRoomIds = useMemo(() => new Set(roomsForFocusedView.map((room) => room.id)), [roomsForFocusedView]); const monthSummaries = useMemo(() => buildMonthSummaries(calendarMonth, events, monthDays, roomLookup, scopedRoomIds), [calendarMonth, events, monthDays, roomLookup, scopedRoomIds]); const monthFilterTotals = useMemo(() => createMonthFilterTotals(monthSummaries), [monthSummaries]); const yearSummaries = useMemo(() => buildYearSummaries({ yearMonths, events, roomLookup, roomsForFocusedView, scopedRoomIds, yearFilter }), [yearFilter, yearMonths, events, roomLookup, roomsForFocusedView, scopedRoomIds]); const yearFilterTotals = useMemo(() => createYearFilterTotals(yearSummaries), [yearSummaries]); const selectedYearSummary = useMemo(() => yearSummaries.find((summary) => isSameMonth(summary.monthStart, calendarMonth)) ?? yearSummaries[0] ?? null, [calendarMonth, yearSummaries]); const yearSummary = useMemo(() => yearSummaries.reduce((accumulator, summary) => ({ totalCount: accumulator.totalCount + summary.totalCount, activeMonths: accumulator.activeMonths + (summary.totalCount > 0 ? 1 : 0), classes: accumulator.classes + summary.counts.class, clubs: accumulator.clubs + summary.counts.club, closed: accumulator.closed + summary.counts.closed }), { totalCount: 0, activeMonths: 0, classes: 0, clubs: 0, closed: 0 }), [yearSummaries]); const displaySelections = useMemo(() => dedupeSelections(previewSelection ? [...selectedBlocks, previewSelection] : selectedBlocks), [previewSelection, selectedBlocks]); const primarySelection = selectedBlocks[0] ?? null; const selectedRoom = primarySelection ? rooms.find((room) => room.id === primarySelection.roomId) ?? null : null; const selectedRoomCount = useMemo(() => new Set(selectedBlocks.map((selection) => selection.roomId)).size, [selectedBlocks]); const selectedDay = primarySelection && selectedBlocks.length === 1 ? WORK_DAYS.find((day) => day.value === primarySelection.dayOfWeek) ?? null : null; const selectedDayName = primarySelection && selectedBlocks.length === 1 ? formatWeekdayName(addDays(weekStart, primarySelection.dayOfWeek - 1)) : null; const selectionSummary = useMemo(() => selectedBlocks.map((selection) => { const { startTime, endTime } = getSelectionTimeRange(selection); const roomNumber = roomLookup.get(selection.roomId)?.number ?? 'Unknown room'; return `${roomNumber} · ${formatWeekdayName(addDays(weekStart, selection.dayOfWeek - 1))} · ${startTime}-${endTime}` }), [roomLookup, selectedBlocks, weekStart])
  const getConflictMessage = (input: ScheduleEventMutationInput, excludeEventId?: string | null) => { const conflict = findScheduleConflict({ ...input, excludeEventId }, events, rooms); return conflict ? formatScheduleConflict(conflict) : null }
  const previousWeekStartRef = useRef(weekStart); const selectedBlocksRef = useRef<Selection[]>(selectedBlocks); const activeSelectionRef = useRef<Selection | null>(null); const isDraggingRef = useRef(false); const appendModeRef = useRef(false)
  const setSelectedBlocksState = (nextSelections: Selection[]) => { const normalizedSelections = dedupeSelections(nextSelections); selectedBlocksRef.current = normalizedSelections; setSelectedBlocks(normalizedSelections) }
  const clearInteractionState = () => { activeSelectionRef.current = null; isDraggingRef.current = false; appendModeRef.current = false; setPreviewSelection(null) }
  const resetComposerState = () => { clearInteractionState(); setSelectedBlocksState([]); setStagedMultiSelect(false); setBatchCreateMode(false); setEditingEvent(null) }
  useEffect(() => { const previous = previousWeekStartRef.current; if (previous.getTime() === weekStart.getTime()) return; setWeekMotionClass(isDateBefore(previous, weekStart) ? 'opacity-0 translate-x-10 scale-[0.985]' : 'opacity-0 -translate-x-10 scale-[0.985]'); const frameId = requestAnimationFrame(() => setWeekMotionClass('opacity-100 translate-x-0 scale-100')); previousWeekStartRef.current = weekStart; return () => cancelAnimationFrame(frameId) }, [weekStart])
  useEffect(() => { if (selectedRoomTab !== 'all' && !rooms.some((room) => room.id === selectedRoomTab)) setSelectedRoomTab('all') }, [rooms, selectedRoomTab])
  const updateWeekStart = (date: Date) => { const normalizedDate = new Date(date); normalizedDate.setHours(0, 0, 0, 0); const nextWeekStart = getWeekStart(date); setWeekStart(nextWeekStart); setCalendarMonth(getMonthStart(nextWeekStart)); setFocusedDate(normalizedDate) }
  const openCreateDialog = (targetSelections: Selection[] = selectedBlocksRef.current, options?: { staged?: boolean }) => { const fallbackSelection = rooms[0] ? { roomId: rooms[0].id, dayOfWeek: viewMode === 'day' ? focusedDayOfWeek : WORK_DAYS[0].value, startSlot: 0, endSlot: 1, slotMinutes: viewMode === 'day' ? DAY_VIEW_SLOT_MINUTES : SLOT_MINUTES } : null; const nextSelections = targetSelections.length > 0 ? dedupeSelections(targetSelections) : fallbackSelection ? [fallbackSelection] : []; if (nextSelections.length === 0) return; setSelectedBlocksState(nextSelections); setForm(createDefaultForm(nextSelections[0], weekStart)); setEditingEvent(null); setMutationError(null); setBatchCreateMode(Boolean(options?.staged && nextSelections.length > 1)); setDialogOpen(true); clearInteractionState() }
  const openEditDialog = (event: ScheduleEvent, roomId: string, dayOfWeek: number) => { const nextSelection = getSelectionForEvent(event, roomId, dayOfWeek, viewMode); setSelectedBlocksState([nextSelection]); setForm(createFormFromEvent(event, dayOfWeek, weekStart)); setEditingEvent(event); setMutationError(null); setDialogOpen(true); setStagedMultiSelect(false); setBatchCreateMode(false); clearInteractionState() }
  const stopDragging = () => { if (!isDraggingRef.current) return; clearInteractionState() }
  const handlePointerDown = (roomId: string, dayOfWeek: number, slot: number, slotMinutes: number, button: number, append: boolean) => { if (button !== 0) return; const nextSelection = normalizeSelection({ roomId, dayOfWeek, startSlot: slot, endSlot: slot, slotMinutes }); appendModeRef.current = append; activeSelectionRef.current = nextSelection; isDraggingRef.current = true; setMutationError(null); if (append) setPreviewSelection(nextSelection); else { setPreviewSelection(null); setSelectedBlocksState([nextSelection]); setStagedMultiSelect(false); setBatchCreateMode(false) } }
  const handlePointerEnter = (roomId: string, dayOfWeek: number, slot: number) => { if (!isDraggingRef.current || !activeSelectionRef.current) return; if (activeSelectionRef.current.roomId !== roomId || activeSelectionRef.current.dayOfWeek !== dayOfWeek) return; const nextSelection = normalizeSelection({ ...activeSelectionRef.current, endSlot: slot }); activeSelectionRef.current = nextSelection; if (appendModeRef.current) setPreviewSelection(nextSelection); else setSelectedBlocksState([nextSelection]) }
  const handlePointerUp = (roomId: string, dayOfWeek: number, slot: number, slotMinutes: number) => { if (!isDraggingRef.current || !activeSelectionRef.current) return; const fallbackSelection = normalizeSelection({ roomId, dayOfWeek, startSlot: slot, endSlot: slot, slotMinutes }); const finalSelection = activeSelectionRef.current.roomId === roomId && activeSelectionRef.current.dayOfWeek === dayOfWeek ? normalizeSelection({ ...activeSelectionRef.current, endSlot: slot, slotMinutes }) : fallbackSelection; const append = appendModeRef.current; clearInteractionState(); if (!append) { setSelectedBlocksState([finalSelection]); openCreateDialog([finalSelection]); return } const existingIndex = selectedBlocksRef.current.findIndex((selection) => selectionKey(selection) === selectionKey(finalSelection)); const nextSelections = existingIndex === -1 ? [...selectedBlocksRef.current, finalSelection] : selectedBlocksRef.current.filter((_, index) => index !== existingIndex); setSelectedBlocksState(nextSelections); setStagedMultiSelect(nextSelections.length > 0); setBatchCreateMode(false) }
  const handleContextMenu = (event: MouseEvent, roomId: string, dayOfWeek: number, slot: number, slotMinutes: number) => { event.preventDefault(); setStagedMultiSelect(false); setBatchCreateMode(false); openCreateDialog([{ roomId, dayOfWeek, startSlot: slot, endSlot: slot, slotMinutes }]) }
  const buildMoveSelection = (event: ScheduleEvent, roomId: string, dayOfWeek: number, startSlot: number, slotMinutes: number): Selection => {
    const slotCount = slotMinutes === DAY_VIEW_SLOT_MINUTES ? DAY_VIEW_SLOT_COUNT : SLOT_COUNT
    const durationSlots = Math.max(1, Math.ceil((timeToMinutes(event.endTime) - timeToMinutes(event.startTime)) / slotMinutes))
    return normalizeSelection({ roomId, dayOfWeek, startSlot, endSlot: Math.min(slotCount - 1, startSlot + durationSlots - 1), slotMinutes })
  }
  const buildMovedInput = (pending: PendingEventMove, scope: EventMoveScope): ScheduleEventMutationInput => {
    const { startTime, endTime } = getSelectionTimeRange(pending.selection)
    const isOccurrence = scope === 'occurrence' || pending.event.isOverride
    return createMutationInputFromEvent(pending.event, {
      roomId: pending.selection.roomId,
      startTime,
      endTime,
      daysOfWeek: isOccurrence ? [pending.selection.dayOfWeek] : recurringDaysForMove(pending.event, pending.selection.dayOfWeek),
      date: isOccurrence ? pending.targetDateIso : null,
      isOverride: isOccurrence,
      validFrom: isOccurrence ? null : pending.event.validFrom ?? pending.targetDateIso,
      validUntil: isOccurrence ? null : pending.event.validUntil ?? null,
    })
  }
  const moveLocalEvent = (pending: PendingEventMove, scope: EventMoveScope) => {
    const input = buildMovedInput(pending, scope)
    setLocalEvents((current) => current.map((event) => event.id === pending.event.id ? { ...event, roomId: input.roomId, startTime: input.startTime, endTime: input.endTime, daysOfWeek: input.daysOfWeek, dayOfWeek: input.daysOfWeek[0] ?? pending.selection.dayOfWeek, date: input.date ?? undefined, isOverride: input.isOverride, validFrom: input.validFrom ?? undefined, validUntil: input.validUntil ?? undefined } : event))
  }
  const applyRecurringOccurrenceMove = async (pending: PendingEventMove) => {
    const event = pending.event
    const originalValidFrom = event.validFrom ?? pending.sourceDateIso
    const originalValidUntil = event.validUntil ?? null
    const beforeUntil = toIsoDate(addDays(dateFromIso(pending.sourceDateIso), -1))
    const afterFrom = toIsoDate(addDays(dateFromIso(pending.sourceDateIso), 1))
    const baseRecurringInput = createMutationInputFromEvent(event, { date: null, isOverride: false, validFrom: originalValidFrom, validUntil: originalValidUntil })
    const hasBeforeRange = isValidDateRange(originalValidFrom, beforeUntil)
    const hasAfterRange = isValidDateRange(afterFrom, originalValidUntil)
    if (hasBeforeRange) {
      await updateScheduleEvent({ variables: { id: event.id, input: { ...baseRecurringInput, validUntil: beforeUntil } } })
      if (hasAfterRange) await createScheduleEvent({ variables: { input: { ...baseRecurringInput, validFrom: afterFrom } } })
    } else if (hasAfterRange) {
      await updateScheduleEvent({ variables: { id: event.id, input: { ...baseRecurringInput, validFrom: afterFrom } } })
    } else {
      await deleteScheduleEvent({ variables: { id: event.id } })
    }
    await createScheduleEvent({ variables: { input: buildMovedInput(pending, 'occurrence') } })
  }
  const applyEventMove = async (scope: EventMoveScope) => {
    if (!pendingMove) return
    try {
      setMutationError(null)
      const movedInput = buildMovedInput(pendingMove, scope === 'occurrence' ? 'occurrence' : 'series'); const conflictMessage = getConflictMessage(movedInput, pendingMove.event.id); if (conflictMessage) return setMutationError(conflictMessage)
      if (pendingMove.event.id.startsWith('local-')) moveLocalEvent(pendingMove, scope)
      else if (scope === 'occurrence' && !pendingMove.event.isOverride) await applyRecurringOccurrenceMove(pendingMove)
      else await updateScheduleEvent({ variables: { id: pendingMove.event.id, input: movedInput } })
      await refetch()
      setPendingMove(null)
      resetComposerState()
    } catch (moveError) {
      setMutationError(moveError instanceof Error ? moveError.message : 'Хуваарийг зөөж чадсангүй')
    }
  }
  const handleEventDrop = (event: ScheduleEvent, roomId: string, dayOfWeek: number, slot: number, slotMinutes: number, targetDateIso: string, sourceDateIso: string, sourceDayOfWeek: number) => {
    const selection = buildMoveSelection(event, roomId, dayOfWeek, slot, slotMinutes)
    const nextMove = { event, selection, sourceDateIso, sourceDayOfWeek, targetDateIso }
    clearInteractionState()
    setMutationError(null)
    if (event.isOverride) {
      void applyEventMoveDirect(nextMove)
      return
    }
    setPendingMove(nextMove)
  }
  const applyEventMoveDirect = async (move: PendingEventMove) => {
    try {
      setMutationError(null)
      const movedInput = buildMovedInput(move, 'series'); const conflictMessage = getConflictMessage(movedInput, move.event.id); if (conflictMessage) return setMutationError(conflictMessage)
      if (move.event.id.startsWith('local-')) moveLocalEvent(move, 'series')
      else await updateScheduleEvent({ variables: { id: move.event.id, input: movedInput } })
      await refetch()
      resetComposerState()
    } catch (moveError) {
      setMutationError(moveError instanceof Error ? moveError.message : 'Хуваарийг зөөж чадсангүй')
    }
  }
  const handleDialogOpenChange = (open: boolean) => { setDialogOpen(open); if (!open) setBatchCreateMode(false) }
  const handleSave = async () => { if (!primarySelection || !form || !form.title.trim()) return; const preserveSelectionTime = batchCreateMode && selectedBlocks.length > 1; if (!preserveSelectionTime && timeToMinutes(normalizeTimelineTime(form.endTime)) <= timeToMinutes(normalizeTimelineTime(form.startTime))) return setMutationError('Дуусах цаг эхлэх цагаас хойш байх ёстой.'); try { setMutationError(null); if (editingEvent) { const input = createSchedulerMutationInput(primarySelection, form); const conflictMessage = getConflictMessage(input, editingEvent.id); if (conflictMessage) return setMutationError(conflictMessage); if (editingEvent.id.startsWith('local-')) setLocalEvents((current) => current.map((event) => event.id === editingEvent.id ? { ...buildLocalEvent(primarySelection, form), id: editingEvent.id } : event)); else await updateScheduleEvent({ variables: { id: editingEvent.id, input } }); await refetch(); setDialogOpen(false); resetComposerState(); return } const selectionsToCreate = preserveSelectionTime ? selectedBlocks : [primarySelection]; const inputsToCreate = selectionsToCreate.map((selection) => ({ selection, input: createSchedulerMutationInput(selection, form, { forceWeekly: preserveSelectionTime, preserveSelectionTime }) })); const conflictMessage = inputsToCreate.map(({ input }) => getConflictMessage(input)).find(Boolean); if (conflictMessage) return setMutationError(conflictMessage); const failedSelections: Selection[] = []; let lastError: unknown = null; for (const { selection, input } of inputsToCreate) { try { await createScheduleEvent({ variables: { input } }) } catch (createError) { failedSelections.push(selection); lastError = createError } } await refetch(); if (failedSelections.length > 0) { setLocalEvents((current) => [...current, ...failedSelections.map((selection) => buildLocalEvent(selection, form, { forceWeekly: preserveSelectionTime, preserveSelectionTime }))]); const errorMessage = lastError instanceof Error ? lastError.message : 'Хуваарь хадгалж чадсангүй'; setMutationError(failedSelections.length === selectionsToCreate.length ? errorMessage : `${selectionsToCreate.length - failedSelections.length}/${selectionsToCreate.length} хуваарь хадгалагдлаа. Үлдсэнийг draft болголоо: ${errorMessage}`) } setDialogOpen(false); resetComposerState() } catch (saveError) { setMutationError(saveError instanceof Error ? saveError.message : 'Хуваарь хадгалж чадсангүй') } }
  const handleDelete = async () => { if (!editingEvent) return; try { setMutationError(null); if (editingEvent.id.startsWith('local-')) setLocalEvents((current) => current.filter((event) => event.id !== editingEvent.id)); else { await deleteScheduleEvent({ variables: { id: editingEvent.id } }); await refetch() } setDialogOpen(false); resetComposerState() } catch (deleteError) { setMutationError(deleteError instanceof Error ? deleteError.message : 'Хуваарь устгаж чадсангүй') } }
  return (
    <section className={cn('space-y-4 transition-[padding-right] duration-200', dialogOpen ? 'xl:pr-[26rem]' : 'pr-0')} onPointerLeave={stopDragging}>
      <div className="rounded-md border border-[#d1d1d1] bg-white shadow-sm dark:border-border dark:bg-card"><Tabs value={selectedRoomTab} onValueChange={setSelectedRoomTab} className="gap-0"><SchedulerToolbar rooms={rooms} setViewMode={setViewMode} viewMode={viewMode} /><div className="grid items-stretch gap-[5px] p-2 xl:grid-cols-[clamp(176px,18vw,212px)_minmax(0,1fr)]"><SchedulerCalendarSidebar calendarMonth={calendarMonth} focusedDate={focusedDate} isCalendarOpen monthDays={monthDays} onSelectDay={updateWeekStart} onToday={() => updateWeekStart(new Date())} setCalendarMonth={setCalendarMonth} summaryContent={viewMode === 'year' ? <div className="space-y-1.5 text-xs text-muted-foreground"><div className="font-semibold text-foreground">{yearStart.getFullYear()} оны тойм</div><div>{yearSummary.totalCount} хуваарь</div><div>{yearSummary.activeMonths} идэвхтэй сар</div><div>{yearSummary.classes} анги · {yearSummary.clubs} клуб · {yearSummary.closed} хаалттай</div></div> : null} viewMode={viewMode} weekStart={weekStart} /><div className={cn('h-full min-w-0 overflow-hidden rounded-2xl border border-[#e8e8eb] bg-white shadow-sm transition-all duration-500 ease-out dark:border-border dark:bg-card', weekMotionClass)}><div className="h-full overflow-auto">{viewMode === 'week' ? <SchedulerWeekView errorMessage={error?.message} events={events} loading={loading && !data} onContextMenu={handleContextMenu} onEditEvent={openEditDialog} onEventDrop={handleEventDrop} onPointerDown={handlePointerDown} onPointerEnter={handlePointerEnter} onPointerUp={handlePointerUp} rooms={rooms} selectedRoomTab={selectedRoomTab} selectedRoomView={selectedRoomView} selections={displaySelections} weekDates={weekDates} /> : viewMode === 'day' ? <SchedulerDayView errorMessage={error?.message} events={events} focusedDateIso={focusedDateIso} focusedDateLabel={focusedDateLabel} focusedDateTitle={focusedDateTitle} focusedDayOfWeek={focusedDayOfWeek} loading={loading && !data} onContextMenu={handleContextMenu} onEditEvent={openEditDialog} onEventDrop={handleEventDrop} onPointerDown={handlePointerDown} onPointerEnter={handlePointerEnter} onPointerUp={handlePointerUp} rooms={roomsForFocusedView} selections={displaySelections} /> : viewMode === 'month' ? <SchedulerMonthSummaryView calendarMonth={calendarMonth} focusedDate={focusedDate} monthSummaries={monthSummaries} monthFilter={monthFilter} monthFilterTotals={monthFilterTotals} onFilterChange={setMonthFilter} onSelectDate={(date) => { updateWeekStart(date); setViewMode('day') }} selectedRoomView={selectedRoomView} /> : <SchedulerYearOverviewView calendarMonth={calendarMonth} selectedRoomView={selectedRoomView} selectedYearSummary={selectedYearSummary} yearFilter={yearFilter} yearFilterTotals={yearFilterTotals} yearSummaries={yearSummaries} onFilterChange={setYearFilter} onSelectMonth={(date) => { setCalendarMonth(date); setFocusedDate(date); setWeekStart(getWeekStart(date)); setViewMode('month') }} />}</div></div></div></Tabs></div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><MousePointer2 className="h-3.5 w-3.5" /><span>Slot дээр чирээд үүсгэнэ, бэлэн хуваарийг чирээд зөөнө</span><span>Cmd/Ctrl + дарвал олон slot, олон өрөө сонгож болно</span>{stagedMultiSelect && selectedBlocks.length > 0 && !dialogOpen && <Badge variant="outline">{selectedRoomCount} өрөө · {selectedBlocks.length} сонголт</Badge>}{stagedMultiSelect && selectedBlocks.length > 0 && !dialogOpen && <Button type="button" size="sm" className="h-7 bg-[#6264a7] px-3 text-xs hover:bg-[#5558a7]" onClick={() => openCreateDialog(selectedBlocksRef.current, { staged: true })}>Нэг дор үүсгэх</Button>}{stagedMultiSelect && selectedBlocks.length > 0 && !dialogOpen && <Button type="button" size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={resetComposerState}>Цэвэрлэх</Button>}<SchedulerLegend color="bg-[#2564cf]" label="Элсэлт" /><SchedulerLegend color="bg-[#7f5ccf]" label="Клуб" /><SchedulerLegend color="bg-[#d83b01]" label="Event" />{mutationError && <Badge variant="outline" className="text-destructive">{mutationError}</Badge>}</div>
      <Dialog open={Boolean(pendingMove)} onOpenChange={(open) => { if (!open) setPendingMove(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Давтамжтай хуваарь зөөх</DialogTitle><DialogDescription>{pendingMove?.event.title} хуваарийг зөвхөн энэ удаагийн occurrence дээр өөрчлөх үү, эсвэл бүх давтагдах хуваарь дээр өөрчлөх үү?</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setPendingMove(null)}>Болих</Button>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => void applyEventMove('occurrence')}>Зөвхөн энэ удаа</Button><Button type="button" className="bg-[#6264a7] hover:bg-[#5558a7]" onClick={() => void applyEventMove('series')}>Бүх давталт</Button></div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SchedulerEventDialog deleting={deleting} dialogOpen={dialogOpen} editingEvent={editingEvent} form={form} isBatchCreate={batchCreateMode} mutationError={mutationError} onDelete={handleDelete} onOpenChange={handleDialogOpenChange} onSave={handleSave} saving={saving} selectedDayLabel={selectedDay?.label ?? null} selectedDayName={selectedDayName} selectedRoom={selectedRoom} selectedRoomCount={selectedRoomCount} selectionCount={selectedBlocks.length} selectionSummary={selectionSummary} setForm={setForm} updating={updating} />
    </section>
  )
}
