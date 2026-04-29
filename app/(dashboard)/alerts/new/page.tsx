"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ALERT_STORE_NAMES_CACHE_KEY = "alert_store_names_cache";

export default function NewAlertPage() {
  const { people, alertRegistrations, addAlertRegistration } = useDashboard();
  const [personName, setPersonName] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [rule, setRule] = useState<">=" | "<=">(">=");
  const [targetPoints, setTargetPoints] = useState(5);
  const [alertStoreNames, setAlertStoreNames] = useState<string[]>([]);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(ALERT_STORE_NAMES_CACHE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAlertStoreNames(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (alertStoreNames.length > 0) return;
    let isMounted = true;
    fetch("/api/alerts", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload: { alerts?: Array<{ store?: string }> }) => {
        if (!isMounted) return;
        const uniqueStores = Array.from(
          new Set(
            (payload.alerts ?? [])
              .map((alert) => String(alert.store ?? "").trim())
              .filter((value) => value.length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b, "pt-BR"));
        setAlertStoreNames(uniqueStores);
        if (typeof window !== "undefined") {
          localStorage.setItem(ALERT_STORE_NAMES_CACHE_KEY, JSON.stringify(uniqueStores));
        }
      })
      .catch(() => {
        // ignore
      });
    return () => {
      isMounted = false;
    };
  }, [alertStoreNames.length]);

  const suggestedPeople = useMemo(
    () =>
      people
        .map((person) => person.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [people],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage("");

    if (!personName.trim() || !selectedStore) {
      setSubmitMessage("Preencha nome e loja para salvar o alerta.");
      return;
    }

    try {
      const typedName = personName.trim();
      const selectedPerson = people.find(
        (person) => person.name.toLowerCase() === typedName.toLowerCase(),
      );
      const fallbackPersonId = `typed-${typedName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;

      await addAlertRegistration({
        personId: selectedPerson?.id ?? fallbackPersonId,
        personName: selectedPerson?.name ?? typedName,
        store: selectedStore,
        rule,
        targetPoints,
      });

      setRule(">=");
      setTargetPoints(selectedPerson?.desiredPoints || 5);
      setPersonName("");
      setSelectedStore("");
      setSubmitMessage("Alerta salvo com sucesso.");
    } catch {
      setSubmitMessage("Nao foi possivel salvar o alerta. Tente novamente.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Novo alerta</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-muted-foreground" htmlFor="person-name">
                Nome da pessoa
              </label>
              <input
                id="person-name"
                list="people-suggestions"
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={personName}
                onChange={(event) => setPersonName(event.target.value)}
                placeholder="Digite o nome"
              />
              <datalist id="people-suggestions">
                {suggestedPeople.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-sm text-muted-foreground" htmlFor="store">
                Loja
              </label>
              <select
                id="store"
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={selectedStore}
                onChange={(event) => setSelectedStore(event.target.value)}
              >
                <option value="">Selecione uma loja</option>
                {alertStoreNames.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="rule">
                  Regra
                </label>
                <select
                  id="rule"
                  className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={rule}
                  onChange={(event) => setRule(event.target.value as ">=" | "<=")}
                >
                  <option value=">=">{">="}</option>
                  <option value="<=">{"<="}</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="target-points">
                  Pontos alvo
                </label>
                <input
                  id="target-points"
                  type="number"
                  min={1}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={targetPoints}
                  onChange={(event) => setTargetPoints(Number(event.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit">Salvar alerta</Button>
              {submitMessage ? <p className="text-sm text-muted-foreground">{submitMessage}</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Alertas cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alertRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum alerta cadastrado ainda.</p>
          ) : (
            alertRegistrations.map((registration) => (
              <div key={registration.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">
                  {registration.personName} - {registration.store}
                </p>
                <p className="text-xs text-muted-foreground">
                  Regra {registration.rule} {registration.targetPoints} pts/R$1
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
