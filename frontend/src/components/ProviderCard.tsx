'use client';

import { Star, ShieldCheck, MapPin, BadgePercent } from 'lucide-react';
import { Provider } from '@/types/database';

interface ProviderCardProps {
  provider: Provider;
  distanceKm?: number;
  onSelect?: () => void;
}

export default function ProviderCard({ provider, distanceKm, onSelect }: ProviderCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Badge de Verificación y Estado */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {provider.is_verified && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verificado ARCA
          </span>
        )}
      </div>

      <div>
        {/* Categoría y Nombre */}
        <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
          {provider.category}
        </span>
        <h3 className="mt-1 text-lg font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
          {provider.business_name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center space-x-1">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-slate-700">{provider.rating_avg.toFixed(1)}</span>
          <span className="text-xs text-slate-400">(Calificación promedio)</span>
        </div>

        {/* Subcategorías */}
        {provider.subcategories && provider.subcategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {provider.subcategories.map((sub, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* Detalles Geográficos */}
        <div className="mt-4 pt-4 border-t border-slate-50 space-y-2 text-sm text-slate-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
            <span>Radio de cobertura: <strong>{provider.coverage_radius_km} km</strong></span>
          </div>
          {distanceKm !== undefined && (
            <div className="flex items-center text-blue-600 font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              <span>A {distanceKm.toFixed(1)} km de tu ubicación</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          <div>CUIT: {provider.cuit_arca}</div>
        </div>
        {onSelect && (
          <button
            onClick={onSelect}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
          >
            Ver Detalles
          </button>
        )}
      </div>
    </div>
  );
}
