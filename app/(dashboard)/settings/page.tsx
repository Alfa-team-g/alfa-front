"use client";

import { SchedulerControl } from "@/components/dashboard/scheduler-control";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuracoes</h1>
        <p className="text-muted-foreground">
          Configure suas preferencias de notificacao e agendamento
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SchedulerControl />

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Notificacoes</CardTitle>
            <CardDescription>
              Escolha como voce quer ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email-notifications">Notificacoes por e-mail</Label>
                <span className="text-sm text-muted-foreground">
                  Receber alertas por e-mail
                </span>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label htmlFor="push-notifications">Notificacoes push</Label>
                <span className="text-sm text-muted-foreground">
                  Receber notificacoes push do navegador
                </span>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="timezone">Fuso horario</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Selecione o fuso horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">
                    Brasilia (GMT-3)
                  </SelectItem>
                  <SelectItem value="America/New_York">
                    Nova York (GMT-4)
                  </SelectItem>
                  <SelectItem value="Europe/London">
                    Londres (GMT+1)
                  </SelectItem>
                  <SelectItem value="Europe/Paris">
                    Paris (GMT+2)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
