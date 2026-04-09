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
        <CardTitle>Үйлдэл эхлүүлэх</CardTitle>
        <CardDescription>
          Ажилтанд зориулсан баримт үүсгэх үйлдлийг гараар эхлүүлэх
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Ажилтан</FieldLabel>
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
              <FieldLabel>Үйлдэл</FieldLabel>
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
              <FieldLabel>Хүлээн авагчийг өөрчлөх</FieldLabel>
              <FieldHint>Хоосон үлдээвэл урсгалын анхдагч хүлээн авагчийг ашиглана.</FieldHint>
              <Select defaultValue="">
                <option value="">Анхдагч хүлээн авагчдыг ашиглах</option>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <div>
                <Label htmlFor="dry-run">Туршилтын горим</Label>
                <FieldHint>Баримт үүсгэхгүйгээр урсгалыг урьдчилан харах.</FieldHint>
              </div>
              <Switch id="dry-run" />
            </div>
          </FieldGroup>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Эхлүүлж байна...' : 'Үйлдэл эхлүүлэх'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
