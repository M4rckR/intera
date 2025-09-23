'use client'
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useMemo, useState } from 'react';
import { REJECT_REASONS, toSlug } from '@/data/rejectReasons';
import type { Lead, RejectPayload } from '@/types/leads';
import { Button } from '@/app/components/ui/button';

type Props = {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onConfirm: (payload: RejectPayload) => void;
};

const COLOR_TURQUESA = '#00CFC3';
const COLOR_AZUL_OSCURO = '#00405A';

export function RejectModal({ open, onClose, lead, onConfirm }: Props) {
  const [interest, setInterest] = useState<'INTERESADO' | 'NO_INTERESADO' | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [finalLabel, setFinalLabel] = useState<string | null>(null);

  const categories = useMemo(() => (interest ? Object.keys(REJECT_REASONS[interest]) : []), [interest]);

  const reasonsLevel = useMemo(() => {
    if (!interest || !category) return [] as Array<string | Record<string, string[]>>;
    return REJECT_REASONS[interest][category] ?? [];
  }, [interest, category]);

  function resetFrom(level: number) {
    if (level <= 1) setCategory(null);
    if (level <= 2) {
      setPath([]);
      setFinalLabel(null);
    }
  }

  function handlePickLeaf(label: string) {
    setFinalLabel(label);
  }

  function handlePickNode(label: string) {
    setPath((prev) => [...prev, label]);
    setFinalLabel(null);
  }

  function currentNodes(): Array<string | Record<string, string[]>> {
    // Navega por path dentro de reasonsLevel para obtener el nivel actual
    let nodes: any = reasonsLevel;
    for (const key of path) {
      const obj = nodes.find((n: any) => typeof n === 'object' && Object.keys(n)[0] === key);
      nodes = obj ? obj[key] : [];
    }
    return nodes as Array<string | Record<string, string[]>>;
  }

  function canConfirm(): boolean {
    return Boolean(interest && category && finalLabel);
  }

  function confirm() {
    if (!lead || !interest || !category || !finalLabel) return;
    const reasonId = toSlug(finalLabel);
    const payload: RejectPayload = {
      interest,
      category,
      reasonPath: [...path, finalLabel],
      reasonId,
    };
    onConfirm(payload);
    // reset local state
    setInterest(null);
    setCategory(null);
    setPath([]);
    setFinalLabel(null);
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-[90vw] max-w-3xl p-4">
          <VisuallyHidden.Root>
            <Dialog.Title>Rechazar Lead</Dialog.Title>
          </VisuallyHidden.Root>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>Rechazar Lead</h3>
              <span className="text-sm text-gray-500">{lead?.name}</span>
            </div>

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {interest && (
                <span className="px-2 py-1 bg-gray-100 rounded">{interest}</span>
              )}
              {category && (
                <span className="px-2 py-1 bg-gray-100 rounded">{category}</span>
              )}
              {path.map((p, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded">{p}</span>
              ))}
              {finalLabel && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">{finalLabel}</span>
              )}
            </div>

            {/* Nivel 1: Interés */}
            {!interest && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setInterest('INTERESADO'); resetFrom(1); }} className="px-4 py-6 rounded border hover:bg-gray-50 font-semibold" style={{ borderColor: COLOR_TURQUESA }}>INTERESADO</button>
                <button onClick={() => { setInterest('NO_INTERESADO'); resetFrom(1); }} className="px-4 py-6 rounded border hover:bg-gray-50 font-semibold" style={{ borderColor: COLOR_TURQUESA }}>NO INTERESADO</button>
              </div>
            )}

            {/* Nivel 2: Categoría */}
            {interest && !category && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => { setCategory(cat); resetFrom(2); }} className="px-4 py-3 rounded border hover:bg-gray-50 text-left" style={{ borderColor: COLOR_TURQUESA }}>
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Nivel 3: Motivos y subniveles */}
            {interest && category && (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {currentNodes().map((n, idx) => {
                  if (typeof n === 'string') {
                    const active = finalLabel === n;
                    return (
                      <button key={idx} onClick={() => handlePickLeaf(n)} className={`w-full text-left px-3 py-2 rounded border ${active ? 'bg-emerald-50 border-emerald-300' : 'hover:bg-gray-50'}`} style={{ borderColor: active ? '#6ee7b7' : COLOR_TURQUESA }}>
                        {n}
                      </button>
                    );
                  }
                  const key = Object.keys(n)[0];
                  return (
                    <div key={key} className="border rounded">
                      <button onClick={() => handlePickNode(key)} className="w-full text-left px-3 py-2">
                        {key}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <div className="flex gap-2">
                {(interest || category || path.length > 0) && (
                  <Button variant="outline" onClick={() => {
                    if (finalLabel) { setFinalLabel(null); return; }
                    if (path.length > 0) { setPath((p) => p.slice(0, -1)); return; }
                    if (category) { setCategory(null); return; }
                    setInterest(null);
                  }}>Atrás</Button>
                )}
              </div>
              <Button onClick={confirm} disabled={!canConfirm()} style={{ backgroundColor: canConfirm() ? COLOR_TURQUESA : '#94a3b8', color: 'white' }}>Guardar</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


