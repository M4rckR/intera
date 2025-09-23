import { create } from 'zustand';
import type { Lead, SchedulePayload, RejectPayload } from '@/types/leads';

type LeadsState = {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  markScheduled: (leadId: string, payload: SchedulePayload) => void;
  markRejected: (leadId: string, payload: RejectPayload) => void;
  updatePhone: (leadId: string, newPhone: string) => void;
};

export const useLeadsStore = create<LeadsState>((set) => ({
  leads: [],
  setLeads: (leads) => set({ leads }),
  markScheduled: (leadId, payload) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              conversationState: 'AGENDADO',
              scheduledAppointmentAt: `${payload.startDate}T${payload.startTime}:00.000Z`,
              lastAppointmentAt: new Date().toISOString(),
            }
          : l
      ),
    })),
  markRejected: (leadId, _payload) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              conversationState: 'RECHAZADO',
            }
          : l
      ),
    })),
  updatePhone: (leadId, newPhone) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === leadId ? { ...l, clientPhone: newPhone } : l)),
    })),
}));


