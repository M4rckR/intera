export type ConversationState =
  | 'NUEVO'
  | 'NO_CONTACTADO'
  | 'CONTACTADO'
  | 'AGENDADO'
  | 'ATENDIDO'
  | 'RECHAZADO'
  | 'NO_INTERESADO';

export type Lead = {
  id: string;
  name: string;
  document?: string | null;
  clientPhone: string;
  sede?: string | null;
  createdAtLead?: string | null; // ISO string
  lastAppointmentAt?: string | null; // ISO string
  scheduledAppointmentAt?: string | null; // ISO string
  conversationState?: ConversationState;
};

export type SchedulePayload = {
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  sede: string;
  especialidad: string;
  tipo: string;
  servicio: string;
  monto: string;
  pauta?: string;
  canal: string;
  tipoPx: string;
  tipificacionVenta?: string;
};

export type RejectPayload = {
  interest: 'INTERESADO' | 'NO_INTERESADO';
  category: string; // e.g., NO_AGENDO, RECHAZA_NO_DESEA, NO_EFECTIVO_NO_CALIFICA
  reasonPath: string[]; // breadcrumb path
  reasonId: string; // stable slug
};

export type PhoneUpdatePayload = {
  leadId: string;
  newPhone: string;
};

export type RejectTreeNode = string | { [label: string]: RejectTreeNode[] };


