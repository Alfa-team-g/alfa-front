'use client'

import { useDashboard } from '@/lib/dashboard-context'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { scheduler } = useDashboard()
  const hasTitle = Boolean(title)

  return (
    <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {hasTitle && (
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5',
            scheduler.isRunning
              ? 'border-warning/50 text-warning'
              : scheduler.isEnabled
                ? 'border-success/50 text-success'
                : 'border-muted-foreground/50 text-muted-foreground'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              scheduler.isRunning
                ? 'animate-pulse bg-warning'
                : scheduler.isEnabled
                  ? 'bg-success'
                  : 'bg-muted-foreground'
            )}
          />
          {scheduler.isRunning
            ? 'Escaneando...'
            : scheduler.isEnabled
              ? 'Agendador ativo'
              : 'Agendador pausado'}
        </Badge>
      </div>
    </header>
  )
}
