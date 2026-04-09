import { AppHeader } from '@/components/app-header'
import { ActionCard } from '@/components/registry/action-card'
import { mockActionConfigs } from '@/lib/mock-configs'

export default function RegistryPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Үйлдлийн бүртгэл"
        description="Баримт үүсгэх үйлдлүүдийг тохируулах"
      />
      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {mockActionConfigs.map((config) => (
            <ActionCard key={config.action} config={config} />
          ))}
        </div>
      </main>
    </div>
  )
}
