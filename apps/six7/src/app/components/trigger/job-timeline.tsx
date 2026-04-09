import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProcessingStep, StepState } from '@/lib/types'
import { cn } from '@/lib/utils'

type JobTimelineProps = {
  jobId: string
  steps: ProcessingStep[]
  docsCount: number
}

const stateIcons: Record<StepState, React.ReactNode> = {
  completed: 'OK',
  running: '...',
  failed: 'ERR',
  skipped: 'SKIP',
  pending: 'WAIT',
}

const stateColors: Record<StepState, string> = {
  completed: 'bg-emerald-500 text-white',
  running: 'bg-blue-500 text-white',
  failed: 'bg-red-500 text-white',
  skipped: 'bg-muted-foreground/50 text-white',
  pending: 'bg-muted text-muted-foreground',
}

export function JobTimeline({ jobId, steps, docsCount }: JobTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Progress</CardTitle>
        <CardDescription>
          Job ID: {jobId} | {docsCount} documents queued
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full',
                    stateColors[step.state]
                  )}
                >
                  <span className="text-[10px] font-semibold">
                    {stateIcons[step.state]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-full w-0.5 bg-border my-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{step.name}</p>
                  {step.timestamp && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                {step.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
