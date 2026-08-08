'use client';

import { Wallet, CheckCircle, AlertTriangle } from 'lucide-react';

interface WalletBalanceProps {
  balance: number;
  isActive: boolean;
  isVerified: boolean;
  businessName: string;
}

export default function WalletBalance({ balance, isActive, isVerified, businessName }: WalletBalanceProps) {
  // Formateador de moneda en Pesos Argentinos (ARS)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl">
      {/* Círculos de fondo decorativos */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -ml-10 -mb-10"></div>

      <div className="relative flex flex-col justify-between h-full space-y-8">
        {/* Cabecera de la Tarjeta */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Billetera Prestador
            </p>
            <h4 className="text-lg font-bold text-slate-100 mt-0.5 truncate max-w-[200px]">
              {businessName || 'Cargando...'}
            </h4>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Wallet className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Saldo Principal */}
        <div>
          <p className="text-xs font-medium text-slate-400">Saldo Prepago Disponible</p>
          <div className="text-3xl font-extrabold mt-1 tracking-tight text-white">
            {formatCurrency(balance)}
          </div>
        </div>

        {/* Estado Operativo */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-sm">
          <div className="flex items-center space-x-1.5">
            {isVerified ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified ARCA
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Sin Verificar
              </span>
            )}
          </div>

          <div className="flex items-center">
            {isActive && balance >= 10000 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                Activo / Recibe Leads
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/20">
                Pausado (Cargar Saldo)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
