export const userRoleOptions = ['student', 'teacher'] as const;
export const userAccountStatusOptions = ['active', 'restricted', 'banned'] as const;

export const thresholdGoal = 7;

export type ClubBase = {
  id: string;
  clubName: string;
  teacher: string;
  createdBy: string;
  interestCount: number;
  studentLimit: number;
  gradeRange: string;
  allowedDays: string;
  startDate: string;
  endDate: string;
  note: string;
};

export type ClubRequest = ClubBase & {
  requestStatus: 'pending' | 'approved' | 'rejected';
  clubStatus: 'pending' | 'active' | 'paused';
  flaggedReason?: string;
};

export type ActiveClub = ClubBase & {
  memberCount: number;
  requestStatus: 'approved';
  clubStatus: 'active' | 'paused';
};

export type ClubForm = {
  clubName: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  allowedDays: string;
  gradeRange: string;
  studentLimit: string;
  interestCount: string;
  note: string;
};

export type UserRole = 'student' | 'teacher' | 'admin';

export type UserAccountStatus = (typeof userAccountStatusOptions)[number];

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teacherProfileName?: string;
  accountStatus: UserAccountStatus;
  reason: string;
  lastActive: string;
  clubCount: number;
  notes: string;
};

export type UserForm = {
  name: string;
  email: string;
  role: UserRole;
  reason: string;
};

export const initialForm: ClubForm = {
  clubName: '',
  teacherId: '',
  startDate: '2025-09-01',
  endDate: '2025-12-20',
  allowedDays: '',
  gradeRange: '',
  studentLimit: '12',
  interestCount: '0',
  note: '',
};

export const initialUserForm: UserForm = {
  name: '',
  email: '',
  role: 'student',
  reason: '',
};

export const formatThresholdLabel = (current: number) => {
  if (current >= thresholdGoal) {
    return 'Босгонд хүрсэн';
  }

  const remaining = thresholdGoal - current;
  return `Идэвхжүүлэхэд ${remaining} хүн дутуу`;
};
