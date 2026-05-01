export type XpSource = 'manual' | 'event' | 'club' | 'badge'

export type XpLog = {
  id: string
  userId: string
  amount: number
  reason: string
  source: XpSource
  createdAt: string
}

export type Badge = {
  id: string
  name: string
  description: string
  icon: string
  xpThreshold: number
  eventCountThreshold: number
  clubCountThreshold: number
  createdAt: string
  updatedAt: string
}

export type UserBadge = {
  id: string
  userId: string
  badgeId: string
  awardedAt: string
}

export type XpLogInput = Partial<Omit<XpLog, 'id' | 'createdAt'>> & {
  userId: string
  amount: number
}

export type BadgeInput = Partial<Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>> & {
  name: string
}

export type ClubStatus = 'draft' | 'pending' | 'active' | 'paused' | 'archived'
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
  teacherProfileName?: string
  accountStatus: UserAccountStatus
  reason: string
  lastActive: string
  clubCount: number
  notes: string
  createdAt: string
  updatedAt: string
}

export type ClubMembership = {
  id: string
  clubId: string
  userId: string
  joinedAt: string
}

export type TomSession = {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export type TomCurrentUser = ManagedUser & {
  sessionId: string
  sessionExpiresAt: string
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

export type PublicUser = {
  id: string
  name: string
  role: UserRole
}

export type EventPost = {
  id: string
  eventId: string
  title: string
  body: string
  author: PublicUser
  likeCount: number
  likedByMe: boolean
  createdAt: string
  updatedAt: string
}

export type EventPostComment = {
  id: string
  postId: string
  body: string
  author: PublicUser
  createdAt: string
  updatedAt: string
}

export type ClubPost = {
  id: string
  clubId: string
  title: string
  body: string
  author: PublicUser
  likeCount: number
  likedByMe: boolean
  createdAt: string
  updatedAt: string
}

export type ClubPostComment = {
  id: string
  postId: string
  body: string
  author: PublicUser
  createdAt: string
  updatedAt: string
}

export type ClubInput = Partial<Omit<Club, 'id' | 'createdAt' | 'updatedAt'>> & {
  name: string
}

export type ClubMembershipInput = {
  clubId: string
}

export type ClubRequestInput = Partial<Omit<ClubRequest, 'id' | 'createdAt' | 'updatedAt'>> & {
  clubName: string
}

export type UserInput = Partial<Omit<ManagedUser, 'id' | 'createdAt' | 'updatedAt'>> & {
  name: string
  email: string
}

export type TomFormOptions = {
  teachers: string[]
  teacherOptions: Array<{
    id: string
    name: string
  }>
  allowedDays: string[]
  gradeRanges: string[]
}

export type ClubInterest = {
  id: string
  userId: string
  clubId: string
  createdAt: string
}
