import type { Alert, AlertRegistration, Person, SchedulerState } from "@/lib/store";

export function toIsoString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

export function mapPerson(id: string, data: Record<string, unknown>): Person {
  return {
    id,
    name: String(data.name ?? ""),
    store: String(data.store ?? ""),
    desiredPoints: Number(data.desiredPoints ?? 0),
    status: (data.status as Person["status"]) ?? "waiting",
    active: Boolean(data.active ?? true),
    createdAt: toIsoString(data.createdAt),
  };
}

export function mapAlert(id: string, data: Record<string, unknown>): Alert {
  return {
    id,
    store: String(data.store ?? ""),
    currentPoints: Number(data.currentPoints ?? 0),
    previousPoints: Number(data.previousPoints ?? 0),
    triggeredAt: toIsoString(data.triggeredAt),
    promo: Boolean(data.promo ?? false),
    details: Array.isArray(data.details) ? data.details.map((value) => String(value)) : [],
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined,
    partnerRulesUrl: typeof data.partnerRulesUrl === "string" ? data.partnerRulesUrl : undefined,
    notifiedPeople: Array.isArray(data.notifiedPeople)
      ? data.notifiedPeople.map((name) => String(name))
      : [],
  };
}

export function mapAlertRegistration(
  id: string,
  data: Record<string, unknown>,
): AlertRegistration {
  return {
    id,
    personId: String(data.personId ?? ""),
    personName: String(data.personName ?? ""),
    store: String(data.store ?? ""),
    rule: (data.rule as AlertRegistration["rule"]) ?? ">=",
    targetPoints: Number(data.targetPoints ?? 0),
    status: (data.status as AlertRegistration["status"]) ?? "aguardando",
    active: Boolean(data.active ?? true),
    createdAt: toIsoString(data.createdAt),
  };
}

export function mapScheduler(data: Record<string, unknown>): SchedulerState {
  return {
    isRunning: Boolean(data.isRunning ?? false),
    isEnabled: Boolean(data.isEnabled ?? true),
    frequency: (data.frequency as SchedulerState["frequency"]) ?? "30min",
    lastScanTime: data.lastScanTime ? String(data.lastScanTime) : null,
  };
}
