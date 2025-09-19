// Configuración centralizada para las URLs del backend
export const BACKEND_CONFIG = {
  // URL base del backend
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://callhub.insalud.pe',
  
  // URL del socket
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://callhub.insalud.pe',
  
  // Endpoints específicos
  ENDPOINTS: {
    WHATSAPP_STATUS: '/api/whatsapp/status',
    RECONNECT: '/api/botstatus/reconnect',
    ADMIN: {
      GET_MANAGERS: '/api/admin/getManagers',
      DESACTIVE_RECONTACT: '/api/admin/desactiveRecontact',
      DESACTIVE_REMINDER: '/api/admin/desactiveReminder',
    },
    LEADS: {
      UPDATE_BOT_STATUS: '/api/leads/update-bot-status',
    }
  }
} as const;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${BACKEND_CONFIG.BASE_URL}${endpoint}`;
};
