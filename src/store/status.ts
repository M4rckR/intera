import { DataConnection } from "@/types";
import { create } from "zustand";
import { io, Socket } from "socket.io-client";


let socket: Socket | null = null;

type StatusState = {
  active: boolean;
  isLoading: boolean;
  setActive: (active: boolean) => void;
  connection: DataConnection | null;
  connectSocket: () => void;
};

export const useStatusStore = create<StatusState>()((set) => ({
  active: false,
  isLoading: true,
  connection: {
    isReady: false,
    qrCodeUrl: "",
  },
  setActive: (active: boolean) =>
    set({
      active,
    }),
  connectSocket: () => {
    if (socket) return; // Evita múltiples conexiones
    set({ isLoading: true });
    socket = io("https://backend-chat-bot-41yg.onrender.com/");
    socket.on("whatsapp-status", (data) => {
      set({ connection: data, isLoading: false });
    });
  },
}));
