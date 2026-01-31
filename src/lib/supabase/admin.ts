import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client that bypasses Row Level Security (RLS).
 *
 * WARNING: This client has elevated privileges and should ONLY be used in
 * server-side contexts where you need to bypass RLS policies. Common use cases:
 * - Cron jobs and scheduled tasks
 * - Webhook handlers
 * - Administrative operations
 * - Data migrations
 *
 * NEVER expose this client to the browser or use it in Client Components.
 *
 * @returns {ReturnType<typeof createClient<Database>>} Supabase admin client
 *
 * @example
 * ```tsx
 * // In a webhook handler
 * import { createAdminClient } from '@/lib/supabase/admin';
 *
 * export async function POST(request: Request) {
 *   const supabase = createAdminClient();
 *   // Perform admin operations that bypass RLS
 *   await supabase.from('workouts').delete().eq('id', workoutId);
 *   return Response.json({ success: true });
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In a cron job
 * import { createAdminClient } from '@/lib/supabase/admin';
 *
 * export async function GET() {
 *   const supabase = createAdminClient();
 *   // Clean up old records across all users
 *   await supabase.from('sessions').delete().lt('expires_at', new Date().toISOString());
 *   return Response.json({ success: true });
 * }
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
