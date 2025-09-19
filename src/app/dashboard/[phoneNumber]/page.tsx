'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LeadsTable } from '@/app/components/LeadsTable';
import { Header } from '@/app/components/Header';
import { useAuthStore } from '@/store/auth';
import { LeadTable } from '@/types/components';
import { BACKEND_CONFIG } from '@/lib/config';

console.log('🔍 ===== SOCKET INITIALIZATION =====');
console.log('🔌 Socket URL:', BACKEND_CONFIG.SOCKET_URL);

const socket = io(BACKEND_CONFIG.SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  timeout: 20000,
  forceNew: true
});

console.log('✅ Socket instance created');

export default function DashboardPhonePage() {
  console.log('🔍 ===== DASHBOARD COMPONENT RENDERED =====');
  
  const params = useParams();
  const phoneNumber = params?.phoneNumber as string;
  const [leads, setLeads] = useState<LeadTable[]>([]);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  
  console.log('🔍 Component state:', {
    phoneNumber,
    leadsCount: leads.length,
    user: user?.username
  });

  useEffect(() => {
    if (!phoneNumber) {
      console.log('❌ No phoneNumber provided');
      return;
    }
    
    console.log('🔍 ===== SOCKET DIAGNOSTIC =====');
    console.log('📡 Phone number:', phoneNumber);
    console.log('🔌 Socket connected:', socket.connected);
    console.log('🔌 Socket ID:', socket.id);
    console.log('🔌 Socket URL:', BACKEND_CONFIG.SOCKET_URL);
    
    if (socket.connected) {
      console.log('✅ Socket is connected, emitting getLeads...');
      socket.emit('getLeads', { phoneNumber });
      console.log('✅ getLeads event emitted');
    } else {
      console.log('❌ Socket not connected, waiting for connection...');
      socket.once('connect', () => {
        console.log('✅ Socket connected, now emitting getLeads...');
        socket.emit('getLeads', { phoneNumber });
        console.log('✅ getLeads event emitted after connection');
      });
    }
  }, [phoneNumber]);

  useEffect(() => {
    // Verificar conexión del socket
    console.log('🔌 Socket connected:', socket.connected);
    
    const handleLeads = (leadsData: LeadTable[]) => {
      console.log('🔍 ===== LEADS DATA RECEIVED =====');
      console.log('📥 Raw data:', leadsData);
      console.log('📥 Data type:', typeof leadsData);
      console.log('📥 Is array:', Array.isArray(leadsData));
      console.log('📥 Length:', leadsData?.length || 0);
      
      if (!leadsData || !Array.isArray(leadsData)) {
        console.error('❌ Invalid leads data received');
        setLeads([]);
        return;
      }
      
      if (leadsData.length === 0) {
        console.log('⚠️ No leads received');
        setLeads([]);
        return;
      }
      
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
    
    console.log('🔍 ===== REGISTERING SOCKET LISTENERS =====');
    console.log('📡 Registering leadsData listener...');
    
    // Agregar listener con logs adicionales
    socket.on('leadsData', (data) => {
      console.log('🔍 ===== LEADS DATA EVENT TRIGGERED =====');
      console.log('📥 Event received, calling handleLeads...');
      handleLeads(data);
    });
    
    console.log('✅ leadsData listener registered');
    
    // Verificar que el listener se registró correctamente
    console.log('🔍 Socket listeners count:', socket.listeners('leadsData').length);
    
    return () => {
      console.log('🔍 ===== CLEANING UP SOCKET LISTENERS =====');
      console.log('🔍 Removing leadsData listener...');
      socket.off('leadsData', handleLeads);
      socket.off('connect');
      socket.off('disconnect');
      console.log('✅ Socket listeners cleaned up');
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