import type { SchedulePayload, RejectPayload } from '@/types/leads';
import { useLeadsStore } from '@/store/leads';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fakeSchedule(leadId: string, payload: SchedulePayload) {
  await delay(400);
  useLeadsStore.getState().markScheduled(leadId, payload);
  return { ok: true } as const;
}

export async function fakeReject(leadId: string, payload: RejectPayload) {
  await delay(300);
  useLeadsStore.getState().markRejected(leadId, payload);
  return { ok: true } as const;
}

export async function fakeUpdatePhone(leadId: string, newPhone: string) {
  await delay(200);
  useLeadsStore.getState().updatePhone(leadId, newPhone);
  return { ok: true } as const;
}