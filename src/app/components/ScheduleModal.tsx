'use client'
import React, { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Search, Trash2, Edit } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

// Paleta de colores del logo
const COLOR_TURQUESA = '#00CFC3';
const COLOR_AZUL_OSCURO = '#00405A';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  patientName?: string;
  patientDocument?: string;
  patientPhone?: string;
  canReschedule?: boolean;
  onConfirm?: (payload: {
    startDate: string;
    startTime: string;
    sede: string;
    especialidad: string;
    tipo: string;
    servicio: string;
    monto: string;
    pauta?: string;
    canal: string;
    tipoPx: string;
    tipificacionVenta?: string;
  }) => Promise<void> | void;
}

interface ServiceItem {
  id: string;
  servicio: string;
  procedimiento: string;
  monto: number;
  turno: string;
  hora: string;
}

export function ScheduleModal({ isOpen, onClose, leadId, patientName = '', patientDocument = '', patientPhone = '', canReschedule = false, onConfirm }: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    // Información del paciente
    documentNumber: patientDocument || '',
    patient: patientName || '',
    phone: patientPhone || '',
    
    // Detalles de la cita
    startDate: '',
    startTime: '',
    sede: '',
    
    // Selección de servicios
    especialidad: '',
    tipo: '',
    servicio: '',
    monto: '',
    
    // Detalles adicionales
    pauta: '',
    canal: '',
    tipoPx: '',
    tipificacionVenta: ''
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Sincronizar datos del lead al abrir/cambiar selección
  React.useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({
      ...prev,
      documentNumber: patientDocument || '',
      patient: patientName || '',
      phone: patientPhone || '',
      // limpiar campos de cita y servicio al abrir para empezar desde 0
      startDate: '',
      startTime: '',
      sede: '',
      especialidad: '',
      tipo: '',
      servicio: '',
      monto: '',
      pauta: '',
      canal: '',
      tipoPx: '',
      tipificacionVenta: ''
    }));
    setServices([]);
  }, [isOpen, leadId, patientDocument, patientName, patientPhone]);

  // Opciones para los dropdowns
  const timeOptions = useMemo(() => [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ], []);

  // Helpers de validación fecha/hora
  function getTodayISODate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const isToday = useCallback((dateStr: string): boolean => {
    if (!dateStr) return false;
    return dateStr === getTodayISODate();
  }, []);

  const filteredTimeOptions = useMemo(() => {
    if (!isToday(formData.startDate)) return timeOptions;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return timeOptions.filter((t) => {
      const [hh, mm] = t.split(':').map(Number);
      const minutes = hh * 60 + mm;
      return minutes >= currentMinutes;
    });
  }, [formData.startDate, isToday, timeOptions]);

  function getShiftForTime(timeHHmm?: string): 'Mañana' | 'Tarde' {
    if (!timeHHmm) {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      return h < 12 || (h === 12 && m === 0) ? 'Mañana' : 'Tarde';
    }
    const [hhStr, mmStr] = timeHHmm.split(':');
    const hh = Number(hhStr);
    const mm = Number(mmStr || '0');
    return hh < 12 || (hh === 12 && mm === 0) ? 'Mañana' : 'Tarde';
  }

  const sedeOptions = [
    'Sede Central - Lima',
    'Sede Norte - San Martín de Porres',
    'Sede Sur - Villa El Salvador',
    'Sede Este - Ate Vitarte',
    'Sede Oeste - Callao'
  ];

  const especialidadOptions = [
    'Urología',
    'Cardiología',
    'Neurología',
    'Dermatología',
    'Ginecología',
    'Pediatría',
    'Traumatología',
    'Oftalmología',
    'Otorrinolaringología',
    'Psiquiatría'
  ];

  const tipoOptions = [
    'Consulta',
    'Procedimiento',
    'Cirugía',
    'Examen',
    'Terapia',
    'Emergencia'
  ];

  const servicioOptions = [
    'CONSULTA VIRTUAL',
    'CONSULTA PRESENCIAL',
    'ECOGRAFIA VESICAL',
    'ONDA DE CHOQUE',
    'CIRUGÍA LAPAROSCÓPICA',
    'BIOPSIA',
    'ANÁLISIS CLÍNICO',
    'RAYOS X',
    'TOMOGRAFÍA',
    'RESONANCIA MAGNÉTICA'
  ];

  const canalOptions = [
    'WhatsApp',
    'Llamada telefónica',
    'Presencial',
    'Portal web',
    'Redes sociales',
    'Referido médico'
  ];

  const tipoPxOptions = [
    'Nuevo paciente',
    'Paciente recurrente',
    'Paciente VIP',
    'Paciente corporativo',
    'Paciente de emergencia'
  ];

  // Tipificación Venta orientada a AGENDO con jerarquía simple
  const agendoTipificacion = [
    {
      group: 'AGENDO > Venta Directa',
      options: ['Contacto Titular INTERESADO']
    },
    {
      group: 'AGENDO > Venta Tercero',
      options: ['Agenda Familiar INTERESADO', 'Agenda Amigo INTERESADO']
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddOrUpdateService = () => {
    // Validaciones específicas para agregar a la tabla
    if (!formData.especialidad) {
      focusAndToast('especialidad', 'Falta Especialidad');
      return;
    }
    if (!formData.servicio) {
      focusAndToast('servicio', 'Falta Procedimiento/Paquete');
      return;
    }
    if (!formData.monto) {
      focusAndToast('monto', 'Falta Monto');
      return;
    }
    const montoNum = Number((formData.monto || '0').toString().replace(/,/g, ''));
    if (Number.isNaN(montoNum) || montoNum < 0) {
      focusAndToast('monto', 'Monto inválido');
      return;
    }
    if (formData.especialidad && formData.servicio && formData.monto) {
      if (editingServiceId) {
        setServices(prev => prev.map(s => s.id === editingServiceId ? ({
          ...s,
          servicio: formData.especialidad,
          procedimiento: formData.servicio,
          monto: montoNum,
          turno: getShiftForTime(formData.startTime),
          hora: formData.startTime || s.hora
        }) : s));
        toast.success('Procedimiento/Paquete actualizado');
      } else {
        const newService: ServiceItem = {
          id: Date.now().toString(),
          servicio: formData.especialidad,
          procedimiento: formData.servicio,
          monto: montoNum,
          turno: getShiftForTime(formData.startTime),
          hora: formData.startTime || '15:30'
        };
        setServices(prev => [...prev, newService]);
        toast.success('Procedimiento/Paquete agregado');
      }

      // Limpiar campos de servicio y estado de edición
      setFormData(prev => ({
        ...prev,
        especialidad: '',
        tipo: '',
        servicio: '',
        monto: ''
      }));
      setEditingServiceId(null);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
    if (editingServiceId === serviceId) {
      setEditingServiceId(null);
    }
  };

  const handleEditService = (service: ServiceItem) => {
    // Precargar datos en el formulario para edición
    setFormData(prev => ({
      ...prev,
      especialidad: service.servicio,
      tipo: prev.tipo, // se mantiene si aplica
      servicio: service.procedimiento,
      monto: service.monto.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
      startTime: service.hora
    }));
    setEditingServiceId(service.id);
    // Llevar foco al bloque de servicio
    const el = document.getElementById('especialidad') as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  function focusAndToast(fieldId: string, message: string) {
    setInvalidField(fieldId);
    toast.error(message);
    const el = document.getElementById(fieldId) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // pequeño delay para asegurar el foco tras el scroll
      setTimeout(() => el.focus?.(), 200);
    }
  }

  const requiredValidation = (): { ok: boolean } => {
    if (!formData.documentNumber) {
      focusAndToast('documentNumber', 'Falta N° Documento');
      return { ok: false };
    }
    if (!formData.patient) {
      focusAndToast('patient', 'Falta Paciente');
      return { ok: false };
    }
    if (!formData.startDate) {
      focusAndToast('startDate', 'Falta Fecha Comienzo');
      return { ok: false };
    }
    if (!formData.startTime) {
      focusAndToast('startTime', 'Falta Hora Comienzo');
      return { ok: false };
    }
    if (!formData.sede) {
      focusAndToast('sede', 'Falta Sede');
      return { ok: false };
    }
    if (!formData.especialidad) {
      focusAndToast('especialidad', 'Falta Especialidad');
      return { ok: false };
    }
    if (!formData.tipo) {
      focusAndToast('tipo', 'Falta Tipo');
      return { ok: false };
    }
    if (!formData.servicio) {
      focusAndToast('servicio', 'Falta Procedimiento/Paquete');
      return { ok: false };
    }
    if (!formData.monto) {
      focusAndToast('monto', 'Falta Monto');
      return { ok: false };
    }
    if (!formData.canal) {
      focusAndToast('canal', 'Falta Canal');
      return { ok: false };
    }
    if (!formData.tipoPx) {
      focusAndToast('tipoPx', 'Falta Tipo Px');
      return { ok: false };
    }
    // Si hay servicios, exigir tipificación
    if (services.length > 0 && !formData.tipificacionVenta) {
      focusAndToast('tipificacionVenta', 'Falta Tipificación Venta');
      return { ok: false };
    }
    return { ok: true };
  };

  const handleSave = async () => {
    const req = requiredValidation();
    if (!req.ok) return;
    // Validaciones previas
    const today = getTodayISODate();
    if (!formData.startDate || formData.startDate < today) return;
    if (isToday(formData.startDate)) {
      // si no hay opciones de hora válidas, bloquear
      if (!formData.startTime || !filteredTimeOptions.includes(formData.startTime)) return;
    }
    const montoNum = Number((formData.monto || '0').toString().replace(/,/g, ''));
    if (Number.isNaN(montoNum) || montoNum < 0) return;
    const payload = {
      startDate: formData.startDate,
      startTime: formData.startTime,
      sede: formData.sede,
      especialidad: formData.especialidad,
      tipo: formData.tipo,
      servicio: formData.servicio,
      monto: String(montoNum),
      pauta: formData.pauta || undefined,
      canal: formData.canal,
      tipoPx: formData.tipoPx,
      tipificacionVenta: formData.tipificacionVenta || undefined,
    };
    try {
      if (onConfirm) {
        await onConfirm(payload);
      }
    } finally {
      onClose();
    }
  };

  const handleReschedule = () => {
    console.log('Reprogramando cita:', { leadId, formData, services });
    // Aquí iría la lógica para reprogramar
    onClose();
  };

  const handleDelete = () => {
    console.log('Eliminando cita:', { leadId });
    // Aquí iría la lógica para eliminar
    onClose();
  };

  const totalAmount = services.reduce((sum, service) => sum + service.monto, 0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Dialog Title for accessibility */}
          <VisuallyHidden.Root>
            <Dialog.Title>Agendar/Reprogramar Cita</Dialog.Title>
            <Dialog.Description>Complete los datos, agregue procedimientos y confirme la acción.</Dialog.Description>
          </VisuallyHidden.Root>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => window.location.href = '/home'}
                className="text-gray-600 hover:text-gray-800"
              >
                🏠
              </button>
              <h2 className="text-lg font-semibold text-gray-800">Agregar</h2>
            </div>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 space-y-4">
            {/* DNI y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentNumber" className="flex items-center space-x-1 text-sm font-medium">
                  <span>N° Documento</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <div className="flex space-x-2">
                <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                  onChange={(e) => { setInvalidField((prev) => prev === 'documentNumber' ? null : prev); handleInputChange('documentNumber', e.target.value); }}
                    placeholder="Ingrese número de documento"
                  className={`flex-1 ${invalidField === 'documentNumber' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                  />
                  <Button size="sm" variant="outline" className="px-3">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Teléfono</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Ingrese teléfono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3"
                    onClick={async () => {
                      try {
                        const onlyDigits = formData.phone.replace(/\D/g, '');
                        if (onlyDigits.length < 9) return;
                        const { fakeUpdatePhone } = await import('@/services/mockScheduler');
                        await fakeUpdatePhone(leadId, onlyDigits);
                        // Sincronizar el input con el valor normalizado
                        setFormData((prev) => ({ ...prev, phone: onlyDigits }));
                      } catch {}
                    }}
                  >
                    Actualizar
                  </Button>
                </div>
              </div>
            </div>

            {/* Paciente */}
            <div className="space-y-2">
              <Label htmlFor="patient" className="flex items-center space-x-1 text-sm font-medium">
                <span>Paciente</span>
                <span className="text-red-500">(*)</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="patient"
                  value={formData.patient}
                  onChange={(e) => { setInvalidField((prev) => prev === 'patient' ? null : prev); handleInputChange('patient', e.target.value); }}
                  placeholder="Nombre del paciente"
                  className={`flex-1 ${invalidField === 'patient' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                />
                <Button size="sm" variant="outline" className="px-3">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Fecha Comienzo</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  min={getTodayISODate()}
                  onChange={(e) => {
                    const val = e.target.value;
                    // si cambia a hoy y la hora seleccionada ya no es válida, limpiarla
                    setFormData((prev) => ({
                      ...prev,
                      startDate: val,
                      startTime: isToday(val) && prev.startTime && !filteredTimeOptions.includes(prev.startTime)
                        ? ''
                        : prev.startTime,
                    }));
                    setInvalidField((prev) => prev === 'startDate' ? null : prev);
                  }}
                  placeholder="Desde"
                  className={`${invalidField === 'startDate' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Hora Comienzo</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <select
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) => { setInvalidField((prev) => prev === 'startTime' ? null : prev); handleInputChange('startTime', e.target.value); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={invalidField === 'startTime'}
                >
                  <option value="">Seleccione</option>
                  {(isToday(formData.startDate) ? filteredTimeOptions : timeOptions).map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sede */}
            <div className="space-y-2">
              <Label htmlFor="sede" className="flex items-center space-x-1 text-sm font-medium">
                <span>Sede</span>
                <span className="text-red-500">(*)</span>
              </Label>
              <select
                id="sede"
                value={formData.sede}
                onChange={(e) => { setInvalidField((prev) => prev === 'sede' ? null : prev); handleInputChange('sede', e.target.value); }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalidField === 'sede' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
              >
                <option value="">Seleccione</option>
                {sedeOptions.map(sede => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
            </div>

            {/* Servicios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="especialidad" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Especialidad</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <select
                  id="especialidad"
                  value={formData.especialidad}
                  onChange={(e) => { setInvalidField((prev) => prev === 'especialidad' ? null : prev); handleInputChange('especialidad', e.target.value); }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalidField === 'especialidad' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                >
                  <option value="">Seleccione</option>
                  {especialidadOptions.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Tipo</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => { setInvalidField((prev) => prev === 'tipo' ? null : prev); handleInputChange('tipo', e.target.value); }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalidField === 'tipo' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                >
                  <option value="">Selecciona una opción</option>
                  {tipoOptions.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicio" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Procedimiento/Paquete</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <select
                  id="servicio"
                  value={formData.servicio}
                  onChange={(e) => { setInvalidField((prev) => prev === 'servicio' ? null : prev); handleInputChange('servicio', e.target.value); }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalidField === 'servicio' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                >
                  <option value="">Selecciona una opción</option>
                  {servicioOptions.map(servicio => (
                    <option key={servicio} value={servicio}>{servicio}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Monto</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <Input
                  id="monto"
                  type="text"
                  inputMode="decimal"
                  value={formData.monto}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, '');
                    // permitir solo números y un punto decimal
                    if (!/^\d*(?:\.\d{0,2})?$/.test(raw)) return;
                    // no negativos
                    const num = raw === '' ? '' : Number(raw);
                    if (num !== '' && Number(num) < 0) return;
                    // formato visual con separadores
                    const [intPart, decPart] = raw.split('.');
                    const formattedInt = intPart ? Number(intPart).toLocaleString('en-US') : '';
                    const formatted = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
                    setFormData((prev) => ({ ...prev, monto: formatted }));
                    setInvalidField((prev) => prev === 'monto' ? null : prev);
                  }}
                  placeholder="Ingrese el monto"
                  className={`${invalidField === 'monto' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                />
              </div>
            </div>

            {/* Botón para agregar a la tabla */}
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                {editingServiceId && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3"
                    onClick={() => {
                      setEditingServiceId(null);
                      setFormData(prev => ({ ...prev, especialidad: '', tipo: '', servicio: '', monto: '' }));
                    }}
                  >
                    Cancelar edición
                  </Button>
                )}
                <Button onClick={handleAddOrUpdateService} variant="outline" className="px-4 py-2">
                  {editingServiceId ? 'Actualizar Procedimiento' : 'Agregar a Procedimiento/Paquete'}
                </Button>
              </div>
            </div>

            {/* Pauta */}
            <div className="space-y-2">
              <Label htmlFor="pauta" className="text-sm font-medium">
                Pauta
              </Label>
              <Input
                id="pauta"
                value={formData.pauta}
                onChange={(e) => handleInputChange('pauta', e.target.value)}
                placeholder="Ingrese el Id/Pauta"
                className="border-red-300 focus:border-red-500"
              />
            </div>

            

            {/* Tabla de Servicios - Solo se muestra si hay servicios */}
            {services.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Procedimientos Agregados</Label>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200" style={{ backgroundColor: COLOR_TURQUESA }}>
                        <th className="text-left py-2 px-3 font-semibold text-white">ESPECIALIDAD</th>
                        <th className="text-left py-2 px-3 font-semibold text-white">PROCEDIMIENTO</th>
                        <th className="text-left py-2 px-3 font-semibold text-white">MONTO</th>
                        <th className="text-left py-2 px-3 font-semibold text-white">TURNO</th>
                        <th className="text-left py-2 px-3 font-semibold text-white">HORA</th>
                        <th className="text-center py-2 px-3 font-semibold text-white">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr key={service.id} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-sm text-gray-700">{service.servicio}</td>
                          <td className="py-2 px-3 text-sm text-gray-700">{service.procedimiento}</td>
                          <td className="py-2 px-3 text-sm text-gray-700">S/ {service.monto.toFixed(2)}</td>
                          <td className="py-2 px-3 text-sm text-gray-700">{service.turno}</td>
                          <td className="py-2 px-3 text-sm text-gray-700">{service.hora}</td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button onClick={() => handleEditService(service)} className="p-1 hover:bg-gray-100 rounded">
                                <Edit className="w-4 h-4 text-blue-600" />
                              </button>
                              <button 
                                onClick={() => handleRemoveService(service.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {services.length > 0 && (
                    <div className="mt-4 text-right">
                      <span className="text-lg font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>
                        Total: S/ {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Canal y Tipo Px (debajo de Procedimientos Agregados) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="canal" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Canal</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <select
                  id="canal"
                  value={formData.canal}
                  onChange={(e) => { setInvalidField((prev) => prev === 'canal' ? null : prev); handleInputChange('canal', e.target.value); }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalidField === 'canal' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                >
                  <option value="">Seleccione</option>
                  {canalOptions.map(canal => (
                    <option key={canal} value={canal}>{canal}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoPx" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Tipo Px</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <select
                  id="tipoPx"
                  value={formData.tipoPx}
                  onChange={(e) => { setInvalidField((prev) => prev === 'tipoPx' ? null : prev); handleInputChange('tipoPx', e.target.value); }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalidField === 'tipoPx' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                >
                  <option value="">Seleccione</option>
                  {tipoPxOptions.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tipificación Venta (AGENDO) - Sólo si hay servicios */}
            {services.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="tipificacionVenta" className="flex items-center space-x-1 text-sm font-medium">
                  <span>Tipificación (AGENDO)</span>
                  <span className="text-red-500">(*)</span>
                </Label>
                <select
                  id="tipificacionVenta"
                  value={formData.tipificacionVenta}
                  onChange={(e) => { setInvalidField((prev) => prev === 'tipificacionVenta' ? null : prev); handleInputChange('tipificacionVenta', e.target.value); }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalidField === 'tipificacionVenta' ? 'border-red-500 ring-2 ring-red-300' : ''}`}
                >
                  <option value="">Seleccione</option>
                  {agendoTipificacion.map(group => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map(opt => (
                        <option key={opt} value={`${group.group} > ${opt}`}>{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                onClick={handleDelete}
                className="px-6 py-2 text-white font-medium"
                style={{ backgroundColor: '#ef4444' }}
              >
                Eliminar Cita
              </Button>
              {canReschedule && (
                <Button 
                  onClick={handleReschedule}
                  className="px-6 py-2 text-white font-medium"
                  style={{ backgroundColor: '#f59e0b' }}
                >
                  Reprogramar
                </Button>
              )}
              <Button 
                onClick={handleSave}
                className="px-6 py-2 text-white font-medium"
                style={{ backgroundColor: COLOR_TURQUESA }}
              >
                Agregar
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}