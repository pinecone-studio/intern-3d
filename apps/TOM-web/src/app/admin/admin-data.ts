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
  clubStatus: 'pending' | 'active' | 'paused' | 'spam';
  flaggedReason?: string;
};

export type ActiveClub = ClubBase & {
  requestStatus: 'approved';
  clubStatus: 'active' | 'paused';
};

export type ClubForm = {
  clubName: string;
  teacher: string;
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
  teacher: '',
  startDate: '2025-09-01',
  endDate: '2025-12-20',
  allowedDays: '',
  gradeRange: '',
  studentLimit: '12',
  interestCount: '0',
  note: '',
};

export const initialUserForm: UserForm = {
  name: 'Ганбат Энх',
  email: 'ganbat.enkh@school.mn',
  role: 'student',
  reason: 'Хичээл, клубийн оролцоонд тулгуурласан анхан шатны бүртгэл.',
};

export const initialRequests: ClubRequest[] = [
  {
    id: 'club-robotics',
    clubName: 'Роботик клуб',
    teacher: 'Багш Сараа Ким',
    createdBy: 'СТЕМ баг',
    interestCount: 11,
    studentLimit: 14,
    gradeRange: '6A - 7B анги',
    allowedDays: 'Даваа, Лхагва, Баасан',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending',
    clubStatus: 'pending',
    note: 'Практик бүтээцийн хичээл болон тэмцээний бэлтгэлтэй.',
  },
  {
    id: 'club-writing',
    clubName: 'Бүтээлч бичгийн клуб',
    teacher: 'Нараа багш',
    createdBy: 'Хэлний уран зохиолын баг',
    interestCount: 7,
    studentLimit: 12,
    gradeRange: '6A - 6C анги',
    allowedDays: 'Мягмар, Пүрэв',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending',
    clubStatus: 'pending',
    note: 'Хүртээмжийн босго хүрсэн, админы баталгаажуулалт хүлээж байна.',
  },
  {
    id: 'club-debate',
    clubName: 'Мэтгэлцээний клуб',
    teacher: 'Бат-Эрдэнэ багш',
    createdBy: 'Оюутны зөвлөл',
    interestCount: 4,
    studentLimit: 10,
    gradeRange: '7A - 8B анги',
    allowedDays: 'Лхагва, Бямба',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending',
    clubStatus: 'pending',
    note: 'Нээлт хийхээс өмнө цөөн хэдэн бүртгэл нэмэгдэхийг хүлээж байна.',
  },
];

export const initialSpamQueue: ClubRequest[] = [
  {
    id: 'spam-club-1',
    clubName: 'Үнэгүй iPad бэлэг клуб',
    teacher: 'Тодорхойгүй хэрэглэгч',
    createdBy: 'Гадаад холбоос',
    interestCount: 1,
    studentLimit: 99,
    gradeRange: 'Бүх анги',
    allowedDays: 'Хэзээ ч',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending',
    clubStatus: 'spam',
    flaggedReason:
      'Сэжигтэй нэр, сурталчилгааны өнгө аяс, багшийн эзэмшигчгүй байна.',
    note: 'Хуурамч мэт харагдаж байгаа тул нэн даруй устгах шаардлагатай.',
  },
  {
    id: 'spam-club-2',
    clubName: 'Даалгавар туслагч бот',
    teacher: 'Жинхэнэ ажилтан биш',
    createdBy: 'Нэргүй хүсэлт',
    interestCount: 2,
    studentLimit: 80,
    gradeRange: 'Бүх анги',
    allowedDays: 'Даваа-Баасан',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending',
    clubStatus: 'spam',
    flaggedReason: 'Давтагдсан түлхүүр үгтэй автомат илгээсэн хүсэлт байж магадгүй.',
    note: 'Сурагчдад хүрэхээс өмнө шалгаж цэвэрлэх шаардлагатай.',
  },
];

export const initialActiveClubs: ActiveClub[] = [
  {
    id: 'active-english',
    clubName: 'Англи хэлний клуб',
    teacher: 'Темүүлэн багш',
    createdBy: 'Батлагдсан хүсэлт',
    interestCount: 9,
    studentLimit: 12,
    gradeRange: '6A - 7B анги',
    allowedDays: 'Даваа, Лхагва, Баасан',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'approved',
    clubStatus: 'active',
    note: 'Семестрийг давах хангалттай сонирхолтойгоор хэвийн явагдаж байна.',
  },
  {
    id: 'active-design',
    clubName: 'Дизайны клуб',
    teacher: 'Багш Сараа Ким',
    createdBy: 'Батлагдсан хүсэлт',
    interestCount: 6,
    studentLimit: 10,
    gradeRange: '7A - 8B анги',
    allowedDays: 'Мягмар, Пүрэв',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'approved',
    clubStatus: 'paused',
    note: 'Дараагийн элсэлт босгод хүрэх хүртэл түр зогсоосон.',
  },
];

