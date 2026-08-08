'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegistroPrestador() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [cuit, setCuit] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Plomería');
  const [subcategories, setSubcategories] = useState('');
  const [coverageRadius, setCoverageRadius] = useState(5);
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Obtener geolocalización actual
  const handleGetLocation = () => {
    setGpsStatus('loading');
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setError('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGpsStatus('success');
        setError(null);
      },
      (err) => {
        console.error(err);
        setGpsStatus('error');
        setError('No se pudo obtener la ubicación. Por favor, aprueba los permisos de GPS.');
      },
      { enableHighAccuracy: true }
    );
  };

  // Validar CUIT Argentino (formato simplificado de 11 dígitos numéricos)
  const validateCuit = (val: string) => {
    const clean = val.replace(/\D/g, '');
    return clean.length === 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones
    if (!validateCuit(cuit)) {
      setError('El CUIT debe tener exactamente 11 dígitos numéricos.');
      setLoading(false);
      return;
    }

    if (!lat || !lng) {
      setError('Debes capturar tu ubicación GPS base para calcular tu radio de cobertura.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const randomId = crypto.randomUUID(); // Generamos un UUID aleatorio para el MVP
      
      const subcategoryArray = subcategories
        ? subcategories.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      // Insertar en la tabla providers de Supabase
      // En PostGIS la ubicación se inserta en formato Point string: 'POINT(longitud latitud)'
      const pointString = `POINT(${lng} ${lat})`;

      const { error: dbError } = await supabase.from('providers').insert([
        {
          id: randomId,
          cuit_arca: cuit.replace(/\D/g, ''),
          business_name: businessName,
          category,
          subcategories: subcategoryArray,
          base_location: pointString,
          coverage_radius_km: Number(coverageRadius),
          wallet_balance: 0.0, // Saldo inicial en $0 para forzar la recarga
          is_active: true,
          is_verified: true, // Auto-verificado en MVP para demostración
          rating_avg: 5.0,
          phone,
        },
      ]);

      if (dbError) throw dbError;

      // Guardar el ID en localStorage para simular login
      localStorage.setItem('provider_id', randomId);
      localStorage.setItem('provider_business_name', businessName);
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/billetera');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al registrar el prestador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Alta de Prestador</h1>
            <p className="text-sm text-slate-500">Unite como prestador de servicios en Santiago del Estero</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-12 space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100 mb-2">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">¡Registro Completado!</h3>
            <p className="text-slate-500">Te estamos redirigiendo a tu dashboard de billetera...</p>
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CUIT */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">CUIT (Validación ARCA)</label>
              <input
                type="text"
                placeholder="20345678901"
                maxLength={11}
                required
                value={cuit}
                onChange={(e) => setCuit(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
              <span className="text-xs text-slate-400 mt-1 block">Ingresá los 11 dígitos sin guiones.</span>
            </div>

            {/* Nombre Comercial */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Comercial o Nombre y Apellido</label>
              <input
                type="text"
                placeholder="Plomería del Norte / Juan Pérez"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp / Celular de Contacto</label>
              <input
                type="tel"
                placeholder="3854123456"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <span className="text-xs text-slate-400 mt-1 block">Con este teléfono te contactarán los clientes.</span>
            </div>

            {/* Categoría y Subcategorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Categoría Principal</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option>Plomería</option>
                  <option>Electricidad</option>
                  <option>Carpintería</option>
                  <option>Albañilería</option>
                  <option>Gasista</option>
                  <option>Pintura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Radio de Cobertura (KM)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={coverageRadius}
                  onChange={(e) => setCoverageRadius(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Subcategorías */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Subcategorías / Especialidades (Opcional)</label>
              <input
                type="text"
                placeholder="Destapaciones, Termotanques, Cañerías"
                value={subcategories}
                onChange={(e) => setSubcategories(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <span className="text-xs text-slate-400 mt-1 block">Separalas por comas.</span>
            </div>

            {/* Geolocalización GPS */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ubicación GPS Base</label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className={`px-4 py-3 rounded-xl font-bold flex items-center space-x-2 border transition-all ${
                    gpsStatus === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : gpsStatus === 'loading'
                      ? 'bg-slate-100 border-slate-200 text-slate-500'
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {gpsStatus === 'loading' && <span>Detectando...</span>}
                  {gpsStatus === 'success' && <span>¡Ubicación Detectada!</span>}
                  {gpsStatus === 'error' && <span>Reintentar Ubicación</span>}
                  {gpsStatus === 'idle' && <span>Capturar mi Ubicación</span>}
                </button>

                {lat && lng && (
                  <span className="text-xs text-slate-500 font-mono">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                Usamos tu ubicación para buscar solicitudes que estén en tu radio de trabajo configurado.
              </span>
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando Prestador...</span>
                </>
              ) : (
                <>
                  <span>Registrarme e ir a la Billetera</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
