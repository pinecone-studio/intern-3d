import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldHint, FieldLabel } from '@/components/ui/field'

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Тохиргоо"
        description="Системийн тохиргоог удирдах"
      />
      <main className="flex-1 p-6">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Мэдэгдэл</CardTitle>
              <CardDescription>Имэйл мэдэгдлийн тохиргоо хийх</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Имэйл мэдэгдэл</Label>
                    <FieldHint>
                      Алдаатай ажлын талаар имэйлээр мэдэгдэл авах
                    </FieldHint>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Field>
                  <FieldLabel>Админ имэйл</FieldLabel>
                  <Input type="email" defaultValue="admin@company.com" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Хадгалалт</CardTitle>
              <CardDescription>Үүлэн хадгалалтын тохиргоо</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Хадгалалтын сав</FieldLabel>
                  <Input defaultValue="epas-documents-prod" disabled />
                </Field>
                <Field>
                  <FieldLabel>Гарын үсэгтэй URL хүчинтэй хугацаа (цаг)</FieldLabel>
                  <Input type="number" defaultValue="24" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>Өөрчлөлт хадгалах</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
