'use client'
import { useAuthStore } from '@/store/auth';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!user) return;
    user.phones.forEach((phone) => {
      setLoading((prev) => ({ ...prev, [phone.number]: true }));
      socket.emit('requestQrCode', { instanceId: phone.number });
    });
  }, [user]);

  useEffect(() => {
    socket.on('qrCode', ({ qr, phoneNumber }) => {
      setQrCodes((prev) => ({ ...prev, [phoneNumber]: qr }));
      setLoading((prev) => ({ ...prev, [phoneNumber]: false }));
    });
    return () => {
      socket.off('qrCode');
    };
  }, []);

  const handleRequestNewQr = (phoneNumber: string) => {
    setLoading((prev) => ({ ...prev, [phoneNumber]: true }));
    socket.emit('requestQrCode', { instanceId: phoneNumber });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center py-8 px-2">
      {/* Header con datos del usuario y logout */}
      <header className="w-full max-w-5xl flex items-center justify-between bg-white/90 shadow-lg px-8 py-5 rounded-2xl mb-10 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xl font-bold shadow">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">Bienvenido, {user?.username}</div>
            <div className="text-sm text-gray-500">Panel de gestión de WhatsApp</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium shadow transition"
        >
          Cerrar sesión
        </button>
      </header>
      {/* QRs de los teléfonos */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Teléfonos asociados</h2>
        <p className="mb-8 text-gray-500">Escanea el código QR de cada número para conectar tu cuenta de WhatsApp.</p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {user?.phones.map((phone) => {
            const qr = qrCodes[phone.number];
            const isLoading = loading[phone.number];
            const isQrEmpty = qr === '' || qr === null;
            return (
              <div
                key={phone.number}
                className="p-6 border border-gray-100 rounded-2xl shadow-lg bg-white/80 flex flex-col items-center hover:shadow-2xl transition group"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Número</span>
                  <span className="font-mono text-base text-gray-700">{phone.number}</span>
                </div>
                {/* Estado del QR */}
                {qr && !isQrEmpty ? (
                  <div className="flex flex-col items-center">
                    <QRCodeSVG value={qr} size={200} className="rounded-lg shadow-md group-hover:scale-105 transition" />
                    <span className="mt-3 text-green-600 font-semibold">¡Listo para escanear!</span>
                  </div>
                ) : isLoading && !isQrEmpty ? (
                  <div className="flex flex-col items-center justify-center h-[200px] w-[200px]">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-blue-500 font-medium">Solicitando QR...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] w-[200px]">
                    <Image src="/qr-default.png" alt="QR no disponible" width={200} height={200} className="mb-2 rounded-lg opacity-60" />
                    <span className="text-gray-400 font-medium mb-2">QR no disponible</span>
                    <button
                      onClick={() => handleRequestNewQr(phone.number)}
                      className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
                    >
                      Solicitar nuevo QR
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}