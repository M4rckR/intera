import { useStatusStore } from "@/store/status";
import { Lead } from "@/types";
import { useEffect } from "react";

export const LeadsList = () => {
  const leads = useStatusStore(state => state.leads);
  const updateBotStatus = useStatusStore(state => state.updateBotStatus);

  useEffect(() => {
    console.log('📋 Leads actualizados en el componente:', leads.length);
    leads.forEach((lead, index) => {
      console.log(`Lead ${index + 1}:`, {
        id: lead.id,
        phone: lead.phone,
        department: lead.conversationState?.patientInfo?.department,
        name: lead.conversationState?.patientInfo?.name,
        fullLead: lead
      });
    });
  }, [leads]);

  const handleBotStatusChange = (leadId: string, currentStatus: boolean) => {
    updateBotStatus(leadId, !currentStatus);
  };

  const getDepartment = (lead: Lead) => {
    const department = lead.conversationState?.patientInfo?.department;
    console.log(`🏥 Departamento para lead ${lead.id}:`, department);
    return department || 'No disponible';
  };

  const getDepartmentBadgeColor = (department: string) => {
    if (department === 'No disponible') return 'bg-gray-500';
    return 'bg-blue-600';
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Leads ({leads.length})</h2>
        <div className="text-sm text-gray-400">
          Total: {leads.length} leads
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead, index) => {
          const department = getDepartment(lead);
          return (
            <div
              key={lead.id}
              className="bg-in-gray-ligth rounded-lg p-4 shadow-lg border border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {lead.conversationState?.patientInfo?.name || 'No disponible'}
                    </h3>
                    <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">📱 Teléfono: {lead.phone}</p>
                    
                    {/* Departamento destacado */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">🏥 Departamento: </span>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full text-white ${getDepartmentBadgeColor(department)}`}
                      >
                        {/* Departamento: */}
                        {department}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm">
                      🏢 Sede: {lead.conversationState?.appointmentInfo?.location || 'No disponible'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      📅 Fecha: {lead.conversationState?.appointmentInfo?.date || 'No disponible'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      🕐 Hora de la cita: {lead.conversationState?.appointmentInfo?.time || 'No disponible'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <label className="relative inline-flex items-center cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={lead.botState?.is_bot_active || false}
                      onChange={() => handleBotStatusChange(lead.id, lead.botState?.is_bot_active || false)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-xs text-gray-300">
                    {lead.botState?.is_bot_active ? '🟢 Activo' : '🔴 Inactivo'}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-600 pt-2 text-xs text-gray-500">
                <p>Última actualización: {new Date(lead.updated_at).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {leads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📭</div>
          <p className="text-gray-400">No hay leads para mostrar</p>
        </div>
      )}
    </div>
  );
}; 