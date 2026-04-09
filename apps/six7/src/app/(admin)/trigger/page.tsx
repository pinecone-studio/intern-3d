'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { TriggerForm } from '@/components/trigger/trigger-form'
import { JobTimeline } from '@/components/trigger/job-timeline'
import { mockProcessingSteps } from '@/lib/mock-configs'

export default function TriggerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setShowTimeline(true)
    }, 1000)
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Manual Trigger"
        description="Manually trigger document generation"
      />
      <main className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <TriggerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          {showTimeline && (
            <JobTimeline
              jobId="job-demo-001"
              steps={mockProcessingSteps}
              docsCount={4}
            />
          )}
        </div>
      </main>
    </div>
  )
}
