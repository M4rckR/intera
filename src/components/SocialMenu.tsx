'use client'
import { TbBrandWhatsappFilled } from "react-icons/tb";
import { OctagonX, BadgeCheck } from "lucide-react";
import { useStatusStore } from "@/store/status";
import { LoginQr } from "./LoginQrCode/LoginQr";

export const SocialMenu = () => {
  const connection = useStatusStore(state => state.connection);

  return (  
    <div className="max-w-7xl mx-auto px-4 my-6">
      <nav className="bg-in-gray-ligth py-4 px-4 rounded-xl grid grid-cols-1 md:grid-cols-2">
        <div>
          <p className="text-in-beige pb-2">Seleccione una red social</p>
          <TbBrandWhatsappFilled
            className={`text-emerald-800 font-semibold rounded-xl bg-in-beige w-12 h-12 border  p-1  ${
              connection?.isReady
                ? "cursor-pointer"
                : "text-emerald-800/50 cursor-not-allowed"
            }`}
          />
        </div>
        <div className="text-in-beige flex">
          {connection?.isReady ? (
            <div className="space-y-2 text-green-500 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <BadgeCheck />
                <p className="font-semibold">Conectado</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-red-500 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <OctagonX />
                <p className="font-semibold">No hay conexión</p>
              </div>

              <LoginQr />


            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
