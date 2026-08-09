import { createClient } from './client';

export async function signInWithGoogle() {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

export async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}
