export type ClubStatus = 'draft' | 'pending' | 'active' | 'paused' | 'archived' | 'spam'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'student' | 'teacher' | 'admin'
export type UserAccountStatus = 'active' | 'restricted' | 'banned'

export type Club = {
  id: string
  name: string
  description: string
  teacherName: string
  createdBy: string
  interestCount: number
  studentLimit: number
  memberCount: number
  gradeRange: string
  allowedDays: string
  startDate: string
  endDate: string
  note: string
  status: ClubStatus
  category: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

export type ClubRequest = {
  id: string
  clubName: string
  teacherName: string
  createdBy: string
  interestCount: number
  studentLimit: number
  gradeRange: string
  allowedDays: string
  startDate: string
  endDate: string
  note: string
  requestStatus: RequestStatus
  clubStatus: ClubStatus
  flaggedReason?: string | null
  createdAt: string
  updatedAt: string
}

export type ManagedUser = {
  id: string
  name: string
  email: string
  role: UserRole
  accountStatus: UserAccountStatus
  reason: string
  lastActive: string
  clubCount: number
  notes: string
  createdAt: string
  updatedAt: string
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export type SchoolEvent = {
  id: string
  title: string
  description: string
  location: string
  eventDate: string
  startTime: string
  endTime: string
  status: EventStatus
  createdBy: string
  participantCount: number
  createdAt: string
  updatedAt: string
}

export type EventInput = Partial<Omit<SchoolEvent, 'id' | 'createdAt' | 'updatedAt' | 'participantCount'>> & {
  title: string
  eventDate: string
}

export type ClubInput = Partial<Omit<Club, 'id' | 'createdAt' | 'updatedAt'>> & {
  name: string
}

export type ClubRequestInput = Partial<Omit<ClubRequest, 'id' | 'createdAt' | 'updatedAt'>> & {
  clubName: string
}

export type UserInput = Partial<Omit<ManagedUser, 'id' | 'createdAt' | 'updatedAt'>> & {
  name: string
  email: string
}
