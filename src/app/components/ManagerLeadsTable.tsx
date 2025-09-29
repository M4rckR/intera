'use client'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ActionsBar } from '@/app/components/ActionsBar';
import { ScheduleModal } from '@/app/components/ScheduleModal';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { useLeadsStore } from '@/store/leads';
import { RejectModal } from '@/app/components/modals/RejectModal';
import { fakeReject } from '@/services/mockScheduler';
import { fakeSchedule } from '@/services/mockScheduler';
import { EditPhoneModal } from '@/app/components/modals/EditPhoneModal';
import { useCountdown } from '@/hooks/useCountdown';

import { LeadsTableProps, LeadTable } from '@/types/components';

const COLOR_TURQUESA = '#00CFC3';
const COLOR_AZUL_OSCURO = '#00405A';

function formatDateTime(value?: string | null) {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  const iso = d.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

function getConversationBadge(state?: string) {
  const key = (state || 'NUEVO').toUpperCase();
  switch (key) {
    case 'NUEVO':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'NO CONTACTADO':
    case 'NO_CONTACTADO':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CONTACTADO':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'AGENDADO':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'ATENDIDO':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// Componente para la celda de cuenta regresiva
function CountdownCell({ createdAt }: { createdAt?: string | null }) {
  const countdown = useCountdown(createdAt);
  
  if (countdown.timeString === 'N/A') {
    return <span className="text-sm font-mono text-gray-500">N/A</span>;
  }

  return (
    <span className={cn('text-sm font-mono', {
      'text-red-600': countdown.isExpired,
      'text-gray-700': !countdown.isExpired
    })}>
      {countdown.timeString}
    </span>
  );
}

function isContinuador(lead: LeadTable): boolean {
  const type = (lead?.clientType || '').toString().toLowerCase();
  if (type === 'continuador') return true;
  if (lead?.isContinuador === true) return true;
  return false;
}

export function ManagerLeadsTable({ leads }: LeadsTableProps) {
  // Placeholder: asumimos que el socket ya filtra por room y trae campos compatibles
  // Campos esperados (si faltan, se muestran como N/A):
  // createdAtLead, sede, lastAppointmentAt, scheduledAppointmentAt, conversationState

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadTable | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Datos fake para muestra con fechas actuales
  const fakeLeads = useMemo(() => [
    {
      id: '1',
      name: 'MARÍA GONZÁLEZ RODRÍGUEZ',
      clientPhone: '987654321',
      document: '12345678',
      sede: 'Sede Central - Lima',
      createdAtLead: '2025-09-27T09:00:00.000Z', // Fecha fija: hace 1 hora (71h restantes)
      lastAppointmentAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
      scheduledAppointmentAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // En 3 días
      conversationState: 'AGENDADO'
    },
    {
      id: '2',
      name: 'CARLOS MÉNDEZ SILVA',
      clientPhone: '987654322',
      document: '23456789',
      sede: 'Sede Norte - San Martín',
      createdAtLead: '2025-10-28T10:00:00.000Z', // Fecha fija: hace 1 día (48h restantes)
      lastAppointmentAt: new Date().toISOString(), // Hoy
      scheduledAppointmentAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // En 2 días
      conversationState: 'CONTACTADO',
      clientType: 'CONTINUADOR'
    },
    {
      id: '3',
      name: 'ANA LÓPEZ TORRES',
      clientPhone: '987654323',
      document: '34567890',
      sede: 'Sede Sur - Villa El Salvador',
      createdAtLead: '2025-10-29T10:00:00.000Z', // Fecha fija: hace 2 días (24h restantes)
      lastAppointmentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
      scheduledAppointmentAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
      conversationState: 'NUEVO'
    },
    {
      id: '4',
      name: 'JOSÉ RAMÍREZ VARGAS',
      clientPhone: '987654324',
      document: '45678901',
      sede: 'Sede Este - Ate Vitarte',
      createdAtLead: '2025-10-30T08:43:00.000Z', // Fecha fija: hace 72h 17min (EXPIRADO)
      lastAppointmentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
      scheduledAppointmentAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // En 4 días
      conversationState: 'NO_CONTACTADO',
      isContinuador: true
    },
    {
      id: '5',
      name: 'ROSA FERNÁNDEZ CASTRO',
      clientPhone: '987654325',
      document: '56789012',
      sede: 'Sede Oeste - Callao',
      createdAtLead: '2025-10-31T10:00:00.000Z', // Fecha fija: hace 4 días (EXPIRADO hace 24h)
      lastAppointmentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
      scheduledAppointmentAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // En 5 días
      conversationState: 'ATENDIDO'
    }
  ], []);

  // Usar store como fuente de verdad; si está vacío, precargar con fake una sola vez
  const storeLeads = useLeadsStore((s) => s.leads);
  const setLeads = useLeadsStore((s) => s.setLeads);
  useEffect(() => {
    if (storeLeads.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLeads(fakeLeads as unknown as any[]);
    }
  }, [setLeads, storeLeads.length, fakeLeads]);
  const displayLeads = (storeLeads.length > 0 ? (storeLeads as LeadTable[]) : (leads.length > 0 ? (leads as LeadTable[]) : fakeLeads as unknown as LeadTable[]));
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSchedule = (leadId: string) => {
    const lead = displayLeads.find(l => l.id === leadId);
    setSelectedLead(lead as LeadTable);
    setScheduleModalOpen(true);
  };

  const handleReject = (leadId: string) => {
    const lead = displayLeads.find(l => l.id === leadId);
    setSelectedLead(lead as LeadTable);
    setRejectOpen(true);
  };

  return (
    <Tooltip.Provider>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: COLOR_AZUL_OSCURO }}>Leads del gestor</h2>
            <Badge variant="secondary" style={{ backgroundColor: COLOR_TURQUESA, color: 'white', borderColor: COLOR_TURQUESA }}>
              {displayLeads.length} lead{displayLeads.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {displayLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="sr-only">Lista de leads del gestor</TableCaption>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold text-sm text-center" style={{ color: COLOR_AZUL_OSCURO }}>Paciente</TableHead>
                    <TableHead className="font-semibold text-sm text-center" style={{ color: COLOR_AZUL_OSCURO }}>Fecha de Lead</TableHead>
                    <TableHead className="font-semibold text-sm text-center" style={{ color: COLOR_AZUL_OSCURO }}>Sede</TableHead>
                    <TableHead className="font-semibold text-sm text-center leading-tight whitespace-normal min-w-[130px]" style={{ color: COLOR_AZUL_OSCURO }}>
                      <span className="block">Fecha de Registro</span>
                      <span className="block">de Agenda</span>
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-center leading-tight whitespace-normal min-w-[130px]" style={{ color: COLOR_AZUL_OSCURO }}>
                      <span className="block">Fecha de Cita</span>
                      <span className="block">Prevista</span>
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-center leading-tight whitespace-normal min-w-[120px]" style={{ color: COLOR_AZUL_OSCURO }}>
                      <span className="block">Cuenta regresiva</span>
                      <span className="block">(72h)</span>
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-center" style={{ color: COLOR_AZUL_OSCURO }}>Acción</TableHead>
                    <TableHead className="font-semibold text-sm text-center" style={{ color: COLOR_AZUL_OSCURO }}>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayLeads.map((lead) => (
                    <TableRow key={lead.id} className="border-gray-100 hover:bg-blue-50/30 transition-colors">
                      {/* Paciente */}
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>{lead.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {isContinuador(lead) && (
                          <Tooltip.Root delayDuration={200}>
                            <Tooltip.Trigger asChild>
                              <span aria-label="Continuador" title="Continuador" className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-yellow-500 fill-current">
                                  <path d="M12 2l2.9 5.88L21 9.75l-4.5 4.39L17.8 21 12 17.77 6.2 21l1.3-6.86L3 9.75l6.1-.87L12 2z" />
                                </svg>
                              </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                              Cliente continuador
                            </Tooltip.Content>
                          </Tooltip.Root>
                        )}
                        <span>Teléfono: {lead.clientPhone}</span>
                            <button className="text-blue-600 underline" onClick={() => { setSelectedLead(lead as LeadTable); setEditPhoneOpen(true); }}>Editar</button>
                          </div>
                        </div>
                      </TableCell>

                      {/* Fecha de Lead */}
                      <TableCell className="py-4 text-center">
                        <Tooltip.Root delayDuration={200}>
                          <Tooltip.Trigger asChild>
                            <span className="text-sm text-gray-700 cursor-help">{formatDateTime((lead as LeadTable & { createdAtLead?: string }).createdAtLead)}</span>
                          </Tooltip.Trigger>
                          <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                            {(lead as LeadTable & { createdAtLead?: string }).createdAtLead || 'N/A'}
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </TableCell>

                      {/* Sede */}
                      <TableCell className="py-4 text-center">
                        <span className="text-sm text-gray-700">{lead.sede || 'N/A'}</span>
                      </TableCell>

                      {/* Fecha registro de agenda */}
                      <TableCell className="py-4 text-center">
                        <Tooltip.Root delayDuration={200}>
                          <Tooltip.Trigger asChild>
                            <span className="text-sm text-gray-700 cursor-help">{formatDateTime((lead as LeadTable & { lastAppointmentAt?: string }).lastAppointmentAt)}</span>
                          </Tooltip.Trigger>
                          <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                            {(lead as LeadTable & { lastAppointmentAt?: string }).lastAppointmentAt || 'N/A'}
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </TableCell>

                      {/* Fecha de Cita Prevista */}
                      <TableCell className="py-4 text-center">
                        <Tooltip.Root delayDuration={200}>
                          <Tooltip.Trigger asChild>
                            <span className="text-sm text-gray-700 cursor-help">{formatDateTime((lead as LeadTable & { scheduledAppointmentAt?: string }).scheduledAppointmentAt)}</span>
                          </Tooltip.Trigger>
                          <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                            {(lead as LeadTable & { scheduledAppointmentAt?: string }).scheduledAppointmentAt || 'N/A'}
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </TableCell>

                      {/* Cuenta regresiva 72h */}
                      <TableCell className="py-4 text-center">
                        <CountdownCell createdAt={(lead as LeadTable & { createdAtLead?: string }).createdAtLead} />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="py-4">
                        <ActionsBar 
                          onSchedule={() => handleSchedule(lead.id)} 
                          onReject={() => handleReject(lead.id)} 
                        />
                      </TableCell>

                      {/* Estado conversación */}
                      <TableCell className="py-4 text-center">
                        <Badge className={cn('text-xs px-2 py-0.5 border', getConversationBadge((lead as LeadTable & { conversationState?: string }).conversationState))}>
                          {((lead as LeadTable & { conversationState?: string }).conversationState || 'NUEVO').toString().toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="shadow-sm border">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Leads del gestor</h2>
                <div className="py-8 text-gray-500">No hay leads para mostrar</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Agendar/Reprogramar */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        leadId={selectedLead?.id || ''}
        patientName={selectedLead?.name || ''}
        patientDocument={selectedLead?.document || ''}
        patientPhone={selectedLead?.clientPhone || ''}
        onConfirm={async (payload) => {
          if (!selectedLead) return;
          await fakeSchedule(selectedLead.id, payload);
        }}
      />

      {/* Modal de Rechazo */}
      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lead={selectedLead as any}
        onConfirm={async (payload) => {
          if (!selectedLead) return;
          await fakeReject(selectedLead.id, payload);
          setRejectOpen(false);
        }}
      />

      <EditPhoneModal open={editPhoneOpen} onClose={() => setEditPhoneOpen(false)} 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lead={selectedLead as any} />
    </Tooltip.Provider>
  );
}


