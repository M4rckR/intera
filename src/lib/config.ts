// Configuración centralizada para las URLs del backend
export const BACKEND_CONFIG = {
  // URL base del backend
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://54.172.153.21:4000',
  
  // URL del socket
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://54.172.153.21:4000',
  
  // Endpoints específicos
  ENDPOINTS: {
    WHATSAPP_STATUS: '/api/whatsapp/status',
    RECONNECT: '/api/botstatus/reconnect',
    ADMIN: {
      GET_MANAGERS: '/api/admin/getManagers',
      DESACTIVE_RECONTACT: '/api/admin/desactiveRecontact',
      DESACTIVE_REMINDER: '/api/admin/desactiveReminder',
    }
  }
} as const;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${BACKEND_CONFIG.BASE_URL}${endpoint}`;
};
