'use client'

import { useDashboard } from '@/lib/dashboard-context'
import { storeConfig } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Flame, TrendingUp, Users } from 'lucide-react'

interface AlertsListProps {
  compact?: boolean
  showAll?: boolean
  searchTerm?: string
  onlyPromo?: boolean
  variant?: 'default' | 'catalog'
}

export function AlertsList({
  compact = false,
  showAll = false,
  searchTerm = '',
  onlyPromo = false,
  variant = 'default',
}: AlertsListProps) {
  const { alerts } = useDashboard()
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const searchedAlerts = normalizedSearch
    ? alerts.filter((alert) => {
        const details = (alert.details ?? []).join(' ').toLowerCase()
        const notified = (alert.notifiedPeople ?? []).join(' ').toLowerCase()
        return (
          alert.store.toLowerCase().includes(normalizedSearch) ||
          details.includes(normalizedSearch) ||
          notified.includes(normalizedSearch)
        )
      })
    : alerts
  const filteredAlerts = onlyPromo ? searchedAlerts.filter((alert) => Boolean(alert.promo)) : searchedAlerts

  const displayAlerts = showAll
    ? filteredAlerts
    : compact
      ? filteredAlerts.slice(0, 3)
      : filteredAlerts.slice(0, 5)

  if (displayAlerts.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
          Nenhum alerta encontrado para o filtro atual.
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={cn(
        showAll
          ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
          : 'space-y-4'
      )}
    >
      {displayAlerts.map((alert) => {
        const visualConfig = storeConfig[alert.store as keyof typeof storeConfig] ?? {
          bgColor: 'bg-secondary',
          color: 'text-foreground',
        }

        return (
        <Card
          key={alert.id}
          className={cn(
            'overflow-hidden border-border bg-card transition-colors hover:bg-card/80',
            variant === 'catalog' && 'bg-card/90'
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'rounded-lg p-1.5',
                    visualConfig.bgColor
                  )}
                >
                  <Flame
                    className={cn('h-4 w-4', visualConfig.color)}
                  />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {alert.store}
                    <Badge
                      variant="outline"
                      className="border-blue-500/50 bg-blue-500/10 px-2 py-0 text-[10px] text-blue-400"
                    >
                      {alert.promo ? 'Promocao' : 'Alerta'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-secondary/20 p-3">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className={cn('h-3.5 w-3.5', variant === 'catalog' ? 'text-blue-400' : 'text-success')} />
                  <span className={cn('font-mono text-lg font-semibold', variant === 'catalog' ? 'text-blue-400' : 'text-success')}>
                    {alert.currentPoints} pontos
                  </span>
                  <span className="text-sm text-foreground">por R$ 1</span>
                </div>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Eram {alert.previousPoints} pontos
                </p>
              </div>

              {variant === 'catalog' ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">{alert.store}</p>
              ) : (
                alert.details &&
                alert.details.length > 0 && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{alert.details[0]}</p>
                )
              )}

              {variant !== 'catalog' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {alert.notifiedPeople.length} notificados:{' '}
                    {alert.notifiedPeople.join(', ') || 'nenhum'}
                  </span>
                </div>
              )}

              <Button
                asChild
                size="sm"
                className={cn(
                  'h-9 w-full rounded-full text-xs',
                  variant === 'catalog' && 'bg-blue-600 text-white hover:bg-blue-500'
                )}
              >
                <a
                  href={alert.partnerRulesUrl ?? 'https://www.livelo.com.br/'}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver parceiro
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
        )
      })}
    </div>
  )
}
