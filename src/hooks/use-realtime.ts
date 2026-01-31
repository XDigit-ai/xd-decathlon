'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ============================================================================
// REALTIME SUBSCRIPTION HOOK
// ============================================================================

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions<T extends { [key: string]: unknown }> {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Hook for subscribing to Supabase Realtime changes
 * @param options Subscription options including table, event, filter, and callback
 * @returns Void - automatically handles subscription and cleanup
 *
 * @example
 * ```tsx
 * useRealtimeSubscription({
 *   table: 'hevy_workouts',
 *   event: 'INSERT',
 *   callback: (payload) => {
 *     console.log('New workout:', payload.new);
 *     refetchWorkouts();
 *   }
 * });
 * ```
 */
export function useRealtimeSubscription<T extends { [key: string]: unknown } = { [key: string]: unknown }>(
  options: UseRealtimeSubscriptionOptions<T>
): void {
  const { table, event = '*', filter, callback } = options;

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const subscribe = async () => {
      // Create channel with unique name
      const channelName = `${table}_${event}_${Date.now()}`;
      channel = supabase.channel(channelName);

      // Build the subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = (channel as any).on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        callback
      ) as RealtimeChannel;

      // Subscribe to the channel
      subscription.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${table}`);
        } else if (status === 'TIMED_OUT') {
          console.error(`Subscription to ${table} timed out`);
        }
      });
    };

    subscribe();

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        console.log(`Unsubscribed from ${table} changes`);
      }
    };
  }, [table, event, filter, callback]);
}

// ============================================================================
// SPECIALIZED REALTIME HOOKS
// ============================================================================

/**
 * Hook for subscribing to workout changes
 * @param callback Function to call when workouts change
 */
export function useWorkoutUpdates(
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
): void {
  useRealtimeSubscription({
    table: 'hevy_workouts',
    event: '*',
    callback,
  });
}

/**
 * Hook for subscribing to recovery data changes
 * @param callback Function to call when recovery data changes
 */
export function useRecoveryUpdates(
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
): void {
  useRealtimeSubscription({
    table: 'whoop_recovery',
    event: '*',
    callback,
  });
}

/**
 * Hook for subscribing to target changes
 * @param callback Function to call when targets change
 */
export function useTargetUpdates(
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
): void {
  useRealtimeSubscription({
    table: 'targets',
    event: '*',
    callback,
  });
}

/**
 * Hook for subscribing to weight changes
 * @param callback Function to call when weight data changes
 */
export function useWeightUpdates(
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
): void {
  useRealtimeSubscription({
    table: 'daily_weight',
    event: '*',
    callback,
  });
}

// ============================================================================
// PRESENCE HOOK
// ============================================================================

interface PresenceState {
  [key: string]: any;
}

/**
 * Hook for tracking user presence in a channel
 * @param channelName Name of the presence channel
 * @param userState User state to broadcast
 * @returns Current presence state
 *
 * @example
 * ```tsx
 * const presence = usePresence('workout-session', {
 *   user_id: userId,
 *   username: userName,
 *   online_at: new Date().toISOString()
 * });
 * ```
 */
export function usePresence(
  channelName: string,
  userState: PresenceState
): PresenceState {
  const [presence, setPresence] = useState<PresenceState>({});

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresence(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userState);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [channelName, userState]);

  return presence;
}

// ============================================================================
// BROADCAST HOOK
// ============================================================================

interface UseBroadcastOptions {
  channelName: string;
  event: string;
  onReceive: (payload: any) => void;
}

interface BroadcastResult {
  send: (payload: any) => Promise<void>;
}

/**
 * Hook for broadcasting and receiving messages in a channel
 * @param options Channel name, event name, and receive callback
 * @returns Object with send function
 *
 * @example
 * ```tsx
 * const { send } = useBroadcast({
 *   channelName: 'workout-chat',
 *   event: 'message',
 *   onReceive: (payload) => {
 *     console.log('Received message:', payload);
 *   }
 * });
 *
 * // Send a message
 * send({ text: 'Great workout!', user: 'AK' });
 * ```
 */
export function useBroadcast(options: UseBroadcastOptions): BroadcastResult {
  const { channelName, event, onReceive } = options;
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const newChannel = supabase.channel(channelName);

    newChannel
      .on('broadcast', { event }, (payload) => {
        onReceive(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Connected to ${channelName} broadcast channel`);
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [channelName, event, onReceive]);

  const send = async (payload: any) => {
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  };

  return { send };
}
