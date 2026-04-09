import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'

type AppHeaderProps = {
  title: string
  description?: string
}

export function AppHeader({ title, description }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <SidebarTrigger />
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 md:justify-end">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 w-60 bg-secondary pl-9"
          />
        </div>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" strokeWidth={1.8} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-xs font-medium text-secondary-foreground">
          3
        </div>
        <div className="flex h-9 items-center rounded-full border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground">
          HR
        </div>
      </div>
    </header>
  )
}
