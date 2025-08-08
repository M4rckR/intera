'use client'
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { AdminPanel } from '@/app/components/AdminPanel';
import { Header } from '@/app/components/Header';
import { Manager } from '@/types/admin';
import { buildApiUrl, BACKEND_CONFIG } from '@/lib/config';

export default function AdminPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // Verificar si el usuario es admin
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const roles = user.roles || {};
    if (!roles.isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Cargar managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl(BACKEND_CONFIG.ENDPOINTS.ADMIN.GET_MANAGERS), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los managers');
        }

        const data = await response.json();
        setManagers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (user?.roles?.isAdmin) {
      fetchManagers();
    }
  }, [user]);

  if (!user?.roles?.isAdmin) {
    return null; // Se redirigirá automáticamente
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          username={user?.username || ''}
          onLogout={logout}
          showBackHome={true}
          onBackHome={() => router.push('/home')}
        />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando panel de administrador...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          username={user?.username || ''}
          onLogout={logout}
          showBackHome={true}
          onBackHome={() => router.push('/home')}
        />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-2">Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        username={user?.username || ''}
        onLogout={logout}
        showBackHome={true}
        onBackHome={() => router.push('/home')}
      />
      <AdminPanel managers={managers} />
    </div>
  );
}