import { NextResponse } from 'next/server'

export function isProductionRuntime() {
  return process.env.NODE_ENV === 'production'
}

export function productionOnlyResponse(feature: string) {
  return NextResponse.json(
    { error: `${feature} is disabled in production.` },
    { status: 403 }
  )
}
