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


export default function DashboardPhonePage() {
  const params = useParams();
  const phoneNumber = params?.phoneNumber as string;
  const [leads, setLeads] = useState<LeadTable[]>([]);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const storeLeads = useLeadsStore((s) => s.leads) as LeadTable[];

  useEffect(() => {
    if (!phoneNumber) return;
    if (!USE_SOCKET) {
      setLeads(storeLeads?.filter?.((l: LeadTable) => l?.phone === phoneNumber || l?.clientPhone === phoneNumber) || []);
      return;
    }
    console.log('📡 Joining room ->', { phoneNumber, socketId: socket?.id, connected: socket?.connected });
    socket.emit('join', { phoneNumber });
    console.log('📡 Emitting getLeads ->', { phoneNumber, connected: socket?.connected, socketId: socket?.id });
    socket.emit('getLeads', { phoneNumber });
  }, [phoneNumber, storeLeads]);

  useEffect(() => {
    if (!USE_SOCKET) return;
    const handleLeads = (leadsData: LeadTable[]) => {
      const filteredLeads = leadsData.filter((lead: LeadTable) => lead.phone === phoneNumber || lead.clientPhone === phoneNumber);
      setLeads(filteredLeads);
    };
    socket.on('leadsData', handleLeads);
    return () => {
      socket.off('leadsData', handleLeads);
    };
  }, [phoneNumber]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header
        username={user?.username || ''}
        onLogout={logout}
        showBackHome={true}
        onBackHome={() => router.push('/home')}
      />
      <div className="px-4 container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Dashboard de {phoneNumber}</h1>
        <p className="text-gray-500 mb-8">Gestiona los leads de este número en tiempo real.</p>
        {(() => {
          const roles = user?.roles || {};
          // Preferir vista del bot si tiene rol de bot
          if (roles.isAdminBot) {
            return <BotLeadsTable leads={leads} />;
          }
          // Si no tiene bot, mostrar vista de gestor si aplica
          if (roles.isManager) {
            return <ManagerLeadsTable leads={leads} />;
          }
          // Fallback seguro: vista del bot
          return <ManagerLeadsTable leads={leads} />;
        })()}
      </div>
    </div>
  );
} 