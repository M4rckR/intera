// Tipos para el estado de WhatsApp
export interface WhatsAppState {
  isReady: boolean;
  qrCode: string | null;
  isQrEmpty: boolean;
  isLoading: boolean;
  error: string | null;
  isBlocked: boolean;
  lastUpdate: Date | null;
}

// Tipos para el hook useWhatsApp
export interface UseWhatsAppReturn {
  state: WhatsAppState;
  requestNewQr: () => void;
  isConnected: boolean;
}

// Tipos para los eventos del socket
export interface WhatsAppStatusData {
  isReady: boolean;
  qrCodeUrl: string | null;
  isQrEmpty?: boolean;
  error?: string;
  message?: string;
}

// Tipos para las respuestas del backend
export interface ReconnectResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Tipos para los eventos de solicitud de nuevo QR
export interface RequestNewQrData {
  phoneNumber: string;
  timestamp: number;
  action?: string;
}
