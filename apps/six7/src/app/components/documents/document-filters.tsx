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
          placeholder="Ажилтны нэр эсвэл кодоор хайх..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={phase}
        onChange={(e) => onPhaseChange(e.target.value)}
        className="w-40"
      >
        <option value="all">Бүх үе шат</option>
        <option value="onboarding">Ажилд авах</option>
        <option value="working">Ажиллаж буй</option>
        <option value="offboarding">Ажлаас гарах</option>
      </Select>
      <Select
        value={action}
        onChange={(e) => onActionChange(e.target.value)}
        className="w-48"
      >
        <option value="all">Бүх үйлдэл</option>
        <option value="add_employee">Ажилтан нэмэх</option>
        <option value="promote_employee">Албан тушаал дэвшүүлэх</option>
        <option value="change_position">Албан тушаал өөрчлөх</option>
        <option value="offboard_employee">Ажилтныг чөлөөлөх</option>
      </Select>
    </div>
  )
}
