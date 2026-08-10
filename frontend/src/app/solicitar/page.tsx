'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { Search, MapPin, Loader2, CheckCircle, Phone } from 'lucide-react';
import ProviderCard from '@/components/ProviderCard';
import { Provider } from '@/types/database';

interface NearbyProvider extends Provider {
  distance_km: number;
}

export default function SolicitarServicio() {
  const [loading, setLoading] = useState(false);
  const [searchingProviders, setSearchingProviders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Plomería');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // List of nearby providers
  const [nearbyProviders, setNearbyProviders] = useState<NearbyProvider[]>([]);

  // Detect GPS
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
        setError('No se pudo obtener la ubicación GPS.');
      },
      { enableHighAccuracy: true }
    );
  };

  // Buscar proveedores cercanos cuando cambian las coordenadas o la categoría
  useEffect(() => {
    if (lat && lng && category) {
      fetchNearbyProviders();
    }
  }, [lat, lng, category]);

  // Autocompletar datos desde sesión Supabase si existe
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await getAuthenticatedUser();
        if (!mounted || !user) return;
        if (user.user_metadata?.full_name) setName(user.user_metadata.full_name as string);
        if (user.email) setEmail(user.email);
      } catch (e) {
        // Silenciar errores de auth en el formulario
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchNearbyProviders = async () => {
    setSearchingProviders(true);
    setProvidersError(null);

    try {
      const supabase = createClient();

      const { data, error: rpcError } = await supabase.rpc('get_nearby_providers', {
        client_lat: lat,
        client_lng: lng,
        p_category: category,
      });

      if (rpcError) throw rpcError;
      setNearbyProviders(data || []);
    } catch (err) {
      console.error('Error al buscar prestadores:', err);
      setNearbyProviders([]);
      setProvidersError(
        getSupabaseErrorMessage(
          err,
          'No pudimos cargar los prestadores disponibles. Intentá de nuevo en unos segundos.'
        )
      );
    } finally {
      setSearchingProviders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!lat || !lng) {
      setError('Debes capturar tu ubicación GPS para que los prestadores estimen la distancia.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const clientId = crypto.randomUUID();

      const clientLocationPoint = `POINT(${lng} ${lat})`;

      const { error: userError } = await supabase.from('users').insert([
        {
          id: clientId,
          name,
          email,
          phone,
          address,
          location: clientLocationPoint,
        },
      ]);

      if (userError) throw userError;

      const { error: requestError } = await supabase.from('service_requests').insert([
        {
          client_id: clientId,
          category,
          description,
          location: clientLocationPoint,
          status: 'pending',
          lead_fee_charged: 10000.0,
        },
      ]);

      if (requestError) throw requestError;

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        getSupabaseErrorMessage(
          err,
          'Ocurrió un error al enviar la solicitud. Intentá de nuevo.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Formulario Izquierda */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Solicitar un Servicio</h1>
              <p className="text-sm text-slate-500">Publicá tu pedido y prestadores cercanos te contactarán</p>
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
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">¡Pedido Publicado Exitosamente!</h3>
              <p className="text-slate-500">
                Tu solicitud de **{category}** fue guardada. Los prestadores de la zona han sido notificados. Se comunicarán directamente a tu teléfono una vez que acepten tu lead.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setName('');
                  setPhone('');
                  setAddress('');
                  setDescription('');
                  setLat(null);
                  setLng(null);
                  setGpsStatus('idle');
                  setNearbyProviders([]);
                }}
                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow"
              >
                Crear Otra Solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Botón Google */}
              <div>
                <GoogleSignInButton onError={(m) => setError(m)} />
              </div>

              <div className="text-center text-sm text-slate-400">o completar manualmente</div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tu Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Carlos Gómez"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Email (autocompletado desde Google si existe) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="tunombre@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp / Teléfono</label>
                <input
                  type="tel"
                  placeholder="3854987654"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <span className="text-xs text-slate-400 mt-1 block">Los prestadores te contactarán a este número.</span>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dirección aproximada (Calle y Altura)</label>
                <input
                  type="text"
                  placeholder="Av. Belgrano Sur 1200, Santiago del Estero"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">¿Qué servicio necesitás?</label>
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

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Detalle del problema</label>
                <textarea
                  placeholder="Tengo una pérdida de agua en la bacha de la cocina..."
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                ></textarea>
              </div>

              {/* Captura GPS */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ubicación GPS actual</label>
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
                    {gpsStatus === 'loading' && <span>Ubicando...</span>}
                    {gpsStatus === 'success' && <span>Ubicación Establecida</span>}
                    {gpsStatus === 'error' && <span>Reintentar GPS</span>}
                    {gpsStatus === 'idle' && <span>Obtener mi GPS</span>}
                  </button>

                  {lat && lng && (
                    <span className="text-xs text-slate-500 font-mono">
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de Publicar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publicando pedido...</span>
                  </>
                ) : (
                  <span>Publicar Pedido de Trabajo</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Cobertura en vivo y prestadores derecha */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
            
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>Cobertura de Prestadores</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Selecciona tu categoría e indica tu GPS para conocer los profesionales disponibles en tu zona de inmediato.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-md">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Prestadores en tu zona ({nearbyProviders.length})</span>
              {searchingProviders && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </h3>

            {providersError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-sm font-semibold">
                {providersError}
              </div>
            )}

            {nearbyProviders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {!lat || !lng ? (
                  <p>Activa tu GPS en el formulario para buscar prestadores en el área.</p>
                ) : (
                  <p>No se encontraron prestadores de **{category}** con cobertura activa en tu ubicación actual.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {nearbyProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    distanceKm={provider.distance_km}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
