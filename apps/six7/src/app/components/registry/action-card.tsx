import { FileText, Settings, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ActionConfig } from '@/lib/types'
import {
  actionLabels,
  fieldLabels,
  phaseLabels,
  roleLabels,
} from '@/lib/mock-configs'

type ActionCardProps = {
  config: ActionConfig
}

export function ActionCard({ config }: ActionCardProps) {
  const isHighlighted = config.action === 'add_employee'

  return (
    <Card className={isHighlighted ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{actionLabels[config.action]}</CardTitle>
            {isHighlighted && (
              <Badge className="bg-primary text-primary-foreground">Жишээ</Badge>
            )}
          </div>
          <Badge variant="outline">{phaseLabels[config.phase]}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" strokeWidth={1.8} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" strokeWidth={1.8} />
            <span>Баримтууд ({config.documents.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {config.documents.map((doc) => (
              <Badge key={doc} variant="secondary" className="text-xs">
                {doc}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" strokeWidth={1.8} />
            <span>Хүлээн авагчид ({config.recipientRoles.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {config.recipientRoles.map((role) => (
              <Badge key={role} variant="outline" className="text-xs">
                {roleLabels[role]}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Өдөөгч талбарууд</p>
          <div className="flex flex-wrap gap-1">
            {config.triggerFields.map((field) => (
              <Badge key={field} variant="secondary" className="text-xs font-mono">
                {fieldLabels[field] ?? field}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">{config.triggerCondition}</p>
        </div>
      </CardContent>
    </Card>
  )
}
