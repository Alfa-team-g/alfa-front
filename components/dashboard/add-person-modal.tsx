'use client'

import { useState, useEffect } from 'react'
import { useDashboard } from '@/lib/dashboard-context'
import { stores, type Person, type Store } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

interface AddPersonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editPerson?: Person | null
}

export function AddPersonModal({
  open,
  onOpenChange,
  editPerson,
}: AddPersonModalProps) {
  const { addPerson, updatePerson } = useDashboard()
  const [name, setName] = useState('')
  const [store, setStore] = useState<Store>('Nike')
  const [desiredPoints, setDesiredPoints] = useState(5)

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name)
      setStore(editPerson.store)
      setDesiredPoints(editPerson.desiredPoints)
    } else {
      setName('')
      setStore('Nike')
      setDesiredPoints(5)
    }
  }, [editPerson, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editPerson) {
      await updatePerson(editPerson.id, { name, store, desiredPoints })
    } else {
      await addPerson({ name, store, desiredPoints })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editPerson ? 'Editar pessoa' : 'Adicionar nova pessoa'}
          </DialogTitle>
          <DialogDescription>
            {editPerson
              ? 'Atualize a pessoa que esta aguardando uma promocao.'
              : 'Adicione alguem para aguardar uma promocao especifica.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome"
                required
                className="bg-secondary"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="store">Loja</FieldLabel>
              <Select value={store} onValueChange={(v) => setStore(v as Store)}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="points">Pontos minimos desejados</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="points"
                  type="number"
                  min={1}
                  max={20}
                  value={desiredPoints}
                  onChange={(e) => setDesiredPoints(Number(e.target.value))}
                  className="bg-secondary"
                />
                <span className="text-sm text-muted-foreground">pts/R$1</span>
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{editPerson ? 'Salvar' : 'Adicionar pessoa'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
