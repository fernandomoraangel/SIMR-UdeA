export interface SoporteResponse {
  _id: string;
  message: string;
  user: { _id: string; firstName: string; lastName: string; fullName: string; username: string };
  isStaff: boolean;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'abierto' | 'pendiente' | 'resuelto' | 'cerrado' | 'vencido';
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  createdBy: { _id: string; firstName: string; lastName: string; fullName: string; username: string; email?: string };
  assignedTo?: { _id: string; firstName: string; lastName: string; fullName: string; username: string } | null;
  responses: SoporteResponse[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  success: boolean;
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}

export const STATUS_LABELS: Record<string, string> = {
  abierto: 'Abierto',
  pendiente: 'Pendiente',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
  vencido: 'Vencido',
};

export const PRIORITY_LABELS: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};
