export const teacherOptions = [
  'Багш Сараа Ким',
  'Бат-Эрдэнэ багш',
  'Нараа багш',
  'Темүүлэн багш',
] as const;

export const dayOptions = [
  'Даваа, Лхагва, Баасан',
  'Мягмар, Пүрэв',
  'Лхагва, Бямба',
  'Даваа, Мягмар, Пүрэв',
] as const;

export const gradeOptions = [
  '6A - 7B анги',
  '6A - 6C анги',
  '7A - 8B анги',
  '9A - 10B анги',
] as const;

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
  teacher: (typeof teacherOptions)[number];
  startDate: string;
  endDate: string;
  allowedDays: (typeof dayOptions)[number];
  gradeRange: (typeof gradeOptions)[number];
  studentLimit: string;
  interestCount: string;
  note: string;
};

export const initialForm: ClubForm = {
  clubName: '',
  teacher: teacherOptions[0],
  startDate: '2025-09-01',
  endDate: '2025-12-20',
  allowedDays: dayOptions[0],
  gradeRange: gradeOptions[0],
  studentLimit: '12',
  interestCount: '0',
  note: '',
};

export const initialRequests: ClubRequest[] = [
  {
    id: 'club-robotics',
    clubName: 'Robotics Club',
    teacher: 'Багш Сараа Ким',
    createdBy: 'STEM баг',
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
