'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Wallet, UserCheck, Search } from 'lucide-react';
import { LogoOficiosSantiago } from '@/components/Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop-only Navbar (hidden on mobile since page.tsx has its own top bar) */}
      <nav className="hidden md:block sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <LogoOficiosSantiago className="h-9 w-auto" />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/solicitar"
                className="flex items-center space-x-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition"
              >
                <Search className="h-4 w-4" />
                <span>Solicitar Servicio</span>
              </Link>
              <Link
                href="/registro-prestador"
                className="flex items-center space-x-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition"
              >
                <UserCheck className="h-4 w-4" />
                <span>Soy Prestador</span>
              </Link>
              <Link
                href="/dashboard/billetera"
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow"
              >
                <Wallet className="h-4 w-4" />
                <span>Mi Billetera</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Menu (triggered from page.tsx top bar icon or here) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-extrabold text-slate-800 text-lg">Menú</span>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-slate-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <Link href="/solicitar" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-3 py-3 rounded-xl bg-slate-50 font-bold text-slate-700">
              <Search className="w-5 h-5 text-blue-500" />
              <span>Solicitar Servicio</span>
            </Link>
            <Link href="/registro-prestador" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-3 py-3 rounded-xl bg-slate-50 font-bold text-slate-700">
              <UserCheck className="w-5 h-5 text-blue-500" />
              <span>Registrarme como Prestador</span>
            </Link>
            <Link href="/dashboard/billetera" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-3 py-3 rounded-xl bg-blue-50 font-bold text-blue-700 border border-blue-100">
              <Wallet className="w-5 h-5" />
              <span>Mi Billetera</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
