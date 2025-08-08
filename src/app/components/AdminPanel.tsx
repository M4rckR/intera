'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { User, Settings } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AdminPanelProps } from '@/types/admin';
import { buildApiUrl, BACKEND_CONFIG } from '@/lib/config';

// Paleta de colores del logo
const COLOR_TURQUESA = '#00CFC3';
const COLOR_AZUL_OSCURO = '#00405A';

export function AdminPanel({ managers }: AdminPanelProps) {
  const [updatingManager, setUpdatingManager] = useState<number | null>(null);
  const [localManagers, setLocalManagers] = useState(managers);

  // Actualizar managers locales cuando cambien los props
  useEffect(() => {
    setLocalManagers(managers);
  }, [managers]);

  const handleToggleRecontact = async (managerId: number, newStatus: boolean) => {
    try {
      setUpdatingManager(managerId);
      console.log(`Actualizando recontact para manager ${managerId} a ${newStatus}`);
      
      const response = await fetch(buildApiUrl(BACKEND_CONFIG.ENDPOINTS.ADMIN.DESACTIVE_RECONTACT), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: managerId, active: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el recontacto');
      }

      const result = await response.json();
      
      if (result.success) {
        // Actualizar el estado local inmediatamente con el nuevo valor
        setLocalManagers(prev => prev.map(manager => 
          manager.id === managerId 
            ? { ...manager, recontact: result.newStatus }
            : manager
        ));
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error updating recontact:', error);
      // Aquí podrías mostrar un toast de error al usuario
    } finally {
      setUpdatingManager(null);
    }
  };

  const handleToggleReminder = async (managerId: number, newStatus: boolean) => {
    try {
      setUpdatingManager(managerId);
      console.log(`Actualizando reminder para manager ${managerId} a ${newStatus}`);
      
      const response = await fetch(buildApiUrl(BACKEND_CONFIG.ENDPOINTS.ADMIN.DESACTIVE_REMINDER), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: managerId, active: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el recordatorio');
      }

      const result = await response.json();
      
      if (result.success) {
        // Actualizar el estado local inmediatamente con el nuevo valor
        setLocalManagers(prev => prev.map(manager => 
          manager.id === managerId 
            ? { ...manager, reminder: result.newStatus }
            : manager
        ));
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error updating reminder:', error);
      // Aquí podrías mostrar un toast de error al usuario
    } finally {
      setUpdatingManager(null);
    }
  };

  return (
    <Tooltip.Provider>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_TURQUESA }}>
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: COLOR_AZUL_OSCURO }}>
              Panel de Administrador
            </h1>
          </div>
          <p className="text-gray-600">Gestiona los permisos de recontacto y recordatorios de los managers</p>
        </div>

        {/* Panel Principal */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="flex items-center justify-between">
              <span style={{ color: COLOR_AZUL_OSCURO }}>Gestión de Managers</span>
              <Badge variant="secondary" style={{ backgroundColor: COLOR_TURQUESA, color: 'white' }}>
                {localManagers.length} manager{localManagers.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {localManagers.length > 0 ? (
              <div className="space-y-4">
                {/* Headers de las columnas */}
                <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                  <div className="font-semibold text-lg" style={{ color: COLOR_AZUL_OSCURO }}>
                    NOMBRE DEL GESTOR
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-2" style={{ color: COLOR_AZUL_OSCURO }}>
                      RECONTACTO
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-2" style={{ color: COLOR_AZUL_OSCURO }}>
                      RECORDATORIO
                    </div>
                  </div>
                </div>

                {/* Lista de managers */}
                {localManagers.map((manager) => (
                  <div key={manager.id} className="grid grid-cols-3 gap-4 items-center py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors rounded-lg px-2">
                    {/* Información del Manager */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        <User className="w-5 h-5" style={{ color: COLOR_AZUL_OSCURO }} />
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>
                          {manager.user.name} {manager.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {manager.id}</div>
                      </div>
                    </div>

                    {/* Botón Recontacto */}
                    <div className="flex justify-center">
                      <Tooltip.Root delayDuration={200}>
                        <Tooltip.Trigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleRecontact(manager.id, !manager.recontact)}
                            disabled={updatingManager === manager.id}
                            className={`w-12 h-12 rounded-lg transition-all duration-200 ${
                              manager.recontact 
                                ? 'border-2' 
                                : 'border-2 border-gray-300'
                            }`}
                            style={{
                              backgroundColor: manager.recontact ? COLOR_TURQUESA : 'white',
                              borderColor: manager.recontact ? COLOR_TURQUESA : '#d1d5db',
                              color: manager.recontact ? 'white' : COLOR_AZUL_OSCURO
                            }}
                          >
                            {updatingManager === manager.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <span className="text-lg font-bold">
                                {manager.recontact ? '✓' : ''}
                              </span>
                            )}
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                          {manager.recontact ? 'Recontacto activo' : 'Recontacto inactivo'}
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </div>

                    {/* Botón Recordatorio */}
                    <div className="flex justify-center">
                      <Tooltip.Root delayDuration={200}>
                        <Tooltip.Trigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleReminder(manager.id, !manager.reminder)}
                            disabled={updatingManager === manager.id}
                            className={`w-12 h-12 rounded-lg transition-all duration-200 ${
                              manager.reminder 
                                ? 'border-2' 
                                : 'border-2 border-gray-300'
                            }`}
                            style={{
                              backgroundColor: manager.reminder ? COLOR_AZUL_OSCURO : 'white',
                              borderColor: manager.reminder ? COLOR_AZUL_OSCURO : '#d1d5db',
                              color: manager.reminder ? 'white' : COLOR_AZUL_OSCURO
                            }}
                          >
                            {updatingManager === manager.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <span className="text-lg font-bold">
                                {manager.reminder ? '✓' : ''}
                              </span>
                            )}
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                          {manager.reminder ? 'Recordatorio activo' : 'Recordatorio inactivo'}
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <User className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay managers disponibles</h3>
                <p className="text-gray-500">No se encontraron managers para mostrar en el panel.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Panel de administración de managers - Sistema Intera
          </p>
        </div>
      </div>
    </Tooltip.Provider>
  );
}