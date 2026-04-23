import type { Room, ScheduleEvent, Device, User, RoomStatus } from './types'

// Generate devices for a room
function generateDevices(roomId: string, roomNumber: string, count: number): Device[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${roomId}-device-${i + 1}`,
    name: `iMac-${String(i + 1).padStart(2, '0')}`,
    roomId,
    roomNumber,
    status: i === 6 ? 'assigned' : i === 12 ? 'maintenance' : 'available',
    assignedTo: i === 6 ? 'student-1' : undefined,
  }))
}

// Parse time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// For demo purposes, we simulate "current time" as 10:30 on a Tuesday (day 2)
const DEMO_DAY = 2 // Tuesday
const DEMO_TIME_MINUTES = 10 * 60 + 30 // 10:30 AM

// Check if demo time is within a time range
function isDemoTimeInRange(startTime: string, endTime: string): boolean {
  return DEMO_TIME_MINUTES >= timeToMinutes(startTime) && DEMO_TIME_MINUTES < timeToMinutes(endTime)
}

// Find current event for a room (at demo time)
function findCurrentEvent(events: ScheduleEvent[], roomId: string): ScheduleEvent | null {
  const roomEvents = events.filter(e => e.roomId === roomId && e.daysOfWeek.includes(DEMO_DAY))
  return roomEvents.find(e => isDemoTimeInRange(e.startTime, e.endTime)) || null
}

// Find next event for a room (after demo time)
function findNextEvent(events: ScheduleEvent[], roomId: string): ScheduleEvent | null {
  const roomEvents = events
    .filter(e => e.roomId === roomId && e.daysOfWeek.includes(DEMO_DAY))
    .filter(e => timeToMinutes(e.startTime) > DEMO_TIME_MINUTES)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  
  return roomEvents[0] || null
}

// Helper to create events - automatically sets dayOfWeek from first day in array
function createEvent(event: Omit<ScheduleEvent, 'dayOfWeek'>): ScheduleEvent {
  return {
    ...event,
    dayOfWeek: event.daysOfWeek[0],
  }
}

// Comprehensive schedule events - realistic academic schedule with date ranges
export const scheduleEvents: ScheduleEvent[] = [
  // ===== ROOM 301 - Web Development Lab =====
  // Recurring weekly classes with validity periods
  createEvent({ id: 'evt-301-web1', roomId: 'room-301', title: 'Веб хөгжүүлэлт I', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [1, 4], isOverride: false, instructor: 'Б. Болд', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-301-web2', roomId: 'room-301', title: 'Веб хөгжүүлэлт II', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [2], isOverride: false, instructor: 'Б. Болд', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-301-frontend', roomId: 'room-301', title: 'Frontend Framework', type: 'class', startTime: '10:00', endTime: '13:00', daysOfWeek: [3], isOverride: false, instructor: 'Б. Болд', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-301-web2-fri', roomId: 'room-301', title: 'Веб хөгжүүлэлт II', type: 'class', startTime: '13:00', endTime: '16:00', daysOfWeek: [5], isOverride: false, instructor: 'Б. Болд', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  // Open Lab times
  createEvent({ id: 'evt-301-openlab-mon', roomId: 'room-301', title: 'Open Lab', type: 'openlab', startTime: '13:00', endTime: '15:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-301-openlab-tue', roomId: 'room-301', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '17:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-301-openlab-wed', roomId: 'room-301', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '18:00', daysOfWeek: [3], isOverride: false }),
  createEvent({ id: 'evt-301-openlab-fri', roomId: 'room-301', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '12:00', daysOfWeek: [5], isOverride: false }),
  // Clubs
  createEvent({ id: 'evt-301-uiux', roomId: 'room-301', title: 'UI/UX Клуб', type: 'club', startTime: '16:00', endTime: '18:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-301-coding', roomId: 'room-301', title: 'Coding Club', type: 'club', startTime: '15:00', endTime: '17:00', daysOfWeek: [4], isOverride: false }),

  // ===== ROOM 302 - Mobile Development Lab =====
  createEvent({ id: 'evt-302-mobile', roomId: 'room-302', title: 'Мобайл хөгжүүлэлт', type: 'class', startTime: '13:00', endTime: '16:00', daysOfWeek: [1, 2, 4], isOverride: false, instructor: 'Д. Дорж', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-302-ios', roomId: 'room-302', title: 'iOS Development', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [3], isOverride: false, instructor: 'Д. Дорж', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-302-android', roomId: 'room-302', title: 'Android Workshop', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [5], isOverride: false, instructor: 'Д. Дорж', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-302-flutter', roomId: 'room-302', title: 'Flutter Клуб', type: 'club', startTime: '09:00', endTime: '11:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-302-openlab', roomId: 'room-302', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '12:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-302-openlab-wed', roomId: 'room-302', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '17:00', daysOfWeek: [3], isOverride: false }),
  createEvent({ id: 'evt-302-openlab-thu', roomId: 'room-302', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '18:00', daysOfWeek: [4], isOverride: false }),

  // ===== ROOM 303 - Data Science Lab =====
  createEvent({ id: 'evt-303-data', roomId: 'room-303', title: 'Дата шинжилгээ', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [1], isOverride: false, instructor: 'Г. Ганбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-303-data-tue', roomId: 'room-303', title: 'Дата шинжилгээ', type: 'class', startTime: '13:00', endTime: '16:00', daysOfWeek: [2], isOverride: false, instructor: 'Г. Ганбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-303-ml', roomId: 'room-303', title: 'Machine Learning', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [3], isOverride: false, instructor: 'Г. Ганбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-303-data-thu', roomId: 'room-303', title: 'Дата шинжилгээ', type: 'class', startTime: '14:00', endTime: '17:00', daysOfWeek: [4], isOverride: false, instructor: 'Г. Ганбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-303-dataviz', roomId: 'room-303', title: 'Data Visualization', type: 'class', startTime: '10:00', endTime: '13:00', daysOfWeek: [5], isOverride: false, instructor: 'Г. Ганбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-303-python', roomId: 'room-303', title: 'Python Клуб', type: 'club', startTime: '15:00', endTime: '17:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-303-ai', roomId: 'room-303', title: 'AI Клуб', type: 'club', startTime: '16:00', endTime: '18:00', daysOfWeek: [3], isOverride: false }),
  createEvent({ id: 'evt-303-openlab', roomId: 'room-303', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '12:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-303-openlab-thu', roomId: 'room-303', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '13:00', daysOfWeek: [4], isOverride: false }),

  // ===== ROOM 304 - General Purpose Lab =====
  createEvent({ id: 'evt-304-prog', roomId: 'room-304', title: 'Програмчлалын үндэс', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [1, 3], isOverride: false, instructor: 'Н. Нямаа', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-304-algo', roomId: 'room-304', title: 'Алгоритм', type: 'class', startTime: '08:30', endTime: '11:30', daysOfWeek: [2, 4], isOverride: false, instructor: 'Н. Нямаа', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-304-openlab', roomId: 'room-304', title: 'Open Lab', type: 'openlab', startTime: '13:00', endTime: '17:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-304-openlab-tue', roomId: 'room-304', title: 'Open Lab', type: 'openlab', startTime: '13:00', endTime: '16:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-304-openlab-wed', roomId: 'room-304', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '18:00', daysOfWeek: [3], isOverride: false }),
  createEvent({ id: 'evt-304-openlab-fri', roomId: 'room-304', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '17:00', daysOfWeek: [5], isOverride: false }),
  createEvent({ id: 'evt-304-gamedev', roomId: 'room-304', title: 'Game Dev Клуб', type: 'club', startTime: '17:00', endTime: '19:00', daysOfWeek: [2], isOverride: false }),

  // ===== ROOM 305 - Design Lab - CLOSED for maintenance on Tuesday =====
  createEvent({ id: 'evt-305-design', roomId: 'room-305', title: 'Дижитал дизайн', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [1, 5], isOverride: false, instructor: 'С. Сараа', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-305-design-wed', roomId: 'room-305', title: 'Дижитал дизайн', type: 'class', startTime: '10:00', endTime: '13:00', daysOfWeek: [3], isOverride: false, instructor: 'С. Сараа', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-305-uiux', roomId: 'room-305', title: 'UI/UX Workshop', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [4], isOverride: false, instructor: 'С. Сараа', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-305-openlab', roomId: 'room-305', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '17:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-305-openlab-thu', roomId: 'room-305', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '18:00', daysOfWeek: [4], isOverride: false }),
  createEvent({ id: 'evt-305-designclub', roomId: 'room-305', title: 'Design Клуб', type: 'club', startTime: '15:00', endTime: '17:00', daysOfWeek: [3], isOverride: false }),
  // Override: Closed for maintenance on Tuesday
  createEvent({ id: 'evt-305-closed', roomId: 'room-305', title: 'Засвартай', type: 'closed', startTime: '08:00', endTime: '18:00', daysOfWeek: [2], isOverride: true, notes: 'Тоног төхөөрөмж шинэчлэлт', date: '2026-04-15' }),

  // ===== EVENT HALL 3 =====
  createEvent({ id: 'evt-h3-openlab', roomId: 'room-hall-3', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '17:00', daysOfWeek: [1, 2, 3, 4], isOverride: false }),
  createEvent({ id: 'evt-h3-hackathon', roomId: 'room-hall-3', title: 'Хакатон бэлтгэл', type: 'closed', startTime: '09:00', endTime: '18:00', daysOfWeek: [5], isOverride: true, notes: 'Сурагчдын хакатон', date: '2026-04-18' }),

  // ===== ROOM 401 - Advanced Development Lab =====
  createEvent({ id: 'evt-401-sys', roomId: 'room-401', title: 'Систем хөгжүүлэлт', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [1], isOverride: false, instructor: 'Ө. Өлзий', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-401-sys-tue', roomId: 'room-401', title: 'Систем хөгжүүлэлт', type: 'class', startTime: '13:00', endTime: '16:00', daysOfWeek: [2], isOverride: false, instructor: 'Ө. Өлзий', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-401-cloud', roomId: 'room-401', title: 'Cloud Computing', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [3], isOverride: false, instructor: 'Ө. Өлзий', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-401-sys-thu', roomId: 'room-401', title: 'Систем хөгжүүлэлт', type: 'class', startTime: '10:00', endTime: '13:00', daysOfWeek: [4], isOverride: false, instructor: 'Ө. Өлзий', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-401-devops', roomId: 'room-401', title: 'DevOps Клуб', type: 'club', startTime: '16:00', endTime: '18:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-401-blockchain', roomId: 'room-401', title: 'Blockchain Клуб', type: 'club', startTime: '15:00', endTime: '17:00', daysOfWeek: [4], isOverride: false }),
  createEvent({ id: 'evt-401-openlab', roomId: 'room-401', title: 'Open Lab', type: 'openlab', startTime: '08:00', endTime: '12:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-401-openlab-wed', roomId: 'room-401', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '17:00', daysOfWeek: [3], isOverride: false }),
  createEvent({ id: 'evt-401-openlab-fri', roomId: 'room-401', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '17:00', daysOfWeek: [5], isOverride: false }),

  // ===== ROOM 402 - AI/ML Lab =====
  createEvent({ id: 'evt-402-ml', roomId: 'room-402', title: 'Машин сургалт', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [1], isOverride: false, instructor: 'Э. Энхбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-402-deep', roomId: 'room-402', title: 'Deep Learning', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [2], isOverride: false, instructor: 'Э. Энхбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-402-ml-wed', roomId: 'room-402', title: 'Машин сургалт', type: 'class', startTime: '13:00', endTime: '16:00', daysOfWeek: [3], isOverride: false, instructor: 'Э. Энхбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-402-nlp', roomId: 'room-402', title: 'NLP Workshop', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [4], isOverride: false, instructor: 'Э. Энхбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-402-aiproject', roomId: 'room-402', title: 'AI Project Lab', type: 'class', startTime: '10:00', endTime: '13:00', daysOfWeek: [5], isOverride: false, instructor: 'Э. Энхбат', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-402-aiclub', roomId: 'room-402', title: 'AI Клуб', type: 'club', startTime: '15:00', endTime: '17:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-402-openlab', roomId: 'room-402', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '17:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-402-openlab-wed', roomId: 'room-402', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '12:00', daysOfWeek: [3], isOverride: false }),
  createEvent({ id: 'evt-402-openlab-thu', roomId: 'room-402', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '18:00', daysOfWeek: [4], isOverride: false }),

  // ===== ROOM 403 - Multimedia Lab =====
  createEvent({ id: 'evt-403-video', roomId: 'room-403', title: 'Video Editing', type: 'class', startTime: '13:00', endTime: '16:00', daysOfWeek: [1, 2], isOverride: false, instructor: 'Т. Тэмүүлэн', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-403-motion', roomId: 'room-403', title: 'Motion Graphics', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [3], isOverride: false, instructor: 'Т. Тэмүүлэн', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-403-video-fri', roomId: 'room-403', title: 'Video Editing', type: 'class', startTime: '09:00', endTime: '12:00', daysOfWeek: [5], isOverride: false, instructor: 'Т. Тэмүүлэн', validFrom: '2026-04-01', validUntil: '2026-06-15' }),
  createEvent({ id: 'evt-403-photo', roomId: 'room-403', title: 'Photography Клуб', type: 'club', startTime: '09:00', endTime: '11:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-403-film', roomId: 'room-403', title: 'Film Клуб', type: 'club', startTime: '15:00', endTime: '17:00', daysOfWeek: [5], isOverride: false }),
  createEvent({ id: 'evt-403-openlab', roomId: 'room-403', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '12:00', daysOfWeek: [1], isOverride: false }),
  createEvent({ id: 'evt-403-openlab-wed', roomId: 'room-403', title: 'Open Lab', type: 'openlab', startTime: '14:00', endTime: '17:00', daysOfWeek: [3], isOverride: false }),
  createEvent({ id: 'evt-403-openlab-thu', roomId: 'room-403', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '17:00', daysOfWeek: [4], isOverride: false }),

  // ===== EVENT HALL 4 =====
  createEvent({ id: 'evt-h4-setup', roomId: 'room-hall-4', title: 'Арга хэмжээ бэлтгэл', type: 'closed', startTime: '08:00', endTime: '12:00', daysOfWeek: [2], isOverride: true, notes: 'Demo Day бэлтгэл', date: '2026-04-15' }),
  createEvent({ id: 'evt-h4-openlab', roomId: 'room-hall-4', title: 'Open Lab', type: 'openlab', startTime: '13:00', endTime: '17:00', daysOfWeek: [2], isOverride: false }),
  createEvent({ id: 'evt-h4-openlab-days', roomId: 'room-hall-4', title: 'Open Lab', type: 'openlab', startTime: '09:00', endTime: '17:00', daysOfWeek: [1, 3, 4], isOverride: false }),
  createEvent({ id: 'evt-h4-demoday', roomId: 'room-hall-4', title: 'Demo Day', type: 'closed', startTime: '14:00', endTime: '18:00', daysOfWeek: [5], isOverride: true, notes: 'Сурагчдын төсөл танилцуулга', date: '2026-04-18' }),
]

// Get room status based on current event - maps event type to room status
function getRoomStatus(events: ScheduleEvent[], roomId: string): RoomStatus {
  const currentEvent = findCurrentEvent(events, roomId)
  if (!currentEvent) return 'available'
  
  if (currentEvent.type === 'openlab') return 'available'
  if (currentEvent.type === 'class') return 'class'
  if (currentEvent.type === 'club') return 'club'
  if (currentEvent.type === 'closed') return 'closed'
  
  return 'available'
}

// Create rooms with current status
export function createRooms(): Room[] {
  const roomDefinitions: Omit<Room, 'status' | 'currentEvent' | 'nextEvent'>[] = [
    { id: 'room-301', number: '301', floor: 3, type: 'lab', devices: generateDevices('room-301', '301', 15) },
    { id: 'room-302', number: '302', floor: 3, type: 'lab', devices: generateDevices('room-302', '302', 12) },
    { id: 'room-303', number: '303', floor: 3, type: 'lab', devices: generateDevices('room-303', '303', 15) },
    { id: 'room-304', number: '304', floor: 3, type: 'lab', devices: generateDevices('room-304', '304', 10) },
    { id: 'room-305', number: '305', floor: 3, type: 'lab', devices: generateDevices('room-305', '305', 12) },
    { id: 'room-401', number: '401', floor: 4, type: 'lab', devices: generateDevices('room-401', '401', 15) },
    { id: 'room-402', number: '402', floor: 4, type: 'lab', devices: generateDevices('room-402', '402', 12) },
    { id: 'room-403', number: '403', floor: 4, type: 'lab', devices: generateDevices('room-403', '403', 10) },
    { id: 'room-hall-4', number: 'Event hall', floor: 4, type: 'event-hall', devices: [] },
  ]

  return roomDefinitions.map(room => ({
    ...room,
    status: getRoomStatus(scheduleEvents, room.id),
    currentEvent: findCurrentEvent(scheduleEvents, room.id),
    nextEvent: findNextEvent(scheduleEvents, room.id),
  }))
}

// Demo users - admin has instructor schedules
export const demoUsers: Record<string, User> = {
  admin: {
    id: 'admin-1',
    name: 'Б. Болд',
    role: 'admin',
    assignedDevice: null,
  },
  student: {
    id: 'student-1',
    name: 'Сурагч Д. Дэлгэр',
    role: 'student',
    assignedDevice: {
      id: 'room-301-device-7',
      name: 'iMac-07',
      roomId: 'room-301',
      roomNumber: '301',
      status: 'assigned',
      assignedTo: 'student-1',
    },
  },
}

// Get all events for a specific room
export function getEventsForRoom(roomId: string): ScheduleEvent[] {
  return scheduleEvents.filter(e => e.roomId === roomId)
}

// Get all events for a specific day (checks daysOfWeek array)
export function getEventsForDay(dayOfWeek: number): ScheduleEvent[] {
  return scheduleEvents.filter(e => e.daysOfWeek.includes(dayOfWeek))
}

// Get room by ID
export function getRoomById(roomId: string): Room | undefined {
  return createRooms().find(r => r.id === roomId)
}

// Get events for a specific instructor (teacher's personal schedule)
export function getEventsForInstructor(instructorName: string): ScheduleEvent[] {
  return scheduleEvents.filter(e => e.instructor?.includes(instructorName) || e.instructor === instructorName)
}

// Get all rooms
export function getAllRooms(): Room[] {
  return createRooms()
}
