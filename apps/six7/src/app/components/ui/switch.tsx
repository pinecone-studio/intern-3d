'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type SwitchProps = Omit<React.ComponentProps<'button'>, 'onChange'> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Switch({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  ...props
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internalChecked

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-state={isChecked ? 'checked' : 'unchecked'}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent bg-input p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=checked]:bg-primary',
        className,
      )}
      onClick={() => {
        const nextChecked = !isChecked
        if (!isControlled) {
          setInternalChecked(nextChecked)
        }
        onCheckedChange?.(nextChecked)
      }}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          'block h-5 w-5 rounded-full bg-background shadow-sm transition-transform data-[state=checked]:translate-x-5',
          isChecked && 'translate-x-5 bg-primary-foreground',
        )}
      />
    </button>
  )
}

export { Switch }
