export const PLANNING_START_HOUR = 9
export const PLANNING_END_HOUR = 20
export const SLOT_MINUTES = 30
export const DAY_VIEW_SLOT_MINUTES = SLOT_MINUTES
export const DAY_MINUTES = (PLANNING_END_HOUR - PLANNING_START_HOUR) * 60
export const WORK_DAYS = [{ value: 1, label: 'Даваа', short: 'Mon' }, { value: 2, label: 'Мягмар', short: 'Tue' }, { value: 3, label: 'Лхагва', short: 'Wed' }, { value: 4, label: 'Пүрэв', short: 'Thu' }, { value: 5, label: 'Баасан', short: 'Fri' }, { value: 6, label: 'Бямба', short: 'Sat' }, { value: 7, label: 'Ням', short: 'Sun' }] as const
export const CALENDAR_DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
export const HOUR_MARKS = Array.from({ length: PLANNING_END_HOUR - PLANNING_START_HOUR + 1 }, (_, index) => PLANNING_START_HOUR + index)
export const VISIBLE_HOUR_MARKS = HOUR_MARKS.slice(0, -1).filter((hour) => (hour - PLANNING_START_HOUR) % 2 === 0 || hour === PLANNING_END_HOUR - 1)
export const HOUR_COUNT = PLANNING_END_HOUR - PLANNING_START_HOUR
export const SLOT_COUNT = DAY_MINUTES / SLOT_MINUTES
export const SLOT_INDEXES = Array.from({ length: SLOT_COUNT }, (_, index) => index)
export const DAY_VIEW_SLOT_COUNT = SLOT_COUNT
export const DAY_VIEW_SLOT_INDEXES = SLOT_INDEXES
export const HOUR_GRID_TEMPLATE = `repeat(${HOUR_COUNT}, minmax(0, 1fr))`
export const SLOT_GRID_TEMPLATE = `repeat(${SLOT_COUNT}, minmax(0, 1fr))`
export const SCHEDULER_GRID_TEMPLATE = '104px repeat(7, minmax(280px, 1fr))'
