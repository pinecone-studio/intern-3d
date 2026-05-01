type SeedClubRequest = {
  id: string
  clubName: string
  teacher: string
  createdBy: string
  interestCount: number
  studentLimit: number
  gradeRange: string
  allowedDays: string
  startDate: string
  endDate: string
  requestStatus: 'pending' | 'approved' | 'rejected'
  clubStatus: 'pending' | 'active' | 'paused'
  note: string
  flaggedReason?: string | null
}

export const seedClubRequests: SeedClubRequest[] = [
  {
    id: 'club-robotics',
    clubName: 'Роботик клуб',
    teacher: 'Багш Сараа Ким',
    createdBy: 'СТЕМ баг',
    interestCount: 11,
    studentLimit: 14,
    gradeRange: '3A анги',
    allowedDays: 'Даваа, Лхагва, Баасан',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending' as const,
    clubStatus: 'pending' as const,
    note: 'Практик бүтээцийн хичээл болон тэмцээний бэлтгэлтэй.',
  },
  {
    id: 'club-writing',
    clubName: 'Бүтээлч бичгийн клуб',
    teacher: 'Нараа багш',
    createdBy: 'Хэлний уран зохиолын баг',
    interestCount: 7,
    studentLimit: 12,
    gradeRange: '3B анги',
    allowedDays: 'Мягмар, Пүрэв',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending' as const,
    clubStatus: 'pending' as const,
    note: 'Хүртээмжийн босго хүрсэн, админы баталгаажуулалт хүлээж байна.',
  },
  {
    id: 'club-debate',
    clubName: 'Мэтгэлцээний клуб',
    teacher: 'Бат-Эрдэнэ багш',
    createdBy: 'Оюутны зөвлөл',
    interestCount: 4,
    studentLimit: 10,
    gradeRange: '3D анги',
    allowedDays: 'Лхагва, Бямба',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'pending' as const,
    clubStatus: 'pending' as const,
    note: 'Нээлт хийхээс өмнө цөөн хэдэн бүртгэл нэмэгдэхийг хүлээж байна.',
  },
];

export const seedActiveClubs = [
  {
    id: 'active-english',
    clubName: 'Англи хэлний клуб',
    teacher: 'Темүүлэн багш',
    createdBy: 'Батлагдсан хүсэлт',
    interestCount: 9,
    studentLimit: 12,
    gradeRange: '3A анги',
    allowedDays: 'Даваа, Лхагва, Баасан',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'approved' as const,
    clubStatus: 'active' as const,
    note: 'Семестрийг давах хангалттай сонирхолтойгоор хэвийн явагдаж байна.',
  },
  {
    id: 'active-design',
    clubName: 'Дизайны клуб',
    teacher: 'Багш Сараа Ким',
    createdBy: 'Батлагдсан хүсэлт',
    interestCount: 6,
    studentLimit: 10,
    gradeRange: '3D анги',
    allowedDays: 'Мягмар, Пүрэв',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    requestStatus: 'approved' as const,
    clubStatus: 'paused' as const,
    note: 'Дараагийн элсэлт босгод хүрэх хүртэл түр зогсоосон.',
  },
];

export const seedManagedUsers = [
  {
    id: 'user-admin-1',
    name: 'Насанжаргал Баярхүү',
    email: 'nasanjargalbayrhvv@gmail.com',
    role: 'admin' as const,
    accountStatus: 'active' as const,
    reason: 'TOM системийн үндсэн админ хэрэглэгч.',
    lastActive: '2026-04-27',
    clubCount: 0,
    notes: 'Админ самбар болон moderation flow-ийг эзэмшинэ.',
  },
  {
    id: 'user-student-1',
    name: 'Анударь Ням',
    email: 'anudari.nyam@school.mn',
    role: 'student' as const,
    accountStatus: 'active' as const,
    reason: 'Ердийн идэвхтэй сурагчийн бүртгэл.',
    lastActive: '2026-04-21',
    clubCount: 3,
    notes: 'Роботик болон Урлагийн клубт оролцож байсан.',
  },
  {
    id: 'user-teacher-1',
    name: 'Бат-Очир Төмөр',
    email: 'bat-ochir@school.mn',
    role: 'teacher' as const,
    teacherProfileName: 'Бат-Эрдэнэ багш',
    accountStatus: 'active' as const,
    reason: 'Клуб удирдах эрхтэй багш.',
    lastActive: '2026-04-20',
    clubCount: 4,
    notes: 'СТЕМ, Мэтгэлцээний клубүүдийн админ.',
  },
  {
    id: 'user-student-2',
    name: 'Мөнхжин Ариун',
    email: 'munkhjin@school.mn',
    role: 'student' as const,
    accountStatus: 'restricted' as const,
    reason: 'Дахин бүртгэлийн шалгалт дуустал хязгаарласан.',
    lastActive: '2026-04-19',
    clubCount: 1,
    notes: 'Илүү баталгаажуулалт шаардлагатай.',
  },
  {
    id: 'user-teacher-2',
    name: 'Саруул Намуун',
    email: 'saruul.namuun@school.mn',
    role: 'teacher' as const,
    teacherProfileName: 'Нараа багш',
    accountStatus: 'banned' as const,
    reason: 'Зөрчил илэрсэн тул түр хаасан.',
    lastActive: '2026-04-12',
    clubCount: 0,
    notes: 'Админы хяналт шаардлагатай.',
  },
];
