import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in Client Components and browser contexts.
 *
 * This client automatically handles session management and cookie persistence
 * on the client side. It reads public environment variables that are safe to
 * expose to the browser.
 *
 * @returns {ReturnType<typeof createBrowserClient<Database>>} Supabase browser client
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { createClient } from '@/lib/supabase/client';
 *
 * export default function MyComponent() {
 *   const supabase = createClient();
 *   // Use supabase client...
 * }
 * ```
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
