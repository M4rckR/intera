'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BotLeadsTable } from '@/app/components/BotLeadsTable';
import { ManagerLeadsTable } from '@/app/components/ManagerLeadsTable';
import { Header } from '@/app/components/Header';
import { useAuthStore } from '@/store/auth';
import { LeadTable } from '@/types/components';
import { BACKEND_CONFIG } from '@/lib/config';
import { useLeadsStore } from '@/store/leads';
import { Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';

const USE_SOCKET = process.env.NEXT_PUBLIC_USE_SOCKET !== 'false';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let socket: any = null;
if (USE_SOCKET) {
  socket = io(BACKEND_CONFIG.SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    timeout: 20000,
    forceNew: true
  });
}

// Componente DashboardTabs
function DashboardTabs({ activeTab, onTabChange, userRole, showGlobalToggle, onGlobalToggle, showGlobalAppointments }: { 
  activeTab: 'leads' | 'appointments'; 
  onTabChange: (tab: 'leads' | 'appointments') => void;
  userRole: 'manager' | 'bot';
  showGlobalToggle?: boolean;
  onGlobalToggle?: (global: boolean) => void;
  showGlobalAppointments?: boolean;
}) {
  const tabs = [
    {
      id: 'leads' as const,
      label: userRole === 'bot' ? 'Leads del Bot' : 'Leads del Gestor',
      icon: Users,
    },
    {
      id: 'appointments' as const,
      label: 'Agendamientos',
      icon: Calendar,
    },
  ];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'group inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-2 h-4 w-4',
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          
          {/* Toggle para vista global de agendamientos */}
          {showGlobalToggle && activeTab === 'appointments' && onGlobalToggle && (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Vista:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onGlobalToggle(false)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                    !showGlobalAppointments
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Este Teléfono
                </button>
                <button
                  onClick={() => onGlobalToggle(true)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                    showGlobalAppointments
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Todos mis Agendamientos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente AppointmentsTable
function AppointmentsTable({ appointments, phoneNumber, showGlobal = false }: { 
  appointments: LeadTable[]; 
  phoneNumber: string;
  showGlobal?: boolean;
}) {
  // Filtrar leads con agendamientos
  const scheduledLeads = appointments.filter(lead => {
    const hasAppointment = lead.conversationState === 'AGENDADO' && lead.scheduledAppointmentAt;
    
    if (showGlobal) {
      // Vista global: mostrar todos los agendamientos del gestor
      return hasAppointment;
    } else {
      // Vista específica: solo agendamientos de este teléfono
      return hasAppointment && (lead.phone === phoneNumber || lead.clientPhone === phoneNumber);
    }
  });

  function formatDateTime(value?: string | null) {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    const iso = d.toISOString();
    return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {showGlobal ? 'Todos mis Agendamientos' : 'Agendamientos de este Teléfono'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {showGlobal 
                ? 'Todos los agendamientos realizados por este gestor' 
                : `Agendamientos creados por ${phoneNumber}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              {scheduledLeads.length} agendamientos
            </div>
          </div>
        </div>
      </div>
      
      {scheduledLeads.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay agendamientos</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            No se han realizado agendamientos con este teléfono. Los agendamientos aparecerán aquí una vez que se programen.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className='px-4 bg-gray-50'>
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="font-semibold text-gray-700">Paciente</TableHead>
                  <TableHead className="font-semibold text-gray-700">Teléfono Cliente</TableHead>
                  <TableHead className="font-semibold text-gray-700">Sede</TableHead>
                  <TableHead className="font-semibold text-gray-700">Fecha de Cita</TableHead>
                  <TableHead className="font-semibold text-gray-700">Procedimientos</TableHead>
                  {showGlobal && <TableHead className="font-semibold text-gray-700">Teléfono Gestor</TableHead>}
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledLeads.map((lead, index) => (
                  <TableRow key={lead.id} className={cn(
                    "hover:bg-gray-50 transition-colors",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}>
                    <TableCell className="font-medium text-gray-900">{lead.name}</TableCell>
                    <TableCell className="text-gray-600">{lead.clientPhone}</TableCell>
                    <TableCell className="text-gray-600">{lead.sede}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{formatDateTime(lead.scheduledAppointmentAt)}</div>
                        <div className="text-gray-500">{lead.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.procedures.map((proc, idx) => (
                          <div key={idx} className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium mr-1 mb-1">
                            <span className="font-medium">{proc.name}</span>
                            <span className="ml-1 text-blue-600">S/ {proc.precio}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    {showGlobal && (
                      <TableCell className="text-sm text-gray-600">
                        {lead.phone || phoneNumber}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                        Agendado
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}


export default function DashboardPhonePage() {
  const params = useParams();
  const phoneNumber = params?.phoneNumber as string;
  const [leads, setLeads] = useState<LeadTable[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'appointments'>('leads');
  const [showGlobalAppointments, setShowGlobalAppointments] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const storeLeads = useLeadsStore((s) => s.leads) as LeadTable[];

  // Datos fake para testing con ejemplos de agendamientos
  const fakeLeads: LeadTable[] = [
    {
      id: '1',
      name: 'MARÍA GONZÁLEZ RODRÍGUEZ',
      clientPhone: '987654321',
      phone: phoneNumber,
      district: 'Lima Centro',
      sede: 'Sede Central - Lima',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      procedures: [
        { name: 'Consulta General', precio: '50.00', state: 'Pendiente' },
        { name: 'Examen de Sangre', precio: '25.00', state: 'Pendiente' }
      ],
      isBotActive: true,
      document: '12345678',
      createdAtLead: '2025-09-27T09:00:00.000Z',
      lastAppointmentAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      scheduledAppointmentAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      conversationState: 'AGENDADO'
    },
    {
      id: '2',
      name: 'CARLOS MÉNDEZ SILVA',
      clientPhone: '987654322',
      phone: phoneNumber,
      district: 'San Martín',
      sede: 'Sede Norte - San Martín',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:30',
      procedures: [
        { name: 'Consulta Cardiológica', precio: '80.00', state: 'Pendiente' }
      ],
      isBotActive: true,
      document: '23456789',
      createdAtLead: '2025-10-28T10:00:00.000Z',
      lastAppointmentAt: new Date().toISOString(),
      scheduledAppointmentAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      conversationState: 'AGENDADO'
    },
    {
      id: '3',
      name: 'ANA LÓPEZ TORRES',
      clientPhone: '987654323',
      phone: phoneNumber,
      district: 'Villa El Salvador',
      sede: 'Sede Sur - Villa El Salvador',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:15',
      procedures: [
        { name: 'Consulta Dermatológica', precio: '60.00', state: 'Pendiente' },
        { name: 'Biopsia', precio: '120.00', state: 'Pendiente' }
      ],
      isBotActive: false,
      document: '34567890',
      createdAtLead: '2025-10-29T10:00:00.000Z',
      lastAppointmentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      scheduledAppointmentAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      conversationState: 'CONTACTADO'
    },
    {
      id: '4',
      name: 'JOSÉ RAMÍREZ VARGAS',
      clientPhone: '987654324',
      phone: phoneNumber,
      district: 'Ate Vitarte',
      sede: 'Sede Este - Ate Vitarte',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '16:00',
      procedures: [
        { name: 'Consulta Oftalmológica', precio: '70.00', state: 'Pendiente' },
        { name: 'Examen de Vista', precio: '30.00', state: 'Pendiente' }
      ],
      isBotActive: true,
      document: '45678901',
      createdAtLead: '2025-10-30T08:43:00.000Z',
      lastAppointmentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      scheduledAppointmentAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      conversationState: 'AGENDADO'
    },
    {
      id: '5',
      name: 'ROSA FERNÁNDEZ CASTRO',
      clientPhone: '987654325',
      phone: phoneNumber,
      district: 'Callao',
      sede: 'Sede Oeste - Callao',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:45',
      procedures: [
        { name: 'Consulta Ginecológica', precio: '90.00', state: 'Pendiente' },
        { name: 'Papanicolaou', precio: '40.00', state: 'Pendiente' }
      ],
      isBotActive: false,
      document: '56789012',
      createdAtLead: '2025-10-31T10:00:00.000Z',
      lastAppointmentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      scheduledAppointmentAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      conversationState: 'AGENDADO'
    }
  ];

  useEffect(() => {
    if (!phoneNumber) return;
    
    // Cargar datos fake para testing
    setLeads(fakeLeads);
    
    if (USE_SOCKET) {
      socket.emit('join', { phoneNumber });
      socket.emit('getLeads', { phoneNumber });
    }
  }, [phoneNumber, storeLeads]);

  useEffect(() => {
    if (!USE_SOCKET) return;
    
    // Temporalmente deshabilitado para testing con datos fake
    return;
    
    const handleLeads = (leadsData: LeadTable[]) => {
      const filteredLeads = leadsData.filter((lead: LeadTable) => lead.phone === phoneNumber || lead.clientPhone === phoneNumber);
      setLeads(filteredLeads);
    };
    socket.on('leadsData', handleLeads);
    return () => {
      socket.off('leadsData', handleLeads);
    };
  }, [phoneNumber]);


  const roles = user?.roles || {};
  const userRole = roles.isAdminBot ? 'bot' : 'manager';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        username={user?.username || ''}
        onLogout={logout}
        showBackHome={true}
        onBackHome={() => router.push('/home')}
      />
      <div className="px-6 py-8 container mx-auto max-w-7xl">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'leads' 
                  ? `${userRole === 'bot' ? 'Panel del Bot' : `Panel de ${user?.username || 'Gestor'}`}`
                  : 'Agendamientos'
                }
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {activeTab === 'leads' 
                  ? `Teléfono: ${phoneNumber}`
                  : `Agendamientos de ${phoneNumber}`
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {activeTab === 'leads' 
                  ? 'Gestiona los leads de este número en tiempo real'
                  : 'Visualiza y administra los agendamientos programados'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 rounded-lg px-4 py-3 shadow-sm border">
                <div className="text-sm text-white font-medium">
                  {activeTab === 'leads' ? 'Total Leads' : 'Leads Totales'}
                </div>
                <div className="text-2xl font-bold text-white">{leads.length}</div>
              </div>
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm border">
                <div className="text-sm text-gray-500">
                  {activeTab === 'leads' ? 'Agendamientos' : 'Agendados'}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {leads.filter(l => l.conversationState === 'AGENDADO').length}
                </div>
              </div>
              {activeTab === 'leads' && (
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm border">
                  <div className="text-sm text-gray-500">Contactados</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {leads.filter(l => l.conversationState === 'CONTACTADO').length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* NavBar con pestañas */}
        <DashboardTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={userRole}
          showGlobalToggle={user?.phones && user.phones.length > 1}
          onGlobalToggle={setShowGlobalAppointments}
          showGlobalAppointments={showGlobalAppointments}
        />
        
        {/* Contenido según pestaña activa */}
        {activeTab === 'leads' ? (
          // Vista de leads
          (() => {
            if (roles.isAdminBot) {
              return <BotLeadsTable leads={leads} />;
            }
            if (roles.isManager) {
              return <ManagerLeadsTable leads={leads} />;
            }
            return <ManagerLeadsTable leads={leads} />;
          })()
        ) : (
          // Vista de agendamientos
          <AppointmentsTable 
            appointments={leads} 
            phoneNumber={phoneNumber} 
            showGlobal={showGlobalAppointments}
          />
        )}
      </div>
    </div>
  );
} 