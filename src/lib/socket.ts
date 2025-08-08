import { io, Socket } from 'socket.io-client';
import { BACKEND_CONFIG } from './config';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  connect(url: string = BACKEND_CONFIG.SOCKET_URL): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 20000,
      forceNew: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
    this.socket.connect();
    
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      // Socket disconnected
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = new SocketManager();
