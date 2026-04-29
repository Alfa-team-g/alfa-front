'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Bell,
  PlusCircle,
  X,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  { name: 'Painel', href: '/', icon: LayoutDashboard },
  { name: 'Pessoas', href: '/people', icon: Users },
  { name: 'Alertas', href: '/alerts', icon: Bell },
  { name: 'Novo alerta', href: '/alerts/new', icon: PlusCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-sidebar transition-transform duration-200 ease-in-out lg:relative lg:inset-auto lg:z-auto lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image
                src="/alfa-logo.png"
                alt="Alfa Team"
                fill
                className="object-cover"
                sizes="32px"
                priority
              />
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Alfa Team
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Monitor de promocoes Livelo
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
