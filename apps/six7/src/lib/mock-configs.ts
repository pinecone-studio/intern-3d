import type { ActionConfig, ProcessingStep, DashboardStats } from './types'

export const mockActionConfigs: ActionConfig[] = [
  {
    action: 'add_employee',
    phase: 'onboarding',
    triggerFields: ['status', 'hireDate'],
    recipientRoles: ['hr_team', 'department_chief', 'branch_manager'],
    documents: [
      'Хөдөлмөрийн гэрээ',
      'Туршилтын хугацааны тушаал',
      'Ажлын байрны тодорхойлолт',
      'Нууцлалын гэрээ',
    ],
    triggerCondition: 'Төлөв "идэвхтэй" болж, ажилд орсон огноо бүртгэгдэхэд ажиллана',
  },
  {
    action: 'promote_employee',
    phase: 'working',
    triggerFields: ['level', 'position'],
    recipientRoles: ['hr_team', 'department_chief', 'ceo'],
    documents: ['Дэвшүүлсэн тухай албан бичиг'],
    triggerCondition: 'Түвшин эсвэл албан тушаал ахих үед ажиллана',
  },
  {
    action: 'change_position',
    phase: 'working',
    triggerFields: ['department', 'branch', 'position'],
    recipientRoles: ['hr_team', 'department_chief'],
    documents: [
      'Албан тушаал өөрчлөх мэдэгдэл',
      'Шинэчилсэн ажлын байрны тодорхойлолт',
      'Хэлтэс шилжүүлэх маягт',
    ],
    triggerCondition: 'Хэлтэс, салбар эсвэл албан тушаал өөрчлөгдөхөд ажиллана',
  },
  {
    action: 'offboard_employee',
    phase: 'offboarding',
    triggerFields: ['status', 'terminationDate'],
    recipientRoles: ['hr_team', 'department_chief', 'branch_manager', 'ceo'],
    documents: ['Ажлаас чөлөөлөх албан бичиг', 'Ажлаас гарах хүлээлцэх хуудас'],
    triggerCondition:
      'Төлөв "идэвхгүй" болж, чөлөөлсөн огноо бүртгэгдэхэд ажиллана',
  },
]

export const mockProcessingSteps: ProcessingStep[] = [
  {
    id: 'step-1',
    name: 'Үйл явдлыг хүлээн авсан',
    state: 'completed',
    timestamp: '09:28:00',
    details: 'Ирсэн өгөгдлийг шалгасан',
  },
  {
    id: 'step-2',
    name: 'Үйлдлийг тодорхойлсон',
    state: 'completed',
    timestamp: '09:28:05',
    details: 'Таарсан үйлдэл: ажилтан нэмэх',
  },
  {
    id: 'step-3',
    name: 'Ажилтны мэдээллийг татсан',
    state: 'completed',
    timestamp: '09:28:10',
    details: 'EMP-2024-001',
  },
  {
    id: 'step-4',
    name: 'Загваруудыг ачаалсан',
    state: 'completed',
    timestamp: '09:28:15',
    details: '4 загвар',
  },
  {
    id: 'step-5',
    name: 'PDF баримтуудыг үүсгэсэн',
    state: 'completed',
    timestamp: '09:30:00',
    details: '4 баримт',
  },
  {
    id: 'step-6',
    name: 'Хадгалалтад байршуулсан',
    state: 'completed',
    timestamp: '09:32:00',
    details: 'Үүлэн хадгалалт',
  },
  {
    id: 'step-7',
    name: 'Мэдэгдлүүдийг илгээсэн',
    state: 'completed',
    timestamp: '09:33:00',
    details: '3 хүлээн авагч',
  },
  {
    id: 'step-8',
    name: 'Аудитын бүртгэлийг хадгалсан',
    state: 'completed',
    timestamp: '09:35:00',
    details: 'audit-001',
  },
]

export const mockDashboardStats: DashboardStats = {
  totalDocuments: 1247,
  totalActions: 423,
  successRate: 98.2,
  failedJobs: 8,
  pendingJobs: 3,
  avgProcessingTime: '2 мин 15 сек',
}

export const actionLabels: Record<string, string> = {
  add_employee: 'Ажилтан нэмэх',
  promote_employee: 'Албан тушаал дэвшүүлэх',
  change_position: 'Албан тушаал өөрчлөх',
  offboard_employee: 'Ажилтныг чөлөөлөх',
}

export const phaseLabels: Record<string, string> = {
  onboarding: 'Ажилд авах',
  working: 'Ажиллаж буй',
  offboarding: 'Ажлаас гарах',
}

export const roleLabels: Record<string, string> = {
  hr_team: 'Хүний нөөцийн баг',
  department_chief: 'Хэлтсийн дарга',
  branch_manager: 'Салбарын менежер',
  ceo: 'Гүйцэтгэх захирал',
}

export const fieldLabels: Record<string, string> = {
  status: 'Төлөв',
  hireDate: 'Ажилд орсон огноо',
  level: 'Түвшин',
  position: 'Албан тушаал',
  department: 'Хэлтэс',
  branch: 'Салбар',
  terminationDate: 'Чөлөөлсөн огноо',
}

export const triggerSourceLabels: Record<string, string> = {
  webhook: 'Вэбхук',
  manual: 'Гараар',
  scheduled: 'Хуваарьт',
}
