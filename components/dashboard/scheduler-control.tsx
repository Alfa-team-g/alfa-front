'use client'

import { useDashboard } from '@/lib/dashboard-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Play, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SchedulerState } from '@/lib/store'

interface SchedulerControlProps {
  expanded?: boolean
}

export function SchedulerControl({ expanded = false }: SchedulerControlProps) {
  const { scheduler, runScan, toggleScheduler, setFrequency } = useDashboard()

  const frequencyOptions: { value: SchedulerState['frequency']; label: string }[] = [
    { value: '15min', label: '15 minutos' },
    { value: '30min', label: '30 minutos' },
    { value: '1hour', label: '1 hora' },
  ]

  if (!expanded) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'rounded-lg p-2',
                  scheduler.isRunning
                    ? 'bg-warning/10'
                    : scheduler.isEnabled
                      ? 'bg-success/10'
                      : 'bg-muted'
                )}
              >
                <Zap
                  className={cn(
                    'h-5 w-5',
                    scheduler.isRunning
                      ? 'text-warning'
                      : scheduler.isEnabled
                        ? 'text-success'
                        : 'text-muted-foreground'
                  )}
                />
              </div>
              <div>
                <p className="font-medium">Agendador</p>
                {scheduler.isRunning ? (
                  <p className="text-sm text-muted-foreground">Escaneando...</p>
                ) : null}
              </div>
            </div>
            <Button
              onClick={runScan}
              disabled={scheduler.isRunning}
              size="sm"
            >
              {scheduler.isRunning ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Rodar agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Scan manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Dispare manualmente um scan para verificar promocoes em todas as lojas monitoradas.
          </p>
          <Button
            onClick={runScan}
            disabled={scheduler.isRunning}
            className="w-full sm:w-auto"
          >
            {scheduler.isRunning ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Escaneando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Rodar scan agora
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Scan automatico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ativar scan automatico</p>
              <p className="text-sm text-muted-foreground">
                Verificar promocoes automaticamente em intervalos regulares
              </p>
            </div>
            <Switch
              checked={scheduler.isEnabled}
              onCheckedChange={toggleScheduler}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">Frequencia do scan</p>
            </div>
            <Select
              value={scheduler.frequency}
              onValueChange={(v) =>
                setFrequency(v as SchedulerState['frequency'])
              }
              disabled={!scheduler.isEnabled}
            >
              <SelectTrigger className="w-full bg-secondary sm:w-[200px]">
                <SelectValue placeholder="Selecione a frequencia" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
