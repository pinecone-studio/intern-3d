'use client'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

type DocumentFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  phase: string
  onPhaseChange: (value: string) => void
  action: string
  onActionChange: (value: string) => void
}

export function DocumentFilters({
  search,
  onSearchChange,
  phase,
  onPhaseChange,
  action,
  onActionChange,
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-64 flex-1">
        <Input
          placeholder="Search by employee name or code..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={phase}
        onChange={(e) => onPhaseChange(e.target.value)}
        className="w-40"
      >
        <option value="all">All Phases</option>
        <option value="onboarding">Onboarding</option>
        <option value="working">Working</option>
        <option value="offboarding">Offboarding</option>
      </Select>
      <Select
        value={action}
        onChange={(e) => onActionChange(e.target.value)}
        className="w-48"
      >
        <option value="all">All Actions</option>
        <option value="add_employee">Add Employee</option>
        <option value="promote_employee">Promote Employee</option>
        <option value="change_position">Change Position</option>
        <option value="offboard_employee">Offboard Employee</option>
      </Select>
    </div>
  )
}
