import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oficios Santiago | Contratá Prestadores Locales',
  description: 'Conectá con carpinteros, plomeros, electricistas y albañiles verificados en Santiago del Estero. Rápido, local y seguro.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-100 py-8 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} Oficios Santiago. Todos los derechos reservados.</p>
            <p className="mt-1 text-xs text-slate-400">Santiago del Estero, Argentina.</p>
            <p className="mt-2 text-xs text-slate-400">
              Desarrollado por{' '}
              <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VaninaG
              </span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
