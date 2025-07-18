'use client'
import { useAuthStore } from '@/store/auth';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { io } from 'socket.io-client';
import { checkConnectionSchema } from '@/schemas/checkConnection';
import { useRouter } from 'next/navigation';
import { QrCard } from '@/app/components/LoginQrCode/QrCard';
import { Header } from '@/app/components/Header';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: boolean }>({});
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  // Sockets en tiempo real y petición inicial robusta
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const listeners: Array<() => void> = [];

    const registerListenersAndRequestStatus = () => {
      user.phones.forEach((phone) => {
        const eventName = `whatsappStatus_${phone.number}`;
        const statusListener = (data: any) => {
          console.log('FRONTEND: Recibido whatsappStatus para', phone.number, data);
          const parsed = checkConnectionSchema.safeParse(data);
          if (parsed.success) {
            setConnectionStatus((prev) => ({ ...prev, [phone.number]: parsed.data.isReady }));
            setQrCodes((prev) => ({ ...prev, [phone.number]: parsed.data.qrCodeUrl }));
          } else {
            setConnectionStatus((prev) => ({ ...prev, [phone.number]: false }));
            setQrCodes((prev) => ({ ...prev, [phone.number]: null }));
          }
          setLoading((prev) => ({ ...prev, [phone.number]: false }));
        };
        socket.on(eventName, statusListener);
        listeners.push(() => socket.off(eventName, statusListener));
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
  }, [user]);

  const handleRequestNewQr = async (phoneNumber: string) => {
    setLoading((prev) => ({ ...prev, [phoneNumber]: true }));
    await fetch(`/api/whatsapp/request-qr/${phoneNumber}`, { method: 'POST' });
    // El backend emitirá el evento whatsappStatus_{phoneNumber} cuando esté listo
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
            const isQrEmpty = qr === '' || qr === null;
            const isReady = connectionStatus[phone.number];
            return (
              <QrCard
                key={phone.number}
                phoneNumber={phone.number}
                isReady={isReady}
                qr={qr}
                isLoading={isLoading}
                isQrEmpty={isQrEmpty}
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