export const initialManagedUsers: ManagedUser[] = [
  {
    id: 'user-admin-1',
    name: 'Насанжаргал Баярхүү',
    email: 'nasanjargalbayrhvv@gmail.com',
    role: 'admin',
    accountStatus: 'active',
    reason: 'TOM системийн үндсэн админ хэрэглэгч.',
    lastActive: '2026-04-27',
    clubCount: 0,
    notes: 'Админ самбар болон moderation flow-ийг эзэмшинэ.',
  },
  {
    id: 'user-student-1',
    name: 'Анударь Ням',
    email: 'anudari.nyam@school.mn',
    role: 'student',
    accountStatus: 'active',
    reason: 'Ердийн идэвхтэй сурагчийн бүртгэл.',
    lastActive: '2026-04-21',
    clubCount: 3,
    notes: 'Роботик болон Урлагийн клубт оролцож байсан.',
  },
  {
    id: 'user-teacher-1',
    name: 'Бат-Очир Төмөр',
    email: 'bat-ochir@school.mn',
    role: 'teacher',
    teacherProfileName: 'Бат-Эрдэнэ багш',
    accountStatus: 'active',
    reason: 'Клуб удирдах эрхтэй багш.',
    lastActive: '2026-04-20',
    clubCount: 4,
    notes: 'СТЕМ, Мэтгэлцээний клубүүдийн админ.',
  },
  {
    id: 'user-student-2',
    name: 'Мөнхжин Ариун',
    email: 'munkhjin@school.mn',
    role: 'student',
    accountStatus: 'restricted',
    reason: 'Дахин бүртгэлийн шалгалт дуустал хязгаарласан.',
    lastActive: '2026-04-19',
    clubCount: 1,
    notes: 'Илүү баталгаажуулалт шаардлагатай.',
  },
  {
    id: 'user-teacher-2',
    name: 'Саруул Намуун',
    email: 'saruul.namuun@school.mn',
    role: 'teacher',
    teacherProfileName: 'Нараа багш',
    accountStatus: 'banned',
    reason: 'Зөрчил илэрсэн тул түр хаасан.',
    lastActive: '2026-04-12',
    clubCount: 0,
    notes: 'Админы хяналт шаардлагатай.',
  },
  {
    id: 'user-student-3',
    name: 'Дэлгэрмаа Сүхбаатар',
    email: 'delgermaa.sukhbaatar@school.mn',
    role: 'student',
    accountStatus: 'active',
    reason: 'Ердийн идэвхтэй сурагчийн бүртгэл.',
    lastActive: '2026-04-22',
    clubCount: 2,
    notes: 'Хөгжим болон Уран зургийн клубт оролцдог.',
  },
  {
    id: 'user-student-4',
    name: 'Энхболд Батмөнх',
    email: 'enkhbold.batmunkh@school.mn',
    role: 'student',
    accountStatus: 'active',
    reason: 'Ердийн идэвхтэй сурагчийн бүртгэл.',
    lastActive: '2026-04-21',
    clubCount: 1,
    notes: 'Роботик клубт шинээр элссэн.',
  },
  {
    id: 'user-student-5',
    name: 'Номинчимэг Гантулга',
    email: 'nominchimeg.gantulga@school.mn',
    role: 'student',
    accountStatus: 'restricted',
    reason: 'Идэвхгүй байдлын улмаас түр хязгаарласан.',
    lastActive: '2026-03-30',
    clubCount: 0,
    notes: 'Нэмэлт баталгаажуулалт хүлээж байна.',
  },
  {
    id: 'user-teacher-3',
    name: 'Оюунцэцэг Дорж',
    email: 'oyuuntsetseg.dorj@school.mn',
    role: 'teacher',
    teacherProfileName: 'Багш Сараа Ким',
    accountStatus: 'active',
    reason: 'Клуб удирдах эрхтэй багш.',
    lastActive: '2026-04-23',
    clubCount: 2,
    notes: 'Монгол хэл, Уран зохиолын клубүүдийг удирддаг.',
  },
  {
    id: 'user-teacher-4',
    name: 'Эрдэнэбаяр Ганбаатар',
    email: 'erdenebayar.ganbaatar@school.mn',
    role: 'teacher',
    teacherProfileName: 'Темүүлэн багш',
    accountStatus: 'active',
    reason: 'Клуб удирдах эрхтэй багш.',
    lastActive: '2026-04-22',
    clubCount: 3,
    notes: 'Математик, Шинжлэх ухааны клубүүдийн удирдагч.',
  },
  {
    id: 'user-teacher-5',
    name: 'Тунгалаг Нарантуяа',
    email: 'tungalag.narantuya@school.mn',
    role: 'teacher',
    teacherProfileName: 'Багш Сараа Ким',
    accountStatus: 'active',
    reason: 'Клуб удирдах эрхтэй багш.',
    lastActive: '2026-04-20',
    clubCount: 1,
    notes: 'Дизайн болон Урлагийн клубын зохицуулагч.',
  },
  {
    id: 'user-teacher-6',
    name: 'Болормаа Хишигтогтох',
    email: 'bolormaa.khishigtokh@school.mn',
    role: 'teacher',
    teacherProfileName: 'Бат-Эрдэнэ багш',
    accountStatus: 'active',
    reason: 'Клуб удирдах эрхтэй багш.',
    lastActive: '2026-04-19',
    clubCount: 2,
    notes: 'Англи хэл, Мэтгэлцээний клубүүдийн багш.',
  },
  {
    id: 'user-teacher-7',
    name: 'Жаргалмаа Цэдэнбал',
    email: 'jargalmaa.tsedenbal@school.mn',
    role: 'teacher',
    teacherProfileName: 'Нараа багш',
    accountStatus: 'restricted',
    reason: 'Гэрчилгээ шинэчлэлт дуустал хязгаарласан.',
    lastActive: '2026-04-10',
    clubCount: 1,
    notes: 'Гэрчилгээний баримт бичиг хянагдаж байна.',
  },
];

