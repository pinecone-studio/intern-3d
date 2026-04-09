import * as React from 'react'

import { cn } from '@/lib/utils'

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('space-y-5', className)} {...props} />
  )
}

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('space-y-2', className)} {...props} />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm font-medium text-foreground', className)} {...props} />
  )
}

function FieldHint({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

export { FieldGroup, Field, FieldLabel, FieldHint }
