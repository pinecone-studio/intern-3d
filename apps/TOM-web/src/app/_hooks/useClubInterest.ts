'use client'

import { useCallback, useEffect, useState } from 'react'

type InterestState = {
  interested: boolean
  count: number
  loading: boolean
}

export function useClubInterest(clubId: string, initialCount = 0) {
  const [state, setState] = useState<InterestState>({
    interested: false,
    count: initialCount,
    loading: false,
  })

  useEffect(() => {
    let cancelled = false
    fetch(`/api/clubs/${clubId}/interest`)
      .then((r) => r.json() as Promise<{ count: number }>)
      .then((data) => {
        if (!cancelled) setState((s) => ({ ...s, count: data.count }))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [clubId])

  const toggle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const method = state.interested ? 'DELETE' : 'POST'
      const res = await fetch(`/api/clubs/${clubId}/interest`, { method })
      const data = (await res.json()) as { count: number }
      setState({ interested: !state.interested, count: data.count, loading: false })
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [clubId, state.interested])

  return { ...state, toggle }
}
