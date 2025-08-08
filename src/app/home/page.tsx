'use client'
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCard } from '@/app/components/LoginQrCode/QrCard';
import { Header } from '@/app/components/Header';
import { socketManager } from '@/lib/socket';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // Conectar socket cuando se carga la página
    socketManager.connect();
  }, [user, router]);

  const handleGoToDashboard = (phoneNumber: string) => {
    router.push(`/dashboard/${phoneNumber}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center py-8 px-2">
      <Header
        username={user.username || ''}
        onLogout={logout}
        showBackHome={false}
      />
      
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Teléfonos asociados</h2>
        <p className="mb-8 text-gray-500">
          Escanea el código QR de cada número para conectar tu cuenta de WhatsApp.
        </p>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {user.phones.map((phone) => (
            <QrCard
              key={phone.number}
              phoneNumber={phone.number}
              onGoToDashboard={handleGoToDashboard}
            />
          ))}
        </div>
      </div>
    </div>
  );
}