'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldHint, FieldLabel } from '@/components/ui/field'
import { mockEmployees } from '@/lib/mock-data'
import { actionLabels, roleLabels } from '@/lib/mock-configs'

type TriggerFormProps = {
  onSubmit: () => void
  isSubmitting: boolean
}

export function TriggerForm({ onSubmit, isSubmitting }: TriggerFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Action</CardTitle>
        <CardDescription>
          Manually trigger a document generation action for an employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Employee</FieldLabel>
              <Select
                defaultValue={mockEmployees[0].id}
              >
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstNameEng} {emp.lastNameEng} ({emp.employeeCode})
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel>Action</FieldLabel>
              <Select
                defaultValue="add_employee"
              >
                {Object.entries(actionLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel>Override Recipients</FieldLabel>
              <FieldHint>Leave empty to use the default workflow recipients.</FieldHint>
              <Select defaultValue="">
                <option value="">Use default recipients</option>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <div>
                <Label htmlFor="dry-run">Dry Run</Label>
                <FieldHint>Preview the workflow without generating documents.</FieldHint>
              </div>
              <Switch id="dry-run" />
            </div>
          </FieldGroup>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Triggering...' : 'Trigger Action'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
