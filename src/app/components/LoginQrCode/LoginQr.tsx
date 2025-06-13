'use client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "../ui/alert-dialog";

import { useStatusStore } from "@/store/status";
import { useEffect } from "react";
import {QRCodeSVG} from 'qrcode.react';

export const LoginQr = () => {
const connectSocket = useStatusStore(state => state.connectSocket);
  const connection = useStatusStore(state => state.connection);

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <AlertDialog>
    <AlertDialogTrigger className="px-12 bg-white text-in-gray cursor-pointer hover:bg-in-beige hover:text-in-gray rounded-lg font-semibold border border-red-300 shadow transition">
      Conectar
    </AlertDialogTrigger>
    <AlertDialogContent className="bg-white rounded-xl p-6">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-lg font-bold text-in-gray mb-2">
          Escanea el código QR para conectar
        </AlertDialogTitle>
        <AlertDialogDescription className="text-in-gray text-base mb-4">
          Usa tu app de WhatsApp para escanear el código y conectar tu cuenta.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="flex flex-col items-center justify-center min-h-[180px]">
        {connection?.qrCodeUrl ? (
          <>
          <QRCodeSVG className="w-[200px] h-[200px]" value={String(connection.qrCodeUrl)} />
          {/* <p>{connection.qrCodeUrl}</p> */}
          {/* <p className="text-in-gray text-sm mt-2">Escanea el código QR para conectar</p> */}
          </>  
        ) : (
          <span className="text-gray-500 text-center">Esperando código QR...</span>
        )}
      </div>
      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel className="bg-gray-200 text-in-gray rounded px-4 py-2 font-medium hover:bg-gray-300">Cancelar</AlertDialogCancel>
        <AlertDialogAction className="bg-emerald-600 text-white rounded px-4 py-2 font-medium hover:bg-emerald-700">Listo</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  )
}
