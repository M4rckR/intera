

export type PatientInfo = {
  name: string;
  department: string;
}

export type AppointmentInfo = {
  location: string;
  date: string;
  time: string;
}

export type ConversationState = {
  patientInfo?: PatientInfo;
  appointmentInfo?: AppointmentInfo;
}

export type BotState = {
  isBotActive: boolean;
}

export type Lead = {
  id: string;
  phone: string;
  conversationState?: ConversationState;
  botState?: BotState;
  createdAt: string;
  updatedAt: string;
}

export type LeadFromBackend = {
  id: string;
  phone: string;  
  name: string;
  sede: string;
  department: string;
  fechaCita: string;
  horaCita: string;
  isBotActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Stats = {
  totalLeads: number;
  activeBots: number;
  pendingAppointments: number;
  completedAppointments: number;
}