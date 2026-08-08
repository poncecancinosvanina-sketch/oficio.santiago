'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import WalletBalance from '@/components/WalletBalance';
import { 
  CreditCard, 
  History, 
  MapPin, 
  MessageSquare, 
  User, 
  Briefcase, 
  Check, 
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit_recharge' | 'lead_deduction';
  mp_payment_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  created_at: string;
}

interface AvailableLead {
  id: string;
  category: string;
  description: string;
  distance_km: number;
  lead_fee_charged: number;
  created_at: string;
}

interface UnlockedContact {
  id: string;
  name: string;
  phone: string;
}

export default function BilleteraDashboard() {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState<number | null>(null);
  const [acceptingLeadId, setAcceptingLeadId] = useState<string | null>(null);
  
  // Database States
  const [provider, setProvider] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [availableLeads, setAvailableLeads] = useState<AvailableLead[]>([]);
  const [unlockedContacts, setUnlockedContacts] = useState<Record<string, UnlockedContact>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buscar session en localStorage (alta) o usar una por defecto si está testeando vacía
    const savedId = localStorage.getItem('provider_id');
    if (savedId) {
      setProviderId(savedId);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (providerId) {
      fetchDashboardData();
    }
  }, [providerId]);

  const fetchDashboardData = async () => {
    if (!providerId) return;
    setError(null);
    try {
      const supabase = createClient();

      // 1. Obtener perfil del prestador
      const { data: provData, error: provError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (provError) throw provError;
      setProvider(provData);

      // 2. Obtener historial de transacciones
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (txError) throw txError;
      setTransactions(txData || []);

      // 3. Obtener leads disponibles cercanos usando RPC
      const { data: leadsData, error: leadsError } = await supabase.rpc('get_available_leads', {
        p_provider_id: providerId
      });

      if (leadsError) throw leadsError;
      setAvailableLeads(leadsData || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Solicitar preferencia de pago a Mercado Pago y redireccionar
  const handleRecharge = async (amount: number) => {
    if (!providerId) return;
    setRecharging(amount);
    setError(null);

    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, amount }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo iniciar el pago.');

      // Redireccionar al checkout de Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión con Mercado Pago.');
      setRecharging(null);
    }
  };

  // Aceptar un Lead de cliente (compra de contacto directo)
  const handleAcceptLead = async (leadId: string) => {
    if (!providerId) return;
    setAcceptingLeadId(leadId);
    setError(null);

    try {
      const response = await fetch('/api/leads/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, providerId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo aceptar el lead.');
      }

      // Guardar el contacto desbloqueado en el estado
      setUnlockedContacts(prev => ({
        ...prev,
        [leadId]: {
          id: leadId,
          name: data.client.name,
          phone: data.client.phone
        }
      }));

      // Actualizar saldos e historial de inmediato
      await fetchDashboardData();

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setAcceptingLeadId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Cargando panel de control...</p>
      </div>
    );
  }

  if (!providerId) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl space-y-6">
          <div className="inline-flex p-4 bg-amber-50 rounded-full text-amber-500 border border-amber-100">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Sesión No Detectada</h2>
          <p className="text-slate-500 text-sm">
            Para ver tu billetera, primero debés registrar tu perfil de prestador de servicios en el sistema.
          </p>
          <a
            href="/registro-prestador"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow"
          >
            Registrarme Ahora
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Cabecera Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Billetera</h1>
          <p className="text-slate-500 text-sm">Administrá tu saldo y adquirí contactos de trabajo en tu zona.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm shadow-sm transition active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sincronizar Panel</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-semibold flex items-center space-x-2 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Billetera e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tarjeta de Saldo y Recargas Rápidas */}
        <div className="space-y-6">
          <WalletBalance
            balance={provider?.wallet_balance || 0}
            isActive={provider?.is_active || false}
            isVerified={provider?.is_verified || false}
            businessName={provider?.business_name || ''}
          />

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>Cargar Crédito Virtual</span>
            </h3>
            <p className="text-xs text-slate-500">
              Cada lead tiene un costo fijo de **$10.000**. Recargá saldo de manera instantánea mediante Mercado Pago:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[10000, 20000, 50000].map((amount) => (
                <button
                  key={amount}
                  disabled={recharging !== null}
                  onClick={() => handleRecharge(amount)}
                  className="py-3 px-1 border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded-xl font-extrabold text-xs transition active:scale-95 flex flex-col items-center justify-center space-y-1"
                >
                  {recharging === amount ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <>
                      <span>${amount.toLocaleString('es-AR')}</span>
                      <span className="text-[9px] font-normal text-blue-500">Recargar</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sección de Leads Disponibles (Central) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Leads Disponibles */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              <span>Trabajos Solicitados en tu Radio ({availableLeads.length})</span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                Especialidad: {provider?.category}
              </span>
            </h3>

            {availableLeads.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold">No hay solicitudes pendientes en tu zona en este momento.</p>
                <p className="text-xs text-slate-400">Verificá que tengas un radio de cobertura adecuado.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {availableLeads.map((lead) => {
                  const contact = unlockedContacts[lead.id];
                  
                  return (
                    <div 
                      key={lead.id} 
                      className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-grow max-w-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {lead.category}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5" /> A {lead.distance_km.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          "{lead.description}"
                        </p>
                        <p className="text-xs text-slate-400">
                          Publicado el: {new Date(lead.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex sm:flex-col items-end gap-2 justify-between sm:justify-start">
                        <span className="text-xs font-bold text-slate-500">
                          Costo: <strong className="text-slate-800">${lead.lead_fee_charged.toLocaleString('es-AR')}</strong>
                        </span>

                        {contact ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs space-y-1.5 w-full">
                            <div className="flex items-center font-bold text-emerald-800">
                              <User className="w-3.5 h-3.5 mr-1" />
                              <span>{contact.name}</span>
                            </div>
                            <a
                              href={`https://wa.me/549${contact.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center text-blue-600 font-bold hover:underline"
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1" />
                              <span>Contactar (WhatsApp)</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          </div>
                        ) : (
                          <button
                            disabled={acceptingLeadId !== null}
                            onClick={() => handleAcceptLead(lead.id)}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition active:scale-95"
                          >
                            {acceptingLeadId === lead.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Aceptando...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Aceptar Lead</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historial de Transacciones */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <History className="w-5 h-5 text-slate-500" />
              <span>Historial de Transacciones</span>
            </h3>

            {transactions.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">Aún no registras movimientos en tu billetera virtual.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-600 font-bold">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">ID Pago</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {tx.type === 'credit_recharge' ? 'Carga de Crédito' : 'Deducción de Lead'}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{tx.mp_payment_id || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tx.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : tx.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
