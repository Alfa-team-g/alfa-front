// Types
export type Store = string

export type PersonStatus = 'waiting' | 'triggered'

export interface Person {
  id: string
  name: string
  store: Store
  desiredPoints: number
  status: PersonStatus
  active: boolean
  createdAt: string
}

export interface Alert {
  id: string
  store: Store
  currentPoints: number
  previousPoints: number
  triggeredAt: string
  promo?: boolean
  details?: string[]
  imageUrl?: string
  partnerRulesUrl?: string
  notifiedPeople: string[]
}

export interface AlertRegistration {
  id: string
  personId: string
  personName: string
  store: Store
  rule: '>=' | '<='
  targetPoints: number
  status: 'aguardando' | 'concluido'
  active: boolean
  createdAt: string
}

export interface SchedulerState {
  isRunning: boolean
  isEnabled: boolean
  frequency: '15min' | '30min' | '1hour'
  lastScanTime: string | null
}

// Store logos/colors for visual identity
export const storeConfig: Record<Store, { color: string; bgColor: string }> = {
  Nike: { color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  Centauro: { color: 'text-green-400', bgColor: 'bg-green-500/10' },
  Netshoes: { color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  Adidas: { color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  Puma: { color: 'text-red-400', bgColor: 'bg-red-500/10' },
  Renner: { color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
}

export const stores: Store[] = ['Nike', 'Centauro', 'Netshoes', 'Adidas', 'Puma', 'Renner']
