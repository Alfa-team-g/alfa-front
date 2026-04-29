"use client";

import { useDashboard } from "@/lib/dashboard-context";
import { stores, type Store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PeoplePage() {
  const {
    alerts,
    alertRegistrations,
    updateAlertRegistrationStatus,
    isLoading,
    storeFilter,
    setStoreFilter,
    statusFilter,
    setStatusFilter,
  } = useDashboard();
  const [selectedMatch, setSelectedMatch] = useState<{
    personName: string;
    store: string;
    targetPoints: number;
    currentPoints: number;
    previousPoints: number;
    triggeredAt: string;
  } | null>(null);

  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const storeOptions = useMemo(() => {
    const fromDb = alertRegistrations.map((r) => r.store);
    const merged = new Set<string>([...stores, ...fromDb]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [alertRegistrations]);

  const filteredRegistrations = alertRegistrations.filter((registration) => {
    if (storeFilter !== "all") {
      const regNorm = normalize(registration.store);
      const filtNorm = normalize(String(storeFilter));
      const sameStore =
        regNorm === filtNorm ||
        regNorm.includes(filtNorm) ||
        filtNorm.includes(regNorm);
      if (!sameStore) return false;
    }
    if (statusFilter !== "all") {
      if (statusFilter === "waiting" && registration.status !== "aguardando") {
        return false;
      }
      if (statusFilter === "triggered" && registration.status !== "concluido") {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pessoas</h1>
        <p className="text-muted-foreground">
          Gerencie alertas vinculados e acompanhe promocoes por pessoa
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={storeFilter}
          onValueChange={(v) => setStoreFilter(v as Store | "all")}
        >
          <SelectTrigger className="w-[180px] bg-secondary">
            <SelectValue placeholder="Filtrar loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as lojas</SelectItem>
            {storeOptions.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as "all" | "waiting" | "triggered")
          }
        >
          <SelectTrigger className="w-[180px] bg-secondary">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="waiting">aguardando</SelectItem>
            <SelectItem value="triggered">concluido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Alertas vinculados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </>
          ) : filteredRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {alertRegistrations.length === 0
                ? "Nenhum alerta cadastrado para pessoas."
                : "Nenhum registro corresponde aos filtros selecionados."}
            </p>
          ) : (
            filteredRegistrations.map((registration) => {
              const normalizedRegistrationStore = normalize(registration.store);
              const matchedAlert = alerts
                .filter((alert) => {
                  const normalizedAlertStore = normalize(alert.store);
                  const sameStore =
                    normalizedAlertStore === normalizedRegistrationStore ||
                    normalizedAlertStore.includes(normalizedRegistrationStore) ||
                    normalizedRegistrationStore.includes(normalizedAlertStore);
                  if (!sameStore) return false;
                  if (registration.rule === ">=") {
                    return alert.currentPoints >= registration.targetPoints;
                  }
                  return alert.currentPoints <= registration.targetPoints;
                })
                .sort(
                  (a, b) =>
                    new Date(b.triggeredAt).getTime() -
                    new Date(a.triggeredAt).getTime(),
                )[0];

              return (
                <div
                  key={registration.id}
                  role={matchedAlert ? "button" : undefined}
                  tabIndex={matchedAlert ? 0 : -1}
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
                  onKeyDown={(event) => {
                    if (!matchedAlert) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMatch({
                        personName: registration.personName,
                        store: registration.store,
                        targetPoints: registration.targetPoints,
                        currentPoints: matchedAlert.currentPoints,
                        previousPoints: matchedAlert.previousPoints,
                        triggeredAt: matchedAlert.triggeredAt,
                      });
                    }
                  }}
                  className={cn(
                    "rounded-md border border-border p-3",
                    matchedAlert ? "cursor-pointer hover:bg-card/70" : "",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{registration.personName}</p>
                      <p className="text-sm text-muted-foreground">
                        {registration.store} | Regra {registration.rule}{" "}
                        {registration.targetPoints} pts/R$1
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          registration.status === "concluido"
                            ? "border-success/50 text-success"
                            : "border-warning/50 text-warning",
                        )}
                      >
                        {registration.status}
                      </Badge>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateAlertRegistrationStatus(
                            registration.id,
                            registration.status === "concluido"
                              ? "aguardando"
                              : "concluido",
                          );
                        }}
                      >
                        {registration.status === "concluido"
                          ? "Voltar para aguardando"
                          : "Marcar concluido"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedMatch)}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
      >
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
              <p>
                Detectado em:{" "}
                {new Date(selectedMatch.triggeredAt).toLocaleString("pt-BR")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
