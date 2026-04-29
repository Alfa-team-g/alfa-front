"use client";

import { useEffect, useState } from "react";
import { StatCards } from "@/components/dashboard/stat-cards";
import { SchedulerControl } from "@/components/dashboard/scheduler-control";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/lib/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { alertRegistrations, isLoading } = useDashboard();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const pendingRegistrations = alertRegistrations.filter(
    (registration) => registration.status === "aguardando",
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadPendingCount() {
      try {
        const response = await fetch("/api/alerts?type=registrations&summary=count", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const payload = (await response.json()) as { pendingCount?: number };
        setPendingCount(Number(payload.pendingCount ?? 0));
      } catch {
        // fallback to local list
      }
    }

    void loadPendingCount();
    return () => controller.abort();
  }, [alertRegistrations.length]);

  return (
    <div className="flex flex-col gap-6">
      <StatCards />

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pendentes</CardTitle>
            <Badge variant="outline">
              Usuarios aguardando: {pendingCount ?? pendingRegistrations.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
            </>
          ) : pendingRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pendente no momento.</p>
          ) : (
            pendingRegistrations.map((registration) => (
              <div key={registration.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">{registration.personName}</p>
                <p className="text-xs text-muted-foreground">
                  {registration.store} • {registration.targetPoints} pts/R$1
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <SchedulerControl />
    </div>
  );
}
