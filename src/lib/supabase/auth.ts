import { redirect } from 'next/navigation';
import { createClient } from './server';

/**
 * Get the authenticated user or redirect to /login.
 * Use in Server Components and server-side page functions.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');
  return user;
}

/**
 * Get the authenticated user or return null.
 * Use in API routes where you need to return a 401 JSON response.
 */
export async function getAuthUserOrNull() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
