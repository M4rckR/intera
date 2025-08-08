import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { QrCardProps } from '@/types/components';

function formatPhoneNumber(phoneNumber: string) {
  if (phoneNumber.startsWith('51') && phoneNumber.length === 11) {
    return `+51 ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`;
  }
  return phoneNumber;
}

export function QrCard({
  phoneNumber,
  isReady,
  qr,
  isLoading,
  isQrEmpty,
  error,
  onRequestNewQr,
  onGoToDashboard,
}: QrCardProps) {
  return (
    <div className="p-8 border border-gray-100 rounded-2xl shadow-lg bg-white flex flex-col items-center hover:shadow-2xl transition group gap-6 w-full max-w-xs mx-auto">
      {/* Badge de número */}
      <div className="mb-4 flex flex-col gap-2 w-full">
        <div className="text-gray-600 text-sm font-medium">Número de WhatsApp</div>
        <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200">
          <span className="text-lg font-bold tracking-wide">{formatPhoneNumber(phoneNumber)}</span>
          <div className="h-6 w-6">
            <CheckCircle className="w-full h-full" />
          </div>
        </div>
      </div>
      {/* Estado de conexión visual */}
      {isReady ? (
        <>
          <div className="flex flex-col items-center justify-center w-full mb-4">
            <span className="text-xl font-bold text-green-700 mb-1">WhatsApp Conectado</span>
            <span className="text-gray-500 text-base">Sesión activa y lista para usar</span>
          </div>
        </>
      ) : (
        <div className="mb-4 flex flex-col items-center w-full">
          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 inline-block"></span>
            No conectado
          </span>
        </div>
      )}
      {/* Render según estado - ORDEN DE PRIORIDAD CORREGIDO */}
      {!isReady && (
        // 1. ERROR (máxima prioridad) - QR Bloqueado
        error ? (
          // Estado de error (QR bloqueado)
          <div className="flex flex-col items-center justify-center h-[200px] w-[200px]">
            <div className="flex flex-col items-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-500 mb-3" />
              <span className="text-red-600 font-semibold text-center mb-2">QR Bloqueado</span>
              <span className="text-gray-500 text-sm text-center mb-4">{error}</span>
            </div>
            <button
              onClick={() => onRequestNewQr(phoneNumber)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium shadow transition ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {isLoading ? 'Reconectando...' : 'Reintentar'}
            </button>
          </div>
        ) : 
        // 2. CARGANDO
        isLoading ? (
          <div className="flex flex-col items-center justify-center h-[200px] w-[200px]">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-blue-500 font-medium">Solicitando QR...</span>
          </div>
        ) : 
        // 3. QR DISPONIBLE
        qr && !isQrEmpty ? (
          <div className="flex flex-col items-center">
            <QRCodeSVG value={qr} size={200} className="rounded-lg shadow-md group-hover:scale-105 transition" />
            <span className="mt-3 text-green-600 font-semibold">¡Listo para escanear!</span>
          </div>
        ) : 
        // 4. QR NO DISPONIBLE (estado por defecto)
        (
          <div className="flex flex-col items-center justify-center h-[200px] w-[200px]">
            <Image src="/img/qr-default.jpg" alt="QR no disponible" width={200} height={200} className="mb-2 rounded-lg opacity-60" />
            <span className="text-gray-400 font-medium mb-2">QR no disponible</span>
            <button
              onClick={() => onRequestNewQr(phoneNumber)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
            >
              Solicitar nuevo QR
            </button>
          </div>
        )
      )}
      {/* Botón de navegación al dashboard si está conectado */}
      {isReady && onGoToDashboard && (
        <button
          onClick={() => onGoToDashboard(phoneNumber)}
          className="w-full px-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow transition flex items-center justify-center gap-2"
        >
          Acceder al Dashboard
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L21 12m0 0l-3.75 5.25M21 12H3" />
          </svg>
        </button>
      )}
    </div>
  );
} 