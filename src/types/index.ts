export interface DataConnection {
  isReady: boolean;
  qrCodeUrl: string | null;
}

export interface PatientInfo {
  name: string;
  department: string;
}

export interface AppointmentInfo {
  location: string;
  date: string;
  time: string;
}

export interface ConversationState {
  patientInfo?: PatientInfo;
  appointmentInfo?: AppointmentInfo;
}

export interface BotState {
  is_bot_active: boolean;
}

export interface Lead {
  id: string;
  phone: string;
  conversationState?: ConversationState;
  botState?: BotState;
  created_at: string;
  updated_at: string;
}

export interface LeadFromBackend {
  id: string;
  phone: string;
  name: string;
  sede: string;
  department: string;
  fecha_cita: string;
  hora_cita: string;
  is_bot_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  totalLeads: number;
  activeBots: number;
  pendingAppointments: number;
  completedAppointments: number;
}