import { OPEN_LAB_STATUS, type EventType, type RoomStatus } from './types'

export const STATUS_CONFIG: Record<RoomStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  [OPEN_LAB_STATUS]: {
    label: 'Open Lab',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30',
    dotColor: 'bg-emerald-500',
  },
  class: {
    label: 'Хичээлтэй',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30',
    dotColor: 'bg-blue-500',
  },
  club: {
    label: 'Клубтэй',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-500/20 border-violet-200 dark:border-violet-500/30',
    dotColor: 'bg-violet-500',
  },
  event: {
    label: 'Eventтэй',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30',
    dotColor: 'bg-amber-500',
  },
}

// Event type colors for schedule display
export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; bgColor: string; borderColor: string }> = {
  class: { 
    label: 'Хичээл', 
    bgColor: 'bg-blue-500/80 dark:bg-blue-600/80',
    borderColor: 'border-l-blue-600 dark:border-l-blue-400',
  },
  club: { 
    label: 'Клуб', 
    bgColor: 'bg-violet-500/80 dark:bg-violet-600/80',
    borderColor: 'border-l-violet-600 dark:border-l-violet-400',
  },
  event: {
    label: 'Event',
    bgColor: 'bg-red-500/85 dark:bg-red-600/85',
    borderColor: 'border-l-red-600 dark:border-l-red-400',
  },
}

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Даваа', short: 'Дав' },
  { value: 2, label: 'Мягмар', short: 'Мяг' },
  { value: 3, label: 'Лхагва', short: 'Лха' },
  { value: 4, label: 'Пүрэв', short: 'Пүр' },
  { value: 5, label: 'Баасан', short: 'Баа' },
  { value: 6, label: 'Бямба', short: 'Бям' },
  { value: 0, label: 'Ням', short: 'Ням' },
]

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
]

export const PRIORITY_ORDER = ['event', 'class', 'club'] as const
