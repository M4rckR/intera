'use client'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { useAuthStore } from "@/store/auth";
import { Switch } from "@/app/components/ui-me/Switch";
import { Button } from "@/app/components/ui/button";
import { MessageSquareReply, BellRing } from "lucide-react";

// Interfaz corregida basada en el formato del backend
interface Lead {
  id: string;
  phone: string;
  name: string;
  district: string;
  sede: string;
  date: string;
  time: string;
  procedures: Array<string>;
  isBotActive: boolean;
}

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles || {};
  const canManageBots = roles.isAdmin || roles.isAdminBot;
  const canSeeActions = roles.isAdmin || roles.isAdminBot || roles.isManager;
  console.log(leads);

  const handleToggleBot = async (leadId: string, newStatus: boolean) => {
    try {
      // Lógica para actualizar el estado del bot por HTTP POST
      await fetch('/api/leads/update-bot-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ id: leadId, is_bot_active: newStatus }),
      });
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

  if (!canManageBots && !canSeeActions) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Leads del día</h2>
        <div className="py-16">
          <h3 className="text-lg font-semibold text-red-600">No tienes permisos para ver los leads</h3>
          <p className="text-gray-500 mt-2">Contacta a un administrador si crees que esto es un error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Leads del día</h2>
      {leads.length > 0 ? (
        <Table>
          <TableCaption>Lista de leads del día</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Distrito</TableHead>
              <TableHead>Procedimiento</TableHead>
              {canManageBots && <TableHead>Bot activo</TableHead>}
              {canSeeActions && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.phone}</div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{lead.district}</span>
                </TableCell>
                <TableCell>
                  {/* Manejo seguro del array de procedimientos */}
                  {lead.procedures && Array.isArray(lead.procedures) 
                    ? lead.procedures.join(', ') 
                    : 'No especificado'
                  }
                </TableCell>
                {canManageBots && (
                  <TableCell>
                    <Switch
                      checked={lead.isBotActive}
                      onCheckedChange={(newStatus) => handleToggleBot(lead.id, newStatus)}
                    />
                  </TableCell>
                )}
                {canSeeActions && (
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleRecontact(lead.id)}>
                      <MessageSquareReply className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleReminder(lead.id)}>
                      <BellRing className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-gray-700">No hay leads para mostrar</h3>
          <p className="text-gray-500 mt-2">Cuando lleguen nuevos leads, los verás aquí.</p>
        </div>
      )}
    </div>
  );
}