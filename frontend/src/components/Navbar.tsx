'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Wallet, Briefcase, UserCheck, Search } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Oficios Santiago
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/solicitar" className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 font-medium transition-colors">
              <Search className="h-4 w-4" />
              <span>Solicitar Servicio</span>
            </Link>
            <Link href="/registro-prestador" className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 font-medium transition-colors">
              <UserCheck className="h-4 w-4" />
              <span>Soy Prestador</span>
            </Link>
            <Link href="/dashboard/billetera" className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100 font-semibold transition-colors">
              <Wallet className="h-4 w-4" />
              <span>Mi Billetera</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/solicitar"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
          >
            <Search className="h-5 w-5 text-slate-400" />
            <span>Solicitar Servicio</span>
          </Link>
          <Link
            href="/registro-prestador"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
          >
            <UserCheck className="h-5 w-5 text-slate-400" />
            <span>Soy Prestador (Registro)</span>
          </Link>
          <Link
            href="/dashboard/billetera"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Wallet className="h-5 w-5" />
            <span>Mi Billetera</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
