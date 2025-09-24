'use client'
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';
import type { Lead } from '@/types/leads';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { fakeUpdatePhone } from '@/services/mockScheduler';

type Props = {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
};

const COLOR_TURQUESA = '#00CFC3';

export function EditPhoneModal({ open, onClose, lead }: Props) {
  const [phone, setPhone] = useState(lead?.clientPhone || '');
  const isValid = /^\d{9}$/.test(phone);

  async function save() {
    if (!lead || !isValid) return;
    await fakeUpdatePhone(lead.id, phone);
    onClose();
  }

  // Sincronizar el input al abrir o cuando cambie el lead seleccionado
  useEffect(() => {
    if (open) {
      setPhone(lead?.clientPhone || '');
    }
  }, [open, lead?.id]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-[90vw] max-w-md p-4">
          <VisuallyHidden.Root>
            <Dialog.Title>Editar teléfono</Dialog.Title>
            <Dialog.Description>Actualiza el número de teléfono del lead seleccionado</Dialog.Description>
          </VisuallyHidden.Root>
          <div className="space-y-3">
            <Label htmlFor="newPhone">Nuevo teléfono (9 dígitos)</Label>
            <Input id="newPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="987654321" />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={save} disabled={!isValid} style={{ backgroundColor: isValid ? COLOR_TURQUESA : '#94a3b8', color: 'white' }}>Guardar</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


