import type { DeviceAssignmentRow } from '@/db/schema'

export const seedDeviceAssignments: DeviceAssignmentRow[] = [
  { id: 'room-301-device-1', roomId: 'room-301', deviceName: 'iMac-01', userId: 'student-1' },
  { id: 'room-301-device-2', roomId: 'room-301', deviceName: 'iMac-02', userId: null },
  { id: 'room-302-device-1', roomId: 'room-302', deviceName: 'iMac-01', userId: null },
  { id: 'room-303-device-1', roomId: 'room-303', deviceName: 'iMac-01', userId: null },
  { id: 'room-304-device-1', roomId: 'room-304', deviceName: 'iMac-01', userId: null },
  { id: 'room-305-device-1', roomId: 'room-305', deviceName: 'iMac-01', userId: null },
  { id: 'room-401-device-1', roomId: 'room-401', deviceName: 'iMac-01', userId: null },
  { id: 'room-402-device-1', roomId: 'room-402', deviceName: 'iMac-01', userId: null },
  { id: 'room-403-device-1', roomId: 'room-403', deviceName: 'iMac-01', userId: null },
]
