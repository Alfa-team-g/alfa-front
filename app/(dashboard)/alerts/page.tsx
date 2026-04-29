"use client";

import { AlertsList } from "@/components/dashboard/alerts-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AlertsPage() {
  const { alerts, alertRegistrations, isLoading } = useDashboard();
  const [search, setSearch] = useState("");
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    personName: string;
    store: string;
    targetPoints: number;
    currentPoints: number;
    previousPoints: number;
    triggeredAt: string;
  } | null>(null);

  const promoCount = alerts.filter((alert) => alert.promo).length;

  const registrationsWithMatch = useMemo(
    () =>
      alertRegistrations.map((registration) => {
        const matchedAlert = alerts.find((alert) => {
          if (alert.store !== registration.store) return false;
          if (registration.rule === ">=") return alert.currentPoints >= registration.targetPoints;
          return alert.currentPoints <= registration.targetPoints;
        });
        return { registration, matchedAlert };
      }),
    [alertRegistrations, alerts],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Alertas</h1>
            <p className="text-muted-foreground">
              Promocoes detectadas e pessoas monitoradas
            </p>
          </div>
          <Button asChild>
            <Link href="/alerts/new">Cadastrar alerta</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total: {alerts.length}</span>
            <span>•</span>
            <span>Promocoes: {promoCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`rounded-full border px-3 py-1 text-xs ${onlyPromo ? "border-border text-muted-foreground" : "border-blue-500/50 bg-blue-500/10 text-blue-400"}`}
              onClick={() => setOnlyPromo(false)}
            >
              Todos
            </button>
            <button
              className={`rounded-full border px-3 py-1 text-xs ${onlyPromo ? "border-blue-500/50 bg-blue-500/10 text-blue-400" : "border-border text-muted-foreground"}`}
              onClick={() => setOnlyPromo(true)}
            >
              So promocao
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por loja, detalhe ou pessoa"
            className="h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <AlertsList showAll searchTerm={search} onlyPromo={onlyPromo} variant="catalog" />
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-base font-semibold">Pessoas monitoradas</h2>
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </>
          ) : registrationsWithMatch.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pessoa vinculada ainda.</p>
          ) : (
            registrationsWithMatch.map(({ registration, matchedAlert }) => (
              <div
                key={registration.id}
                className="flex items-center justify-between rounded-md border border-border p-2"
              >
                <button
                  type="button"
                  disabled={!matchedAlert}
                  onClick={() =>
                    matchedAlert &&
                    setSelectedMatch({
                      personName: registration.personName,
                      store: registration.store,
                      targetPoints: registration.targetPoints,
                      currentPoints: matchedAlert.currentPoints,
                      previousPoints: matchedAlert.previousPoints,
                      triggeredAt: matchedAlert.triggeredAt,
                    })
                  }
                  className="text-sm font-medium disabled:cursor-default disabled:text-muted-foreground"
                >
                  {registration.personName} - {registration.store}
                </button>
                <Badge
                  variant="outline"
                  className={
                    matchedAlert
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                      : "border-muted-foreground/40 text-muted-foreground"
                  }
                >
                  {matchedAlert ? "encontrado" : "nao encontrado"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={Boolean(selectedMatch)} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promocao ativa</DialogTitle>
            <DialogDescription>
              {selectedMatch?.personName} • {selectedMatch?.store}
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-2 text-sm">
              <p>Meta cadastrada: {selectedMatch.targetPoints} pts/R$1</p>
              <p>Pontuacao atual: {selectedMatch.currentPoints} pts/R$1</p>
              <p>Pontuacao anterior: {selectedMatch.previousPoints} pts/R$1</p>
              <p>Detectado em: {new Date(selectedMatch.triggeredAt).toLocaleString("pt-BR")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
