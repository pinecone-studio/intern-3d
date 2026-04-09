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
        title="Settings"
        description="Configure system preferences"
      />
      <main className="flex-1 p-6">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure email notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <FieldHint>
                      Receive email alerts for failed jobs
                    </FieldHint>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Field>
                  <FieldLabel>Admin Email</FieldLabel>
                  <Input type="email" defaultValue="admin@company.com" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
              <CardDescription>Cloud storage configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Storage Bucket</FieldLabel>
                  <Input defaultValue="epas-documents-prod" disabled />
                </Field>
                <Field>
                  <FieldLabel>Signed URL Expiry (hours)</FieldLabel>
                  <Input type="number" defaultValue="24" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
