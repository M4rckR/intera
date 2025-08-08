'use client'
import { useAuthStore } from '@/store/auth';
import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { checkConnectionSchema } from '@/schemas/checkConnection';
import { useRouter } from 'next/navigation';
import { QrCard } from '@/app/components/LoginQrCode/QrCard';
import { Header } from '@/app/components/Header';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://54.172.153.21:4000');

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: boolean }>({});
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [qrEmptyStates, setQrEmptyStates] = useState<{ [key: string]: boolean }>({});
  const [blockedPhones, setBlockedPhones] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  
  // Usar useRef para evitar dependencias circulares
  const blockedPhonesRef = useRef<{ [key: string]: boolean }>({});
  blockedPhonesRef.current = blockedPhones;

  // Función para actualizar estados de manera reactiva
  const updatePhoneState = useCallback((phoneNumber: string, updates: {
    qr?: string | null;
    isReady?: boolean;
    error?: string | null;
    isQrEmpty?: boolean;
    isLoading?: boolean;
    isBlocked?: boolean;
  }) => {
    if (updates.qr !== undefined) {
      setQrCodes(prev => ({ ...prev, [phoneNumber]: updates.qr! }));
    }
    if (updates.isReady !== undefined) {
      setConnectionStatus(prev => ({ ...prev, [phoneNumber]: updates.isReady! }));
    }
    if (updates.error !== undefined) {
      setErrors(prev => ({ ...prev, [phoneNumber]: updates.error! }));
    }
    if (updates.isQrEmpty !== undefined) {
      setQrEmptyStates(prev => ({ ...prev, [phoneNumber]: updates.isQrEmpty! }));
    }
    if (updates.isLoading !== undefined) {
      setLoading(prev => ({ ...prev, [phoneNumber]: updates.isLoading! }));
    }
    if (updates.isBlocked !== undefined) {
      setBlockedPhones(prev => ({ ...prev, [phoneNumber]: updates.isBlocked! }));
      blockedPhonesRef.current = { ...blockedPhonesRef.current, [phoneNumber]: updates.isBlocked! };
    }
  }, []);

  // Sockets en tiempo real y petición inicial robusta
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const listeners: Array<() => void> = [];

    const registerListenersAndRequestStatus = () => {
      user.phones.forEach((phone) => {
        const phoneNumber = phone.number;
        
        // 1. Escuchar evento QR (puede ser string o null)
        const qrEventName = `qr_${phoneNumber}`;
        const qrListener = (qr: string | null) => {
          if (!isMounted) return;
          
          // Solo actualizar QR si el teléfono no está bloqueado
          if (!blockedPhonesRef.current[phoneNumber]) {
            updatePhoneState(phoneNumber, {
              qr: qr,
              isQrEmpty: !qr
            });
          }
        };
        socket.on(qrEventName, qrListener);
        listeners.push(() => socket.off(qrEventName, qrListener));

        // 2. Escuchar evento de estado
        const statusEventName = `whatsappStatus_${phoneNumber}`;
        const statusListener = (data: unknown) => {
          if (!isMounted) return;
          
          const parsed = checkConnectionSchema.safeParse(data);
          if (parsed.success) {
            // Manejar el estado de error
            if (parsed.data.error) {
              updatePhoneState(phoneNumber, {
                isReady: parsed.data.isReady,
                error: parsed.data.message || 'Error desconocido',
                isQrEmpty: true,
                qr: null,
                isBlocked: true
              });
            } else {
              // Solo limpiar error si el teléfono no está bloqueado
              if (!blockedPhonesRef.current[phoneNumber]) {
                const isQrEmpty = parsed.data.qrCodeUrl === null || parsed.data.qrCodeUrl === '';
                updatePhoneState(phoneNumber, {
                  isReady: parsed.data.isReady,
                  error: null,
                  isQrEmpty: isQrEmpty,
                  qr: parsed.data.qrCodeUrl
                });
              }
            }
          } else {
            updatePhoneState(phoneNumber, {
              isReady: false,
              qr: null,
              error: null,
              isQrEmpty: true
            });
          }
          updatePhoneState(phoneNumber, { isLoading: false });
        };
        socket.on(statusEventName, statusListener);
        listeners.push(() => socket.off(statusEventName, statusListener));

        // 3. NUEVO: Escuchar evento para solicitar nuevo QR (después de reconexión)
        const requestQrEventName = `requestNewQr_${phoneNumber}`;
        const requestQrListener = () => {
          if (!isMounted) return;
          
          // Solicitar nuevo QR automáticamente
          socket.emit('getWhatsappStatus', { phoneNumber: phoneNumber });
          
          // Actualizar estado para mostrar loading
          updatePhoneState(phoneNumber, {
            isLoading: true,
            error: null,
            isQrEmpty: false,
            isBlocked: false
          });
        };
        socket.on(requestQrEventName, requestQrListener);
        listeners.push(() => socket.off(requestQrEventName, requestQrListener));
      });
      
      // Emitir petición solo después de registrar listeners y cuando el socket esté conectado
      if (socket.connected) {
        user.phones.forEach((phone) => {
          socket.emit('getWhatsappStatus', { phoneNumber: phone.number });
        });
      } else {
        // Si el socket aún no está conectado, espera al evento 'connect'
        const onConnect = () => {
          if (!isMounted) return;
          user.phones.forEach((phone) => {
            socket.emit('getWhatsappStatus', { phoneNumber: phone.number });
          });
          socket.off('connect', onConnect);
        };
        socket.on('connect', onConnect);
        listeners.push(() => socket.off('connect', onConnect));
      }
    };

    registerListenersAndRequestStatus();

    return () => {
      isMounted = false;
      listeners.forEach((off) => off());
    };
  }, [user, updatePhoneState]);

  const handleRequestNewQr = async (phoneNumber: string) => {
    updatePhoneState(phoneNumber, { 
      isLoading: true,
      error: null,
      isQrEmpty: false,
      isBlocked: false
    });
    
    try {
      // Usar el endpoint correcto que SÍ está implementado en el backend
      const response = await fetch('http://54.172.153.21:4000/api/botstatus/reconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber })
      });

      if (response.ok) {
        // El backend se encargará de emitir los nuevos eventos de QR
        // No necesitamos hacer nada más aquí, los eventos de socket actualizarán el estado
      } else {
        // Manejar diferentes tipos de errores HTTP
        let errorMessage = 'Error al reconectar';
        
        if (response.status === 404) {
          errorMessage = 'Endpoint no encontrado. Verificar configuración del servidor.';
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor.';
        } else {
          try {
            const data = await response.json();
            errorMessage = data.error || `Error ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
        }
        
        updatePhoneState(phoneNumber, {
          error: errorMessage,
          isBlocked: true,
          isLoading: false
        });
      }
    } catch (error) {
      // Manejar errores de red
      let errorMessage = 'Error de conexión al reconectar';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verificar que el backend esté ejecutándose.';
      }
      
      updatePhoneState(phoneNumber, {
        error: errorMessage,
        isBlocked: true,
        isLoading: false
      });
    }
  };

  const handleGoToDashboard = (phoneNumber: string) => {
    router.push(`/dashboard/${phoneNumber}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center py-8 px-2">
      {/* Header global */}
      <Header
        username={user?.username || ''}
        onLogout={logout}
        showBackHome={false}
      />
      {/* QRs de los teléfonos */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Teléfonos asociados</h2>
        <p className="mb-8 text-gray-500">Escanea el código QR de cada número para conectar tu cuenta de WhatsApp.</p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {user?.phones.map((phone) => {
            const qr = qrCodes[phone.number];
            const isLoading = loading[phone.number];
            const isQrEmpty = qrEmptyStates[phone.number] || qr === null || qr === '';
            const isReady = connectionStatus[phone.number];
            const error = errors[phone.number];
            
            return (
              <QrCard
                key={phone.number}
                phoneNumber={phone.number}
                isReady={isReady}
                qr={qr}
                isLoading={isLoading}
                isQrEmpty={isQrEmpty}
                error={error}
                onRequestNewQr={handleRequestNewQr}
                onGoToDashboard={handleGoToDashboard}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}