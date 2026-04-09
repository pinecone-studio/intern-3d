import type { ActionConfig, ProcessingStep, DashboardStats } from './types'

export const mockActionConfigs: ActionConfig[] = [
  {
    action: 'add_employee',
    phase: 'onboarding',
    triggerFields: ['status', 'hireDate'],
    recipientRoles: ['hr_team', 'department_chief', 'branch_manager'],
    documents: ['Employment Contract', 'Probation Order', 'Job Description', 'NDA'],
    triggerCondition: 'When status changes to "active" and hireDate is set',
  },
  {
    action: 'promote_employee',
    phase: 'working',
    triggerFields: ['level', 'position'],
    recipientRoles: ['hr_team', 'department_chief', 'ceo'],
    documents: ['Promotion Letter'],
    triggerCondition: 'When level or position is upgraded',
  },
  {
    action: 'change_position',
    phase: 'working',
    triggerFields: ['department', 'branch', 'position'],
    recipientRoles: ['hr_team', 'department_chief'],
    documents: ['Position Change Notice', 'Updated Job Description', 'Department Transfer Form'],
    triggerCondition: 'When department, branch, or position changes',
  },
  {
    action: 'offboard_employee',
    phase: 'offboarding',
    triggerFields: ['status', 'terminationDate'],
    recipientRoles: ['hr_team', 'department_chief', 'branch_manager', 'ceo'],
    documents: ['Termination Letter', 'Exit Clearance Form'],
    triggerCondition: 'When status changes to "inactive" and terminationDate is set',
  },
]

export const mockProcessingSteps: ProcessingStep[] = [
  { id: 'step-1', name: 'Event Received', state: 'completed', timestamp: '09:28:00', details: 'Webhook payload validated' },
  { id: 'step-2', name: 'Action Resolved', state: 'completed', timestamp: '09:28:05', details: 'Matched: add_employee' },
  { id: 'step-3', name: 'Employee Fetched', state: 'completed', timestamp: '09:28:10', details: 'EMP-2024-001' },
  { id: 'step-4', name: 'Templates Loaded', state: 'completed', timestamp: '09:28:15', details: '4 templates' },
  { id: 'step-5', name: 'PDFs Generated', state: 'completed', timestamp: '09:30:00', details: '4 documents' },
  { id: 'step-6', name: 'Uploaded to Storage', state: 'completed', timestamp: '09:32:00', details: 'Cloud storage' },
  { id: 'step-7', name: 'Emails Dispatched', state: 'completed', timestamp: '09:33:00', details: '3 recipients' },
  { id: 'step-8', name: 'Audit Record Saved', state: 'completed', timestamp: '09:35:00', details: 'audit-001' },
]

export const mockDashboardStats: DashboardStats = {
  totalDocuments: 1247,
  totalActions: 423,
  successRate: 98.2,
  failedJobs: 8,
  pendingJobs: 3,
  avgProcessingTime: '2m 15s',
}

export const actionLabels: Record<string, string> = {
  add_employee: 'Add Employee',
  promote_employee: 'Promote Employee',
  change_position: 'Change Position',
  offboard_employee: 'Offboard Employee',
}

export const phaseLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  working: 'Working',
  offboarding: 'Offboarding',
}

export const roleLabels: Record<string, string> = {
  hr_team: 'HR Team',
  department_chief: 'Department Chief',
  branch_manager: 'Branch Manager',
  ceo: 'CEO',
}
