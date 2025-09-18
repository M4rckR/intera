'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LeadsTable } from '@/app/components/LeadsTable';
import { Header } from '@/app/components/Header';
import { useAuthStore } from '@/store/auth';
import { LeadTable } from '@/types/components';
import { BACKEND_CONFIG } from '@/lib/config';

const socket = io(BACKEND_CONFIG.SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  timeout: 20000,
  forceNew: true
});

export default function DashboardPhonePage() {
  const params = useParams();
  const phoneNumber = params?.phoneNumber as string;
  const [leads, setLeads] = useState<LeadTable[]>([]);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    if (!phoneNumber) return;
    console.log('📡 Requesting leads for phoneNumber:', phoneNumber);
    socket.emit('getLeads', { phoneNumber });
  }, [phoneNumber]);

  useEffect(() => {
    // Verificar conexión del socket
    console.log('🔌 Socket connected:', socket.connected);
    
    const handleLeads = (leadsData: LeadTable[]) => {
      console.log('📥 Leads received from backend:', leadsData);
      console.log('📥 Total leads received:', leadsData.length);
      
      // Debug: imprimir cada lead recibido
      leadsData.forEach((lead, index) => {
        console.log(`📥 Lead ${index + 1}:`, {
          id: lead.id,
          clientPhone: lead.clientPhone,
          phone: lead.phone,
          name: lead.name
        });
      });
      
      // ✅ CORRECCIÓN: Mostrar leads donde clientPhone !== phoneNumber
      // (leads de clientes diferentes al manager)
      const validLeads = leadsData.filter(lead => lead.clientPhone !== phoneNumber);
      
      console.log('📥 Valid leads after filtering:', validLeads);
      console.log('📥 Total valid leads:', validLeads.length);
      
      setLeads(validLeads);
    };
    
    // Escuchar eventos de conexión
    socket.on('connect', () => {
      console.log('🔌 Socket connected successfully');
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });
    
    socket.on('leadsData', handleLeads);
    
    return () => {
      socket.off('leadsData', handleLeads);
      socket.off('connect');
      socket.off('disconnect');
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
        <LeadsTable leads={leads} />
      </div>
    </div>
  );
} 