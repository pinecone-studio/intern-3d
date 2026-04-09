'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const data = [
  { action: 'Add', count: 245, tone: 'bg-cyan-400' },
  { action: 'Promote', count: 89, tone: 'bg-emerald-400' },
  { action: 'Position', count: 156, tone: 'bg-amber-400' },
  { action: 'Offboard', count: 67, tone: 'bg-orange-400' },
]

export function ActionDistributionChart() {
  const maxCount = Math.max(...data.map((item) => item.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Action Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.action} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.action}</span>
              <span className="font-medium">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className={`h-2 rounded-full ${item.tone}`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
