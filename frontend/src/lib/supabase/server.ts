import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Cliente para Server Components, Server Actions y Route Handlers (Aplica RLS)
export function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Las variables de entorno de Supabase no están configuradas correctamente.');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // El set de cookies puede fallar si se llama desde Server Components.
            // Se puede ignorar de forma segura si las cookies son manejadas por el middleware.
          }
        },
      },
    }
  );
}

// Cliente privilegiado con Service Role Key (Bypassa RLS - Solo Servidor)
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error('La variable NEXT_PUBLIC_SUPABASE_URL no está configurada.');
  }

  if (!serviceRoleKey) {
    throw new Error('La variable SUPABASE_SERVICE_ROLE_KEY no está configurada.');
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}