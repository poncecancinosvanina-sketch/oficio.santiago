'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Search, Clock, Zap, Star, ChevronRight,
  Flame, PaintBucket, Wind,
  SprayCan, HardHat, ArrowRight, Bell, User
} from 'lucide-react';
import { LogoOficiosSantiago } from '@/components/Logo';
import GoogleSignInButton from '@/components/GoogleSignInButton';

// ─── Datos estáticos del MVP ───────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Plomería',      icon: Droplets,    color: 'bg-blue-50 text-blue-600',    badge: 'Popular',  badgeColor: 'bg-blue-600' },
  { label: 'Electricidad',  icon: Lightbulb,   color: 'bg-amber-50 text-amber-500',  badge: 'Rápido',   badgeColor: 'bg-amber-500' },
  { label: 'Cerrajería',    icon: Lock,        color: 'bg-slate-50 text-slate-600',  badge: 'Urgente',  badgeColor: 'bg-rose-500' },
  { label: 'Gas',           icon: Flame,       color: 'bg-orange-50 text-orange-500', badge: 'Popular', badgeColor: 'bg-orange-500' },
  { label: 'Pintura',       icon: PaintBucket, color: 'bg-pink-50 text-pink-500',    badge: null,       badgeColor: '' },
  { label: 'Climatización', icon: Wind,        color: 'bg-cyan-50 text-cyan-600',    badge: 'Rápido',   badgeColor: 'bg-cyan-600' },
  { label: 'Limpieza',      icon: SprayCan,    color: 'bg-emerald-50 text-emerald-600', badge: null,    badgeColor: '' },
  { label: 'Albañilería',   icon: HardHat,     color: 'bg-stone-50 text-stone-600',  badge: null,       badgeColor: '' },
];

const FEATURED_PROVIDERS = [
  {
    id: '1',
    name: 'Mario Gómez',
    specialty: 'Plomero · Destapaciones',
    rating: 4.9,
    reviews: 132,
    distance: '1.2 km',
    eta: '~15 min',
    online: true,
    avatar: 'MG',
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    name: 'Carlos Rueda',
    specialty: 'Electricista · Instalaciones',
    rating: 4.8,
    reviews: 98,
    distance: '2.4 km',
    eta: '~22 min',
    online: true,
    avatar: 'CR',
    avatarColor: 'from-amber-400 to-orange-500',
  },
  {
    id: '3',
    name: 'Luis Paz',
    specialty: 'Gasista Matriculado',
    rating: 5.0,
    reviews: 74,
    distance: '3.1 km',
    eta: '~30 min',
    online: false,
    avatar: 'LP',
    avatarColor: 'from-orange-400 to-rose-500',
  },
];

// ─── Componentes internos ──────────────────────────────────────────────────────

