'use client'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { useAuthStore } from "@/store/auth";
import { Switch } from "@/app/components/ui-me/Switch";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareReply, BellRing, User} from "lucide-react";
import { cn } from "@/lib/utils";
import * as Tooltip from '@radix-ui/react-tooltip';

import { LeadsTableProps } from '@/types/components';
import { buildApiUrl, BACKEND_CONFIG } from '@/lib/config';

// Paleta de colores del logo
const COLOR_TURQUESA = '#00CFC3';
const COLOR_AZUL_OSCURO = '#00405A';

export function LeadsTable({ leads }: LeadsTableProps) {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles || {};
  const canManageBots = roles.isAdmin || roles.isAdminBot;
  const canSeeActions = roles.isAdmin || roles.isAdminBot || roles.isManager;

  const handleToggleBot = async (leadId: string, newStatus: boolean, leadPhone: string) => {
    try {
      // Obtener el número de teléfono del usuario actual (gestor)
      const userPhone = user?.phones?.[0]?.number;
      if (!userPhone) {
        throw new Error('No se encontró el número de teléfono del gestor');
      }

      const requestBody = { 
        userPhone: leadPhone, // Número de teléfono del cliente (lead.phone)
        phoneNumber: userPhone, // Número de teléfono del gestor
        is_bot_active: Boolean(newStatus) // Asegurar que sea boolean
      };
      console.log('🔧 Sending bot status update:', {
        url: buildApiUrl(BACKEND_CONFIG.ENDPOINTS.LEADS.UPDATE_BOT_STATUS),
        body: requestBody,
        phoneNumber: leadPhone,
        userPhone,
        is_bot_active: newStatus
      });

      // Lógica para actualizar el estado del bot por HTTP POST
      const response = await fetch(buildApiUrl(BACKEND_CONFIG.ENDPOINTS.LEADS.UPDATE_BOT_STATUS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestBody),
      }); 

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ Bot status updated successfully');
      // El backend emitirá 'leadsData' actualizado por socket automáticamente
    } catch (error) {
      console.error('Error updating bot status:', error);
    }
  };

  const handleRecontact = (leadId: string) => {
    console.log(`Solicitando recontacto para el lead: ${leadId}`);
  };

  const handleReminder = (leadId: string) => {
    console.log(`Creando recordatorio para el lead: ${leadId}`);
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDIENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EVALUATED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REQUESTED':
        return `bg-[${COLOR_TURQUESA}] text-white border-[${COLOR_TURQUESA}]`;
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: string) => {
    return `S/ ${price}`;
  };

  if (!canManageBots && !canSeeActions) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Leads del día</h2>
          <div className="py-8">
            <h3 className="text-lg font-medium text-red-600">No tienes permisos para ver los leads</h3>
            <p className="text-gray-500 mt-2">Contacta a un administrador si crees que esto es un error.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tooltip.Provider>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: COLOR_AZUL_OSCURO }}>Leads del día</h2>
            <Badge variant="secondary" style={{ backgroundColor: COLOR_TURQUESA, color: 'white', borderColor: COLOR_TURQUESA }}>
              {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        {/* Content */}
        <div className="p-6">
          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="sr-only">Lista de leads del día</TableCaption>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>Paciente</TableHead>
                    <TableHead className="font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>Información del Paciente</TableHead>
                    <TableHead className="font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>Procedimiento</TableHead>
                    {canManageBots && <TableHead className="font-semibold text-center" style={{ color: COLOR_AZUL_OSCURO }}>Bot activo</TableHead>}
                    {canSeeActions && <TableHead className="font-semibold text-center" style={{ color: COLOR_AZUL_OSCURO }}>Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="border-gray-100 hover:bg-blue-50/30 transition-colors">
                      {/* Información del Paciente */}
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold" style={{ color: COLOR_AZUL_OSCURO }}>{lead.name}</div>
                          <div className="text-sm text-gray-500">Cliente: {lead.phone}</div>
                        </div>
                      </TableCell>

                      {/* Distrito */}
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <Badge variant="outline" style={{ color: COLOR_AZUL_OSCURO, backgroundColor: '#e0f7fa', borderColor: '#b2ebf2' }} className="font-medium">
                            {lead.district}
                          </Badge>
                          {lead.sede && lead.sede !== "N/A" && (
                            <div className="text-sm text-gray-500">Sede: {lead.sede}</div>
                          )}
                          {/* Fecha y hora en la columna distrito para compactar */}
                          <div className="text-xs text-gray-400 space-y-0.5">
                            {lead.date && lead.date !== "N/A" && (
                              <div>📅 {lead.date}</div>
                            )}
                            {lead.time && lead.time !== "N/A" && (
                              <div>🕐 {lead.time}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Procedimientos */}
                      <TableCell className="py-4">
                        <div className="space-y-1.5">
                          {lead.procedures && Array.isArray(lead.procedures) && lead.procedures.length > 0 ? (
                            lead.procedures.map((procedure, index) => (
                              <div key={index} className="text-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm" style={{ color: COLOR_AZUL_OSCURO }}>
                                    {procedure.name}
                                  </span>
                                  {procedure.state && (
                                    <Tooltip.Root delayDuration={200}>
                                      <Tooltip.Trigger asChild>
                                        <span>
                                          <Badge className={cn("text-xs px-2 py-0.5 text-black font-medium cursor-help", getStateColor(procedure.state))}>
                                            {procedure.state.toUpperCase()}
                                          </Badge>
                                        </span>
                                      </Tooltip.Trigger>
                                      <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                                        Estado: {procedure.state.charAt(0).toUpperCase() + procedure.state.slice(1)}
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  )}
                                </div>
                                {procedure.precio && (
                                  <div className="text-sm font-semibold mt-0.5 flex items-center gap-1" style={{ color: COLOR_TURQUESA }}>
                                    <span>💵</span> {formatPrice(procedure.precio)}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">[object Object]</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Bot Activo */}
                      {canManageBots && (
                        <TableCell className="py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <Tooltip.Root delayDuration={200}>
                              <Tooltip.Trigger asChild>
                                <span>
                                  <Switch
                                    checked={lead.isBotActive}
                                    onCheckedChange={(newStatus) => handleToggleBot(lead.id, newStatus, lead.phone)}
                                    className={cn(
                                      "w-12 h-7 border-2 transition-all duration-200",
                                      lead.isBotActive ? '' : ''
                                    )}
                                    style={{
                                      backgroundColor: lead.isBotActive ? COLOR_TURQUESA : '#e5e7eb',
                                      borderColor: COLOR_AZUL_OSCURO
                                    }}
                                  />
                                </span>
                              </Tooltip.Trigger>
                              <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                                {lead.isBotActive ? 'Bot activo: El bot está gestionando este lead.' : 'Bot inactivo: El bot no está gestionando este lead.'}
                              </Tooltip.Content>
                            </Tooltip.Root>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-semibold",
                              lead.isBotActive 
                                ? '' 
                                : "bg-gray-100 text-gray-600"
                            )} style={lead.isBotActive ? { backgroundColor: COLOR_TURQUESA, color: 'white' } : {}}>
                              {lead.isBotActive ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </TableCell>
                      )}

                      {/* Acciones */}
                      {canSeeActions && (
                        <TableCell className="py-4">
                          <div className="flex gap-2">
                            <Tooltip.Root delayDuration={200}>
                              <Tooltip.Trigger asChild>
                                <span>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleRecontact(lead.id)}
                                    className="h-9 w-9 p-0"
                                    style={{ borderColor: COLOR_TURQUESA }}
                                    title="Recontactar"
                                  >
                                    <MessageSquareReply className="w-5 h-5" style={{ color: COLOR_TURQUESA }} />
                                  </Button>
                                </span>
                              </Tooltip.Trigger>
                              <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                                Recontactar: Volver a contactar al paciente
                              </Tooltip.Content>
                            </Tooltip.Root>
                            <Tooltip.Root delayDuration={200}>
                              <Tooltip.Trigger asChild>
                                <span>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleReminder(lead.id)}
                                    className="h-9 w-9 p-0"
                                    style={{ borderColor: COLOR_AZUL_OSCURO }}
                                    title="Recordatorio"
                                  >
                                    <BellRing className="w-5 h-5" style={{ color: COLOR_AZUL_OSCURO }} />
                                  </Button>
                                </span>
                              </Tooltip.Trigger>
                              <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
                                Recordatorio: Crear un recordatorio para este lead
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <User className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No hay leads para mostrar</h3>
              <p className="text-gray-500 mt-1">Cuando lleguen nuevos leads, los verás aquí.</p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/30">
          <p className="text-sm text-gray-500 text-center">Lista de leads del día</p>
        </div>
      </div>
    </Tooltip.Provider>
  );
}