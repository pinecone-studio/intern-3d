'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PineconeLoader } from '@/components/ui/pinecone-loader'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <PineconeLoader />
    </div>
  )
}