export const formatThresholdLabel = (current: number) => {
  if (current >= thresholdGoal) {
    return 'Босгонд хүрсэн';
  }

  const remaining = thresholdGoal - current;
  return `Идэвхжүүлэхэд ${remaining} хүн дутуу`;
};

export const requestToActiveClub = (request: ClubRequest): ActiveClub => ({
  id: request.id,
  clubName: request.clubName,
  teacher: request.teacher,
  createdBy: request.createdBy,
  interestCount: request.interestCount,
  studentLimit: request.studentLimit,
  gradeRange: request.gradeRange,
  allowedDays: request.allowedDays,
  startDate: request.startDate,
  endDate: request.endDate,
  requestStatus: 'approved',
  clubStatus: 'active',
  note: request.note,
});

export const createPendingRequest = (form: ClubForm): ClubRequest => ({
  id: `club-${form.clubName.toLowerCase().replace(/\s+/g, '-') || 'draft'}`,
  clubName: form.clubName || 'Нэргүй клуб',
  teacher: form.teacher,
  createdBy: 'Админ самбар',
  interestCount: Number(form.interestCount) || 0,
  studentLimit: Number(form.studentLimit) || 12,
  gradeRange: form.gradeRange,
  allowedDays: form.allowedDays,
  startDate: form.startDate,
  endDate: form.endDate,
  requestStatus: 'pending',
  clubStatus: 'pending',
  note: form.note || 'Админ самбараас шинээр үүсгэсэн клубийн хүсэлт.',
});

export const createManagedUser = (form: UserForm): ManagedUser => ({
  id: `user-${form.name.toLowerCase().replace(/\s+/g, '-') || 'draft'}`,
  name: form.name || 'Нэргүй хэрэглэгч',
  email: form.email || 'unknown@school.mn',
  role: form.role,
  accountStatus: 'active',
  reason: form.reason || 'Админ самбараас шинээр бүртгэгдсэн хэрэглэгч.',
  lastActive: '2026-04-22',
  clubCount: 0,
  notes: 'Шинэ бүртгэл.',
});

export const formatAccountStatusLabel = (status: UserAccountStatus) => {
  switch (status) {
    case 'active':
      return 'Идэвхтэй';
    case 'restricted':
      return 'Хязгаарласан';
    case 'banned':
      return 'Хориглосон';
    default:
      return status;
  }
};
