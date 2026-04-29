'use client'

import { useDashboard } from '@/lib/dashboard-context'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Users, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StatCards() {
  const { stats } = useDashboard()

  const cards = [
    {
      title: 'Alertas ativos',
      value: stats.activeAlerts,
      icon: Bell,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Usuarios aguardando',
      value: stats.waitingUsers,
      icon: Users,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Ultimo scan',
      value: stats.lastScanTime
        ? formatDistanceToNow(new Date(stats.lastScanTime), { addSuffix: true, locale: ptBR })
        : 'Nunca',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      isText: true,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p
                  className={`mt-2 text-2xl font-semibold ${card.isText ? 'text-lg' : ''}`}
                >
                  {card.value}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
