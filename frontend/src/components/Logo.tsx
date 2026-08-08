import React from 'react';

export function LogoOficiosSantiago({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        <path
          d="M50 5C30.67 5 15 20.67 15 40C15 62.5 45 90 48.5 93.2C49.36 94 50.64 94 51.5 93.2C55 90 85 62.5 85 40C85 20.67 69.33 5 50 5Z"
          fill="url(#purpleGradient)"
        />
        <path
          d="M57 31C54.8 31 53 32.8 53 35C53 35.8 53.2 36.5 53.7 37.1L40.8 50C40.2 49.5 39.5 49.3 38.7 49.3C36.5 49.3 34.7 51.1 34.7 53.3C34.7 55.5 36.5 57.3 38.7 57.3C40.9 57.3 42.7 55.5 42.7 53.3C42.7 52.5 42.5 51.8 42 51.2L54.9 38.3C55.5 38.8 56.2 39 57 39C59.2 39 61 37.2 61 35C61 32.8 59.2 31 57 31Z"
          fill="white"
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
          Oficios
        </span>
        <span className="text-xs font-semibold tracking-widest text-violet-600 uppercase leading-tight">
          Santiago
        </span>
      </div>
    </div>
  );
}
