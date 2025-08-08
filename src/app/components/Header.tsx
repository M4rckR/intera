import Image from 'next/image';
import { ArrowLeft, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { HeaderProps } from '@/types/components';

export function Header({ username, onLogout, showBackHome, onBackHome }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles || {};
  const isAdmin = roles.isAdmin;

  return (
    <header className="w-full flex items-center justify-between bg-white/90 shadow-lg px-8 py-5 rounded-2xl mb-10 border border-gray-100 mt-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-6">
        <Image src="/logos/logo-insalud.png" alt="Logo INSALUD" width={140} height={40} priority />
        {showBackHome && (
          <button
            onClick={onBackHome}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium shadow transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Home
          </button>
        )}
      </div>
      <div className="flex items-center gap-6">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium shadow transition"
          >
            <Settings className="w-5 h-5" />
            Panel Admin
          </Link>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-lg font-bold shadow">
            {username?.charAt(0).toUpperCase()}
          </div>
          <div className="text-base font-semibold text-gray-800">{username}</div>
        </div>
        <button
          onClick={onLogout}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium shadow transition"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
} 