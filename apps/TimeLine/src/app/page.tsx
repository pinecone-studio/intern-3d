'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PineconeSpinner } from '@/components/ui/pinecone-spinner'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <PineconeSpinner />
    </div>
  )
}
