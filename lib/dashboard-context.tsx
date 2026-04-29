'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  type Person,
  type Alert,
  type SchedulerState,
  type AlertRegistration,
  type Store,
  stores,
} from './store'

interface DashboardContextType {
  // People
  people: Person[]
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'status' | 'active'>) => Promise<void>
  updatePerson: (id: string, updates: Partial<Person>) => Promise<void>
  deletePerson: (id: string) => Promise<void>

  // Alerts
  alerts: Alert[]
  alertRegistrations: AlertRegistration[]
  addAlertRegistration: (payload: {
    personId: string
    personName: string
    store: Store
    rule: '>=' | '<='
    targetPoints: number
  }) => Promise<void>
  updateAlertRegistrationStatus: (
    id: string,
    status: AlertRegistration['status']
  ) => Promise<void>

  // Scheduler
  scheduler: SchedulerState
  runScan: () => Promise<void>
  toggleScheduler: () => Promise<void>
  setFrequency: (frequency: SchedulerState['frequency']) => Promise<void>

  // Stats
  stats: {
    totalStores: number
    activeAlerts: number
    waitingUsers: number
    lastScanTime: Date | null
  }

  // Filters
  storeFilter: Store | 'all'
  setStoreFilter: (store: Store | 'all') => void
  statusFilter: 'all' | 'waiting' | 'triggered'
  setStatusFilter: (status: 'all' | 'waiting' | 'triggered') => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)
const PEOPLE_CACHE_KEY = 'dashboard_people_cache'

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertRegistrations, setAlertRegistrations] = useState<AlertRegistration[]>([])
  const [scheduler, setScheduler] = useState<SchedulerState>({
    isRunning: false,
    isEnabled: true,
    frequency: '30min',
    lastScanTime: null,
  })
  const [storeFilter, setStoreFilter] = useState<Store | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'triggered'>('all')

  const loadData = useCallback(async () => {
    const cachedPeopleRaw = typeof window !== 'undefined' ? localStorage.getItem(PEOPLE_CACHE_KEY) : null
    if (cachedPeopleRaw) {
      try {
        const cachedPeople = JSON.parse(cachedPeopleRaw) as Person[]
        if (Array.isArray(cachedPeople) && cachedPeople.length > 0) {
          setPeople(cachedPeople)
        }
      } catch {
        // ignore invalid cache payload
      }
    }

    const [peopleRes, alertsRes, schedulerRes, registrationsRes] = await Promise.all([
      fetch('/api/people', { cache: 'no-store' }),
      fetch('/api/alerts', { cache: 'no-store' }),
      fetch('/api/scheduler', { cache: 'no-store' }),
      fetch('/api/alerts?type=registrations', { cache: 'no-store' }),
    ])

    const peopleData = (await peopleRes.json()) as { people: Person[] }
    const alertsData = (await alertsRes.json()) as { alerts: Alert[] }
    const schedulerData = (await schedulerRes.json()) as { scheduler: SchedulerState }
    const registrationsData = (await registrationsRes.json()) as {
      registrations: AlertRegistration[]
    }

    setPeople(peopleData.people ?? [])
    if (typeof window !== 'undefined') {
      localStorage.setItem(PEOPLE_CACHE_KEY, JSON.stringify(peopleData.people ?? []))
    }
    setAlerts(alertsData.alerts ?? [])
    setScheduler(schedulerData.scheduler)
    setAlertRegistrations(registrationsData.registrations ?? [])
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const addPerson = useCallback(async (person: Omit<Person, 'id' | 'createdAt' | 'status' | 'active'>) => {
    await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    })
    await loadData()
  }, [loadData])

  const updatePerson = useCallback(async (id: string, updates: Partial<Person>) => {
    await fetch('/api/people', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    await loadData()
  }, [loadData])

  const deletePerson = useCallback(async (id: string) => {
    await fetch(`/api/people?id=${id}`, { method: 'DELETE' })
    await loadData()
  }, [loadData])

  const addAlertRegistration = useCallback(async (payload: {
    personId: string
    personName: string
    store: Store
    rule: '>=' | '<='
    targetPoints: number
  }) => {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'registration',
        ...payload,
      }),
    })
    await loadData()
  }, [loadData])

  const updateAlertRegistrationStatus = useCallback(async (
    id: string,
    status: AlertRegistration['status']
  ) => {
    await fetch('/api/alerts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await loadData()
  }, [loadData])

  const runScan = useCallback(async () => {
    setScheduler((prev) => ({ ...prev, isRunning: true }))
    try {
      const response = await fetch('/api/scans/trigger', { method: 'POST' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? 'Falha ao executar scan manual')
      }
    } catch (error) {
      console.error('[scheduler] runScan failed:', error)
    } finally {
      try {
        await loadData()
      } catch {
        setScheduler((prev) => ({ ...prev, isRunning: false }))
      }
    }
  }, [loadData])

  const toggleScheduler = useCallback(async () => {
    const nextEnabled = !scheduler.isEnabled
    await fetch('/api/scheduler', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: nextEnabled }),
    })
    await loadData()
  }, [scheduler.isEnabled, loadData])

  const setFrequency = useCallback(async (frequency: SchedulerState['frequency']) => {
    await fetch('/api/scheduler', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frequency }),
    })
    await loadData()
  }, [loadData])

  const stats = {
    totalStores: stores.length,
    activeAlerts: alerts.length,
    waitingUsers: alertRegistrations.filter(
      (registration) => registration.status === 'aguardando' && registration.active
    ).length,
    lastScanTime: scheduler.lastScanTime ? new Date(scheduler.lastScanTime) : null,
  }

  return (
    <DashboardContext.Provider
      value={{
        people,
        addPerson,
        updatePerson,
        deletePerson,
        alerts,
        alertRegistrations,
        addAlertRegistration,
        updateAlertRegistrationStatus,
        scheduler,
        runScan,
        toggleScheduler,
        setFrequency,
        stats,
        storeFilter,
        setStoreFilter,
        statusFilter,
        setStatusFilter,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
