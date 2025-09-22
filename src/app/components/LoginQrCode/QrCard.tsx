import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { QrCardProps } from '@/types/components';

function formatPhoneNumber(phoneNumber: string) {
  if (phoneNumber.startsWith('51') && phoneNumber.length === 11) {
    return `+51 ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`;
  }
  return phoneNumber;
}

export const QrCard: React.FC<QrCardProps> = ({ phoneNumber, onGoToDashboard }) => {
  const { state, requestNewQr, isConnected } = useWhatsApp(phoneNumber);

  const getStatusColor = () => {
    if (state.errorType === 'CONNECTION_FAILURE') return 'yellow'; // Amarillo para reconexión
    if (state.error) return 'red';
    if (state.isReady) return 'green';
    if (state.isLoading) return 'yellow';
    if (state.qrCode && !state.isReady) return 'blue';
    if (state.isQrEmpty) return 'gray';
    return 'gray';
  };

  const getStatusText = () => {
    if (state.errorType === 'CONNECTION_FAILURE') return 'Reconectando...';
    if (state.error) return 'Error';
    if (state.isReady) return 'Conectado';
    if (state.isLoading) return 'Cargando...';
    if (state.qrCode && !state.isReady) return 'Escaneando...';
    if (state.isQrEmpty) return 'Esperando QR';
    return 'Esperando...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {formatPhoneNumber(phoneNumber)}
        </h3>
        <div className="flex items-center space-x-2">
          {/* Estado de conexión del socket */}
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} title={isConnected ? 'Socket conectado' : 'Socket desconectado'} />
          
          {/* Estado de WhatsApp */}
          <div className={`w-3 h-3 rounded-full bg-${getStatusColor()}-500`} 
               title={getStatusText()} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="text-center">
        {state.isLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {state.errorType === 'CONNECTION_FAILURE' && (
          <div className="h-48 flex flex-col items-center justify-center">
            <div className="text-yellow-500 mb-4">
              <svg className="w-12 h-12 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-yellow-600 text-sm mb-4">
              {state.error}
            </p>
            <div className="text-xs text-gray-500 mb-4">
              El sistema está intentando reconectar automáticamente
            </div>
            <button
              onClick={requestNewQr}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reintentar Manualmente
            </button>
          </div>
        )}

        {state.error && state.errorType !== 'CONNECTION_FAILURE' && (
          <div className="h-48 flex flex-col items-center justify-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-600 text-sm mb-4">{state.error}</p>
            {/* Solo mostrar botón para errores que requieren intervención manual */}
            {(state.errorType === 'QR_BLOCKED' || state.isBlocked) && (
              <button
                onClick={requestNewQr}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Solicitar Nuevo QR
              </button>
            )}
            {/* Para otros errores, mostrar mensaje informativo */}
            {state.errorType !== 'QR_BLOCKED' && !state.isBlocked && (
              <div className="text-xs text-gray-500 text-center">
                <p>El sistema intentará reconectar automáticamente</p>
                <p>Si el problema persiste, contacta al administrador</p>
              </div>
            )}
          </div>
        )}

        {state.isReady && !state.error && (
          <div className="h-48 flex flex-col items-center justify-center">
            <div className="text-green-500 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-600 font-medium mb-4">¡Conectado!</p>
            <button
              onClick={() => onGoToDashboard(phoneNumber)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        )}

        {!state.isReady && !state.error && !state.isLoading && state.qrCode && (
          <div className="h-48 flex flex-col items-center justify-center">
            <div className="mb-4">
              <QRCodeSVG value={state.qrCode} size={160} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Escanea el código QR con WhatsApp
            </p>
          </div>
        )}

        {!state.isReady && !state.error && !state.isLoading && state.isQrEmpty && (
          <div className="h-48 flex flex-col items-center justify-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">Esperando código QR...</p>
            <div className="text-xs text-gray-400">
              El sistema está generando el código QR automáticamente
            </div>
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Estado: {getStatusText()}</span>
          {state.lastUpdate && (
            <span>Actualizado: {state.lastUpdate.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}; 