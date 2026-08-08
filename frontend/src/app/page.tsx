import Link from 'next/link';
import { Search, Wallet, ShieldCheck, MapPin, Star, Sparkles, PhoneCall } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-50">
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#818cf8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Marketplace Exclusivo para Santiago del Estero</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text">
            Solucioná tus problemas del hogar en minutos
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Conectá de forma directa con plomeros, electricistas, pintores, gasistas y carpinteros verificados fiscalmente por ARCA en tu zona.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/solicitar"
              className="w-full sm:w-auto inline-flex justify-center items-center space-x-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
              <span>Solicitar un Servicio</span>
            </Link>
            <Link
              href="/registro-prestador"
              className="w-full sm:w-auto inline-flex justify-center items-center space-x-2 rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
            >
              <span>Quiero ofrecer mis servicios</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Características (Beneficios) */}
      <div className="bg-white py-24 sm:py-32 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-bold leading-7 text-blue-600 uppercase tracking-wide">¿Cómo funciona?</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Un modelo ágil, transparente y directo
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              
              {/* Beneficio 1 */}
              <div className="flex flex-col items-start bg-slate-50/50 p-8 rounded-3xl border border-slate-100 hover:shadow-sm transition-shadow">
                <div className="rounded-2xl bg-blue-600 p-3 text-white">
                  <MapPin className="h-6 w-6" />
                </div>
                <dt className="mt-4 font-bold text-xl text-slate-900">Geolocalización PostGIS</dt>
                <dd className="mt-2 leading-relaxed text-slate-600 text-sm">
                  Buscamos prestadores activos dentro de su rango de cobertura configurado (ej: 3km, 5km o 10km) para garantizar respuestas inmediatas y traslados rápidos.
                </dd>
              </div>

              {/* Beneficio 2 */}
              <div className="flex flex-col items-start bg-slate-50/50 p-8 rounded-3xl border border-slate-100 hover:shadow-sm transition-shadow">
                <div className="rounded-2xl bg-emerald-600 p-3 text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <dt className="mt-4 font-bold text-xl text-slate-900">Validación Fiscal ARCA</dt>
                <dd className="mt-2 leading-relaxed text-slate-600 text-sm">
                  Todos los prestadores son validados en ARCA (CUIT activo y Monotributo / Responsable Inscripto) para asegurar formalidad y total confianza del cliente.
                </dd>
              </div>

              {/* Beneficio 3 */}
              <div className="flex flex-col items-start bg-slate-50/50 p-8 rounded-3xl border border-slate-100 hover:shadow-sm transition-shadow">
                <div className="rounded-2xl bg-indigo-600 p-3 text-white">
                  <Wallet className="h-6 w-6" />
                </div>
                <dt className="mt-4 font-bold text-xl text-slate-900">Sin Comisiones de Trabajo</dt>
                <dd className="mt-2 leading-relaxed text-slate-600 text-sm">
                  El prestador adquiere el lead de contacto directo mediante su saldo prepago cargado en Mercado Pago. El trato y pago del servicio es 100% libre entre las partes.
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </div>

      {/* Call To Action Secundario */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <h3 className="text-2xl sm:text-4xl font-extrabold">¿Sos trabajador independiente?</h3>
          <p className="mt-4 text-blue-100 max-w-xl mx-auto text-base">
            Cargá saldo con Mercado Pago, configurá tu radio y recibí pedidos directos en Santiago del Estero. Multiplicá tu clientela hoy mismo.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/registro-prestador"
              className="inline-flex items-center space-x-2 bg-white text-blue-700 px-6 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Registrarme como Prestador</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
