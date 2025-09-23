import type { RejectTreeNode } from '@/types/leads';

export type InterestKey = 'INTERESADO' | 'NO_INTERESADO';

export const REJECT_REASONS: Record<InterestKey, Record<string, RejectTreeNode[]>> = {
  INTERESADO: {
    NO_AGENDO: [
      'No le interesa, solo dio click a la pauta',
      'Vive lejos',
      'Decidió atenderse con la competencia',
      'Solo quería información',
      'Precios caros',
      {
        'Desconfía de la clínica': [
          'Opiniones negativas en redes',
          'Desconfianza de médicos',
          'Desconfianza de admisión',
        ],
      },
      'Médico tratante no disponible',
      'Horarios no compatibles',
      'No acepta método de pago',
    ],
    NO_EFECTIVO_NO_CALIFICA: [
      'Cliente de provincia (fuera de zona de atención)',
      'Registro duplicado',
      'Post venta',
      'Cerrado por falta de respuesta',
      'No contesta llamadas / WhatsApp',
      'Sin número / Grabadora',
      'Error en la información brindada',
      'Mala experiencia previa',
      'Problemas personales (salud, familia)',
      'Se atendió por seguro / sistema público',
      'PX me pasea en tiempos',
    ],
  },
  NO_INTERESADO: {
    NO_AGENDO: [
      'No le interesa, solo dio click a la pauta',
      'Vive lejos',
      'Decidió atenderse con la competencia',
      'Solo quería información',
      'Precios caros',
      {
        'Desconfía de la clínica': [
          'Opiniones negativas en redes',
          'Desconfianza de médicos',
          'Desconfianza de admisión',
        ],
      },
      'Médico tratante no disponible',
      'Horarios no compatibles',
      'No acepta método de pago',
    ],
    NO_EFECTIVO_NO_CALIFICA: [
      'Cliente de provincia (fuera de zona de atención)',
      'Registro duplicado',
      'Post venta',
      'Cerrado por falta de respuesta',
      'No contesta llamadas / WhatsApp',
      'Sin número / Grabadora',
      'Error en la información brindada',
      'Mala experiencia previa',
      'Problemas personales (salud, familia)',
      'Se atendió por seguro / sistema público',
      'PX me pasea en tiempos',
    ],
  },
};

// helper para slug estable
export function toSlug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


