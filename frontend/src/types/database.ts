export interface User {
  id: string;
  name: string;
  phone: string;
  address?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Provider {
  id: string;
  cuit_arca: string;
  business_name: string;
  category: string;
  subcategories: string[];
  latitude: number;
  longitude: number;
  coverage_radius_km: number;
  wallet_balance: number;
  is_active: boolean;
  is_verified: boolean;
  rating_avg: number;
  phone: string;
  created_at: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface ServiceRequest {
  id: string;
  client_id: string;
  provider_id: string | null;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: RequestStatus;
  lead_fee_charged: number;
  created_at: string;
  // Detalle opcional del cliente (solo desbloqueado si es accepted)
  client_name?: string;
  client_phone?: string;
}

export type TransactionType = 'credit_recharge' | 'lead_deduction';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'failed';

export interface Transaction {
  id: string;
  provider_id: string;
  amount: number;
  type: TransactionType;
  mp_payment_id: string | null;
  status: TransactionStatus;
  created_at: string;
}
