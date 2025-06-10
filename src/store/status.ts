import { DataConnection, Lead, Stats, LeadFromBackend } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 30000; // 30 segundos
let heartbeatInterval: NodeJS.Timeout | null = null;

// Función para convertir datos aplanados del backend a estructura anidada
const convertBackendLeadToFrontend = (backendLead: LeadFromBackend): Lead => {
  return {
    id: backendLead.id,
    phone: backendLead.phone,
    created_at: backendLead.created_at,
    updated_at: backendLead.updated_at,
    conversationState: {
      patientInfo: {
        name: backendLead.name,
        department: backendLead.department
      },
      appointmentInfo: {
        location: backendLead.sede,
        date: backendLead.fecha_cita,
        time: backendLead.hora_cita
      }
    },
    botState: {
      is_bot_active: backendLead.is_bot_active
    }
  };
};

type StatusState = {
  active: boolean;
  isLoading: boolean;
  timeoutReached: boolean;
  connection: DataConnection | null;
  lastUpdate: number | null;
  leads: Lead[];
  stats: Stats | null;
  setActive: (active: boolean) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  updateBotStatus: (leadId: string, isActive: boolean) => void;
};

const startHeartbeat = (socketInstance: Socket) => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  heartbeatInterval = setInterval(() => {
    if (socketInstance.connected) {
      socketInstance.emit('ping');
    }
  }, HEARTBEAT_INTERVAL);
};

export const useStatusStore = create<StatusState>()(
  devtools(
    (set, get) => ({
      active: false,
      isLoading: true,
      timeoutReached: false,
      connection: {
        isReady: false,
        qrCodeUrl: "",
      },
      lastUpdate: null,
      leads: [],
      stats: null,
      setActive: (active: boolean) =>
        set(
          { active },
          false,
          'setActive'
        ),
      updateBotStatus: (leadId: string, isActive: boolean) => {
        if (socket?.connected) {
          console.log(`🤖 Actualizando bot status para lead ${leadId}: ${isActive}`);
          socket.emit('update-bot-status', { id: leadId, is_bot_active: isActive });
        }
      },
      disconnectSocket: () => {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        reconnectAttempts = 0;
        set(
          { timeoutReached: true, isLoading: false },
          false,
          'disconnectSocket'
        );
      },
      connectSocket: () => {
        if (socket?.connected) return;

        set(
          { isLoading: true, timeoutReached: false },
          false,
          'connectSocket:start'
        );
        
        const socketInstance = io("http://54.172.153.21:4000", {
          reconnection: true,
          reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['websocket'],
        });

        socket = socketInstance;

        // Evento cuando se conecta exitosamente
        socketInstance.on("connect", () => {
          console.log('🔌 Socket conectado');
          reconnectAttempts = 0;
          set(
            { 
              isLoading: false,
              timeoutReached: false 
            },
            false,
            'socket:connect'
          );
          startHeartbeat(socketInstance);
        });

        // Evento cuando hay un error de conexión
        socketInstance.on("connect_error", (error) => {
          console.error('❌ Error de conexión:', error);
          reconnectAttempts++;
          
          if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            set(
              { 
                isLoading: false,
                timeoutReached: true 
              },
              false,
              'socket:connect_error_max_reached'
            );
            get().disconnectSocket();
          }
        });

        // Evento cuando se desconecta
        socketInstance.on("disconnect", (reason) => {
          console.log('🔌❌ Socket desconectado:', reason);
          set(
            { 
              isLoading: false,
              timeoutReached: true 
            },
            false,
            'socket:disconnect'
          );
        });

        // Evento para el estado de WhatsApp
        socketInstance.on("whatsapp-status", (data) => {
          console.log('📱 WhatsApp status actualizado:', data);
          const now = Date.now();
          set(
            { 
              connection: data, 
              isLoading: false,
              timeoutReached: false,
              lastUpdate: now
            },
            false,
            'whatsapp-status:update'
          );
        });

        // Evento para los datos de leads
        socketInstance.on("leads-data", (backendLeads: LeadFromBackend[]) => {
          console.log('📋 Datos originales del backend:', backendLeads);
          
          // Convertir los datos aplanados a estructura anidada
          const convertedLeads = backendLeads.map(convertBackendLeadToFrontend);
          
          console.log('📋✅ Leads convertidos para frontend:', convertedLeads);
          
          set(
            { 
              leads: convertedLeads,
              lastUpdate: Date.now()
            },
            false,
            'leads-data:update'
          );
        });

        // Evento para las estadísticas
        socketInstance.on("stats-data", (stats: Stats) => {
          console.log('📊 Stats actualizadas:', stats);
          set(
            { 
              stats,
              lastUpdate: Date.now()
            },
            false,
            'stats-data:update'
          );
        });

        // Evento de reconexión
        socketInstance.on("reconnect_attempt", (attemptNumber) => {
          console.log(`🔄 Intento de reconexión ${attemptNumber}`);
        });

        // Evento de reconexión exitosa
        socketInstance.on("reconnect", (attemptNumber) => {
          console.log(`✅ Reconectado después de ${attemptNumber} intentos`);
          set(
            { 
              isLoading: false,
              timeoutReached: false 
            },
            false,
            'socket:reconnect'
          );
        });

        // Evento de reconexión fallida
        socketInstance.on("reconnect_failed", () => {
          console.log('❌ Falló la reconexión');
          set(
            { 
              isLoading: false,
              timeoutReached: true 
            },
            false,
            'socket:reconnect_failed'
          );
        });
      },
    }),
    {
      name: 'status-store', // Nombre que aparecerá en DevTools
      serialize: {
        options: true
      }
    }
  )
);
