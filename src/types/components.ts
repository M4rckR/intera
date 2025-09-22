// Tipos para componentes de leads
export type Procedure = {
  name: string;
  precio: string;
  state: string;
}

export type LeadTable = {
  id: string;
  clientPhone: string;
  phone: string;
  name: string;
  district: string;
  sede: string;
  date: string;
  time: string;
  procedures: Procedure[];
  isBotActive: boolean;
}

export type LeadsTableProps = {
  leads: LeadTable[];
}

// Tipos para componentes de Header
export interface HeaderProps {
  username: string;
  onLogout: () => void;
  showBackHome?: boolean;
  onBackHome?: () => void;
}

// Tipos para componentes de QR
export interface QrCardProps {
  phoneNumber: string;
  onGoToDashboard: (phoneNumber: string) => void;
} 