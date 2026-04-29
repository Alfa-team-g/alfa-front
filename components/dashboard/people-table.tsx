'use client'

import { useDashboard } from '@/lib/dashboard-context'
import { storeConfig, type Person, type Store } from '@/lib/store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stores } from '@/lib/store'

interface PeopleTableProps {
  onEdit?: (person: Person) => void
  compact?: boolean
}

export function PeopleTable({ onEdit, compact = false }: PeopleTableProps) {
  const {
    people,
    deletePerson,
    storeFilter,
    setStoreFilter,
    statusFilter,
    setStatusFilter,
  } = useDashboard()

  const filteredPeople = people.filter((person) => {
    if (storeFilter !== 'all' && person.store !== storeFilter) return false
    if (statusFilter !== 'all' && person.status !== statusFilter) return false
    return true
  })

  // Sort by highest desired points first
  const sortedPeople = [...filteredPeople].sort(
    (a, b) => b.desiredPoints - a.desiredPoints
  )

  const displayPeople = compact ? sortedPeople.slice(0, 5) : sortedPeople

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-wrap gap-3">
          <Select
            value={storeFilter}
            onValueChange={(v) => setStoreFilter(v as Store | 'all')}
          >
            <SelectTrigger className="w-[150px] bg-secondary">
              <SelectValue placeholder="Filter by store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store} value={store}>
                  {store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as 'all' | 'waiting' | 'triggered')
            }
          >
            <SelectTrigger className="w-[150px] bg-secondary">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="triggered">Triggered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Store</TableHead>
              <TableHead className="text-muted-foreground">
                Desired Points
              </TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              {!compact && (
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayPeople.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={compact ? 4 : 5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No people found.
                </TableCell>
              </TableRow>
            ) : (
              displayPeople.map((person) => (
                <TableRow key={person.id} className="border-border">
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-transparent',
                        storeConfig[person.store].bgColor,
                        storeConfig[person.store].color
                      )}
                    >
                      {person.store}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {person.desiredPoints} pts/R$1
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'gap-1.5 border-transparent',
                        person.status === 'triggered'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          person.status === 'triggered'
                            ? 'bg-success'
                            : 'bg-warning'
                        )}
                      />
                      {person.status === 'triggered' ? 'Triggered' : 'Waiting'}
                    </Badge>
                  </TableCell>
                  {!compact && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(person)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deletePerson(person.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