function ProviderAvatar({ initials, gradient, online }: { initials: string; gradient: string; online: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-lg shadow-md`}>
        {initials}
      </div>
      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────────

export default function Home() {
  const [address, setAddress] = useState('');
  const [mode, setMode] = useState<'urgent' | 'schedule'>('urgent');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-8">

      {/* ── TOP BAR (Mobile Header) ─────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <LogoOficiosSantiago className="h-8 w-auto" />
          </Link>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition">
              <Bell className="w-4 h-4 text-slate-600" />
            </button>
            <Link href="/registro-prestador" className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition">
              <User className="w-4 h-4 text-slate-600" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-6 pt-5">

        {/* ── HERO SEARCH (Estilo Uber) ──────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl" />

          <div className="relative">
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">¿Qué necesitás hoy?</p>
            <h1 className="text-white text-2xl font-extrabold leading-tight mb-4">
              Encontrá un oficio<br />en tu zona ahora
            </h1>

            {/* Selector de Modalidad */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-3 backdrop-blur-sm">
              <button
                onClick={() => setMode('urgent')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'urgent' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Urgente · Llega ya</span>
              </button>
              <button
                onClick={() => setMode('schedule')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'schedule' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Programar turno</span>
              </button>
            </div>

            {/* Input de Dirección */}
            <div className="flex items-center bg-white rounded-2xl shadow-lg px-4 py-3 space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tu dirección en Santiago del Estero..."
                className="flex-1 text-sm font-medium text-slate-700 placeholder-slate-400 outline-none bg-transparent"
              />
              <Link
                href={address ? `/solicitar?address=${encodeURIComponent(address)}&mode=${mode}` : '/solicitar'}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2 transition shadow-sm flex-shrink-0 active:scale-95"
              >
                <Search className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-3">
              <GoogleSignInButton />
            </div>
          </div>
        </div>

        {/* ── GRILLA DE CATEGORÍAS (Estilo PedidosYa) ──────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-slate-800">¿Qué tipo de trabajo?</h2>
            <Link href="/solicitar" className="text-xs font-bold text-blue-600 flex items-center space-x-0.5 hover:underline">
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map(({ label, icon: Icon, color, badge, badgeColor }) => (
              <button
                key={label}
                onClick={() => setSelectedCategory(label === selectedCategory ? null : label)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 shadow-sm
                  ${selectedCategory === label
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                    : 'border-transparent bg-white hover:border-slate-200 hover:shadow-md'
                  }`}
              >
                {badge && (
                  <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded-full shadow ${badgeColor}`}>
                    {badge}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <Link
              href={`/solicitar?category=${encodeURIComponent(selectedCategory)}`}
              className="mt-3 flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg transition active:scale-95"
            >
              <span>Buscar {selectedCategory}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </section>

        {/* ── BANNER URGENTE ────────────────────────────────────────────── */}
        <div className="flex items-center space-x-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-4 shadow-lg">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-extrabold text-sm">¿Emergencia ahora?</p>
            <p className="text-white/80 text-xs">Plomero o gasista en minutos.</p>
          </div>
          <Link
            href="/solicitar?mode=urgent"
            className="bg-white text-rose-600 font-extrabold text-xs px-3 py-2 rounded-xl shadow active:scale-95 transition flex-shrink-0"
          >
            Pedir Ya
          </Link>
        </div>

        {/* ── PRESTADORES DESTACADOS ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Cerca de vos ahora</h2>
              <p className="text-xs text-slate-500">Profesionales verificados en Santiago del Estero</p>
            </div>
            <Link href="/solicitar" className="text-xs font-bold text-blue-600 flex items-center hover:underline">
              <span>Ver más</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {FEATURED_PROVIDERS.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition">
                <ProviderAvatar initials={p.avatar} gradient={p.avatarColor} online={p.online} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <p className="font-extrabold text-sm text-slate-800 truncate">{p.name}</p>
                    {p.online && (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        En zona
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1.5">{p.specialty}</p>
                  <div className="flex items-center space-x-3">
                    <StarRating rating={p.rating} />
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                      {p.distance}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-0.5 text-slate-400" />
                      {p.eta}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/solicitar?provider=${p.id}`}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition active:scale-95"
                >
                  Pedir
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── BANNER REGISTRO PRESTADOR ─────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 flex items-center space-x-4 shadow-xl">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-extrabold text-sm">¿Sos trabajador independiente?</p>
            <p className="text-white/60 text-xs mt-0.5">Recibí clientes en tu zona. ARCA verificado.</p>
          </div>
          <Link
            href="/registro-prestador"
            className="flex-shrink-0 bg-white text-slate-900 font-extrabold text-xs px-3 py-2.5 rounded-xl shadow active:scale-95 transition"
          >
            Sumarme
          </Link>
        </div>

      </div>

      {/* ── STICKY CTA BAR (Mobile Bottom) ───────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-2xl px-4 py-3">
        <Link
          href="/solicitar"
          className="flex items-center justify-center space-x-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-extrabold text-sm shadow-lg transition active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span>Buscar un Oficio Ahora</span>
        </Link>
      </div>

    </div>
  );
}
