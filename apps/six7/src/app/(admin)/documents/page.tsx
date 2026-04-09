'use client'

import { useState, useMemo } from 'react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { DocumentFilters } from '@/components/documents/document-filters'
import { DocumentTable } from '@/components/documents/document-table'
import { mockDocuments } from '@/lib/mock-data'

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [phase, setPhase] = useState('all')
  const [action, setAction] = useState('all')

  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter((doc) => {
      const matchesSearch =
        search === '' ||
        doc.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        doc.filename.toLowerCase().includes(search.toLowerCase())
      const matchesPhase = phase === 'all' || doc.phase === phase
      const matchesAction = action === 'all' || doc.action === action
      return matchesSearch && matchesPhase && matchesAction
    })
  }, [search, phase, action])

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Documents"
        description="Browse and manage generated documents"
      />
      <main className="flex-1 space-y-6 p-6">
        <DocumentFilters
          search={search}
          onSearchChange={setSearch}
          phase={phase}
          onPhaseChange={setPhase}
          action={action}
          onActionChange={setAction}
        />
        <Card>
          <CardContent className="pt-6">
            <DocumentTable documents={filteredDocuments} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
