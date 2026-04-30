'use client'

import { GraduationCap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/lib/types'

type LoginUserOptionProps = {
  disabled: boolean
  user: User
  onSelect: (_user: User) => void
}

export function LoginUserOption({ disabled, user, onSelect }: LoginUserOptionProps) {
  const isAdmin = user.role === 'admin'

  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-start gap-4 p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
      disabled={disabled}
      onClick={() => void onSelect(user)}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${isAdmin ? 'border-blue-500/20 bg-blue-500/10' : 'border-emerald-500/20 bg-emerald-500/10'}`}>
        {isAdmin ? <ShieldCheck className="h-6 w-6 text-blue-400" /> : <GraduationCap className="h-6 w-6 text-emerald-400" />}
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="font-semibold text-foreground">{user.name}</span>
        <span className="text-sm text-muted-foreground">
          {isAdmin
            ? 'Хуваарь удирдах, төхөөрөмж хянах'
            : 'Сул өрөө хайх, хуваарь харах'}
        </span>
      </div>
    </Button>
  )
}
