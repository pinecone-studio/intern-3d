import Link from 'next/link'
import { ClipboardList, FileText, PlayCircle, Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const actions = [
  { label: 'Үйлдэл эхлүүлэх', href: '/trigger', icon: PlayCircle },
  { label: 'Аудит харах', href: '/audit', icon: ClipboardList },
  { label: 'Баримт үзэх', href: '/documents', icon: FileText },
  { label: 'Бүртгэл удирдах', href: '/registry', icon: Settings2 },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Түргэн үйлдлүүд</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex h-auto flex-col gap-2 rounded-md border border-border bg-secondary px-3 py-4 text-center transition-colors hover:bg-accent"
            >
              <Icon
                className="mx-auto h-5 w-5 text-foreground"
                strokeWidth={1.8}
              />
              <span className="text-xs">{action.label}</span>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
