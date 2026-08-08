type SupabaseLikeError = {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
};

function isSupabaseLikeError(error: unknown): error is SupabaseLikeError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function getSupabaseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('variables de entorno')) {
      return 'El servicio no está configurado correctamente. Contactá al administrador.';
    }

    if (
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('network request failed') ||
      message.includes('load failed')
    ) {
      return 'No pudimos conectar con el servidor. Verificá tu conexión a internet e intentá de nuevo.';
    }

    if (
      message.includes('invalid api key') ||
      message.includes('invalid jwt') ||
      message.includes('jwt') ||
      message.includes('unauthorized') ||
      message.includes('401')
    ) {
      return 'Error de autenticación con el servidor. Intentá de nuevo más tarde.';
    }

    if (
      message.includes('permission denied') ||
      message.includes('row-level security') ||
      message.includes('42501')
    ) {
      return 'No tenés permiso para realizar esta acción.';
    }

    return error.message || fallback;
  }

  if (isSupabaseLikeError(error)) {
    const message = (error.message ?? '').toLowerCase();
    const code = (error.code ?? '').toUpperCase();

    if (code === 'PGRST301' || message.includes('jwt')) {
      return 'Error de autenticación con el servidor. Intentá de nuevo más tarde.';
    }

    if (message.includes('failed to fetch') || message.includes('network')) {
      return 'No pudimos conectar con el servidor. Verificá tu conexión a internet e intentá de nuevo.';
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallback;
}
