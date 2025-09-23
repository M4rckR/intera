import { create } from 'zustand';
import type { Lead, SchedulePayload, RejectPayload } from '@/types/leads';

type ModalState<T = unknown> = {
  open: boolean;
  lead: Lead | null;
  data?: T;
};

type UIState = {
  scheduleModal: ModalState<SchedulePayload>;
  rejectModal: ModalState<RejectPayload>;
  editPhoneModal: ModalState<{ newPhone?: string }>;
  openSchedule: (lead: Lead) => void;
  closeSchedule: () => void;
  openReject: (lead: Lead) => void;
  closeReject: () => void;
  openEditPhone: (lead: Lead) => void;
  closeEditPhone: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  scheduleModal: { open: false, lead: null },
  rejectModal: { open: false, lead: null },
  editPhoneModal: { open: false, lead: null },
  openSchedule: (lead) => set({ scheduleModal: { open: true, lead } }),
  closeSchedule: () => set({ scheduleModal: { open: false, lead: null } }),
  openReject: (lead) => set({ rejectModal: { open: true, lead } }),
  closeReject: () => set({ rejectModal: { open: false, lead: null } }),
  openEditPhone: (lead) => set({ editPhoneModal: { open: true, lead } }),
  closeEditPhone: () => set({ editPhoneModal: { open: false, lead: null } }),
}));


