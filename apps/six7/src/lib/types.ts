export type JobStatus = 'success' | 'processing' | 'failed' | 'pending' | 'warning'

export type LifecyclePhase = 'onboarding' | 'working' | 'offboarding'

export type ActionType = 'add_employee' | 'promote_employee' | 'change_position' | 'offboard_employee'

export type RecipientRole = 'hr_team' | 'department_chief' | 'branch_manager' | 'ceo'

export type StepState = 'completed' | 'running' | 'failed' | 'skipped' | 'pending'

export type Employee = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  firstNameEng: string
  lastNameEng: string
  department: string
  branch: string
  level: string
  hireDate: string
  numberOfVacationDays: number
  terminationDate: string | null
  status: 'active' | 'inactive' | 'pending'
  email: string
}

export type Document = {
  id: string
  filename: string
  action: ActionType
  employeeId: string
  employeeName: string
  generatedDate: string
  fileType: 'pdf' | 'docx'
  status: JobStatus
  phase: LifecyclePhase
  signedUrlExpiry: string
  storagePath: string
}

export type AuditLogEntry = {
  id: string
  timestamp: string
  employeeId: string
  employeeName: string
  action: ActionType
  documentsCount: number
  recipientsNotified: RecipientRole[]
  triggerSource: 'webhook' | 'manual' | 'scheduled'
  status: JobStatus
  retryCount: number
  changedFields: string[]
  storagePaths: string[]
  failureReason: string | null
}

export type ActionConfig = {
  action: ActionType
  phase: LifecyclePhase
  triggerFields: string[]
  recipientRoles: RecipientRole[]
  documents: string[]
  triggerCondition: string
}

export type Job = {
  id: string
  action: ActionType
  employeeId: string
  employeeName: string
  status: JobStatus
  createdAt: string
  completedAt: string | null
  documentsCount: number
  estimatedCompletion: string
}

export type ProcessingStep = {
  id: string
  name: string
  state: StepState
  timestamp: string | null
  details: string | null
}

export type DashboardStats = {
  totalDocuments: number
  totalActions: number
  successRate: number
  failedJobs: number
  pendingJobs: number
  avgProcessingTime: string
}
