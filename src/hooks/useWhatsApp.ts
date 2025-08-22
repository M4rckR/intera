import { useState, useEffect, useCallback, useRef } from 'react';
import { socketManager } from '@/lib/socket';
import { buildApiUrl, BACKEND_CONFIG } from '@/lib/config';
import { WhatsAppState, UseWhatsAppReturn, WhatsAppStatusData, RequestNewQrData } from '@/types/whatsapp';
import { Socket } from 'socket.io-client';

export const useWhatsApp = (phoneNumber: string): UseWhatsAppReturn => {
  const [state, setState] = useState<WhatsAppState>({
    isReady: false,
    qrCode: null,
    isQrEmpty: true,
    isLoading: false,
    error: null,
    errorType: null,
    isBlocked: false,
    lastUpdate: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para actualizar estado de manera segura
  const updateState = useCallback((updates: Partial<WhatsAppState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      lastUpdate: new Date(),
    }));
  }, []);

  // Función para solicitar estado con debounce
  const requestStatus = useCallback(() => {
    if (!socketRef.current?.connected) return;

    // Limpiar timeout anterior
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    // Debounce de 1 segundo
    requestTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('getWhatsappStatus', { phoneNumber });
        updateState({ isLoading: true });
      }
    }, 1000);
  }, [phoneNumber, updateState]);

  // Configurar socket y listeners
  useEffect(() => {
    const socket = socketManager.connect();
    socketRef.current = socket;

    // Actualizar estado de conexión
    const updateConnectionStatus = () => {
      const connected = socket.connected;
      setIsConnected(connected);
    };

    // Actualizar estado inicial
    updateConnectionStatus();

    socket.on('connect', updateConnectionStatus);
    socket.on('disconnect', updateConnectionStatus);

    // Listeners específicos para este teléfono
    const qrEventName = `qr_${phoneNumber}`;
    const statusEventName = `whatsappStatus_${phoneNumber}`;
    const requestQrEventName = `requestNewQr_${phoneNumber}`;

    // Listener para QR
    const qrListener = (qr: string | null) => {
      // Siempre actualizar el estado del QR, incluso si está bloqueado
      updateState({
        qrCode: qr,
        isQrEmpty: !qr,
        error: null,
        errorType: null,
        isLoading: false,
      });
    };

    // Listener para estado
    const statusListener = (data: WhatsAppStatusData) => {
      console.log(`📊 Status received for ${phoneNumber}:`, data);
      
      if (data.error === 'QR_BLOCKED') {
        console.log(`🚫 QR blocked for ${phoneNumber}, clearing QR and showing error`);
        updateState({
          isReady: false,
          qrCode: null, // Forzar limpiar el QR
          isQrEmpty: true,
          error: data.message || 'QR bloqueado por exceso de intentos',
          errorType: data.error, // Usar data.error que contiene 'QR_BLOCKED'
          isBlocked: true,
          isLoading: false,
        });
      } else if (data.error === 'CONNECTION_FAILURE') {
        console.log(`🔄 Connection failure for ${phoneNumber}, waiting for auto-reconnect...`);
        updateState({
          isReady: false,
          qrCode: null,
          isQrEmpty: true,
          error: data.message || 'Error de conexión con WhatsApp. Reconectando automáticamente...',
          errorType: data.error, // Usar data.error que contiene 'CONNECTION_FAILURE'
          isBlocked: false, // No bloquear, permitir reintentos
          isLoading: false,
        });
      } else {
        // Lógica corregida: WhatsApp está listo solo si isReady es true Y no hay QR disponible
        const isActuallyReady = data.isReady && !data.qrCodeUrl;
        const isQrEmpty = !data.qrCodeUrl || data.qrCodeUrl === '';
        
        // Solo mostrar error si realmente hay un error, no cuando está esperando
        const shouldShowError = data.error && data.error !== 'QR_BLOCKED' && data.error !== 'CONNECTION_FAILURE' && data.error !== '';

        updateState({
          isReady: isActuallyReady,
          qrCode: data.qrCodeUrl,
          isQrEmpty: isQrEmpty,
          error: shouldShowError ? data.error : null,
          errorType: shouldShowError ? data.error : null,
          isBlocked: false,
          isLoading: false,
        });
      }
    };

    // Listener para solicitud de nuevo QR desde el backend
    const requestQrListener = (data: RequestNewQrData) => {
      console.log(`📡 Received requestNewQr event for ${phoneNumber}, action: ${data.action}`);
      
      if (data.action === 'reconnected') {
        updateState({
          isLoading: true,
          error: null,
          errorType: null,
          isBlocked: false,
          isQrEmpty: false,
        });
        setTimeout(() => {
          if (socket.connected) {
            socket.emit('getWhatsappStatus', { phoneNumber });
          }
        }, 1000);
      }
    };

    // Registrar listeners
    socket.on(qrEventName, qrListener);
    socket.on(statusEventName, statusListener);
    socket.on(requestQrEventName, requestQrListener);

    // Solicitar estado inicial
    if (socket.connected) {
      requestStatus();
    } else {
      socket.once('connect', requestStatus);
    }

    // Cleanup
    return () => {
      socket.off(qrEventName, qrListener);
      socket.off(statusEventName, statusListener);
      socket.off(requestQrEventName, requestQrListener);
      socket.off('connect', updateConnectionStatus);
      socket.off('disconnect', updateConnectionStatus);
      
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, [phoneNumber, state.isBlocked, updateState, requestStatus]);

  // Función para solicitar nuevo QR
  const requestNewQr = useCallback(async () => {
    updateState({ 
      isLoading: true,
      error: null,
      errorType: null,
      isBlocked: false, // Reset blocked state
      isQrEmpty: false,
    });

    try {
      const response = await fetch(buildApiUrl(BACKEND_CONFIG.ENDPOINTS.RECONNECT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      updateState({
        error: `Error al reconectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        isBlocked: true,
        isLoading: false,
      });
    }
  }, [phoneNumber, updateState, state.isBlocked]);

  return {
    state,
    requestNewQr,
    isConnected,
  };
};
