/**
 * Whoop API v2 Client
 * Typed wrapper for Whoop developer API with automatic pagination and error handling.
 * Base URL: https://api.prod.whoop.com/developer/v2
 */

import type {
  WhoopPaginatedResponse,
  WhoopPaginationParams,
  WhoopProfile,
  WhoopRecovery,
  WhoopSleep,
  WhoopWorkout,
  WhoopCycle,
} from './types';

const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v2';

export class WhoopApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: string
  ) {
    super(message);
    this.name = 'WhoopApiError';
  }
}

/**
 * Whoop API client for fetching recovery, sleep, workout, and cycle data.
 * Supports Bearer token authentication and cursor-based pagination.
 */
export class WhoopClient {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string, baseUrl?: string) {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl || WHOOP_API_BASE;

    if (!this.accessToken) {
      throw new Error('Whoop access token is required.');
    }
  }

  /**
   * Generic fetch wrapper with Bearer token authentication.
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (response.status === 401) {
        throw new WhoopApiError(
          'Whoop access token is invalid or expired',
          401,
          await response.text()
        );
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new WhoopApiError(
          `Whoop API error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof WhoopApiError) {
        throw error;
      }
      throw new WhoopApiError(
        `Failed to fetch from Whoop API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build query string from pagination params.
   */
  private buildQueryString(params?: WhoopPaginationParams): string {
    if (!params) return '';

    const query = new URLSearchParams();

    if (params.limit) {
      query.set('limit', String(params.limit));
    }
    if (params.nextToken) {
      query.set('nextToken', params.nextToken);
    }
    if (params.start) {
      query.set('start', params.start);
    }
    if (params.end) {
      query.set('end', params.end);
    }

    const qs = query.toString();
    return qs ? `?${qs}` : '';
  }

  /**
   * Fetch a single page of paginated data.
   */
  private async fetchPage<T>(
    endpoint: string,
    params?: WhoopPaginationParams
  ): Promise<WhoopPaginatedResponse<T>> {
    const qs = this.buildQueryString(params);
    return this.fetch<WhoopPaginatedResponse<T>>(`${endpoint}${qs}`);
  }

  /**
   * Automatically paginate through all results for an endpoint.
   * Uses cursor-based pagination via the nextToken field.
   */
  private async fetchAllPages<T>(
    endpoint: string,
    params?: Omit<WhoopPaginationParams, 'nextToken'>,
    onProgress?: (fetched: number) => void
  ): Promise<T[]> {
    const allRecords: T[] = [];
    let nextToken: string | null = null;
    let pageCount = 0;

    do {
      const pageParams: WhoopPaginationParams = {
        limit: params?.limit || 25,
        start: params?.start,
        end: params?.end,
        ...(nextToken ? { nextToken } : {}),
      };

      const response = await this.fetchPage<T>(endpoint, pageParams);
      allRecords.push(...response.records);
      nextToken = response.next_token;
      pageCount++;

      if (onProgress) {
        onProgress(allRecords.length);
      }

      // Safety valve to prevent infinite loops
      if (pageCount > 100) {
        console.warn(
          `[WhoopClient] Pagination safety limit reached for ${endpoint} after ${pageCount} pages`
        );
        break;
      }
    } while (nextToken);

    return allRecords;
  }

  // ─── Recovery ────────────────────────────────────────────────────────────────

  /**
   * Get a single page of recovery data.
   */
  async getRecovery(
    params?: WhoopPaginationParams
  ): Promise<WhoopPaginatedResponse<WhoopRecovery>> {
    return this.fetchPage<WhoopRecovery>('/recovery', params);
  }

  /**
   * Get all recovery data, automatically handling pagination.
   * Supports date range filtering via start/end ISO datetime strings.
   */
  async getAllRecovery(
    params?: { start?: string; end?: string },
    onProgress?: (fetched: number) => void
  ): Promise<WhoopRecovery[]> {
    return this.fetchAllPages<WhoopRecovery>(
      '/recovery',
      { limit: 25, ...params },
      onProgress
    );
  }

  // ─── Sleep ─────────────────────────────────────────────────────────────────

  /**
   * Get a single page of sleep data.
   */
  async getSleep(
    params?: WhoopPaginationParams
  ): Promise<WhoopPaginatedResponse<WhoopSleep>> {
    return this.fetchPage<WhoopSleep>('/activity/sleep', params);
  }

  /**
   * Get all sleep data, automatically handling pagination.
   */
  async getAllSleep(
    params?: { start?: string; end?: string },
    onProgress?: (fetched: number) => void
  ): Promise<WhoopSleep[]> {
    return this.fetchAllPages<WhoopSleep>(
      '/activity/sleep',
      { limit: 25, ...params },
      onProgress
    );
  }

  // ─── Workout ───────────────────────────────────────────────────────────────

  /**
   * Get a single page of workout data.
   */
  async getWorkouts(
    params?: WhoopPaginationParams
  ): Promise<WhoopPaginatedResponse<WhoopWorkout>> {
    return this.fetchPage<WhoopWorkout>('/activity/workout', params);
  }

  /**
   * Get all workout data, automatically handling pagination.
   */
  async getAllWorkouts(
    params?: { start?: string; end?: string },
    onProgress?: (fetched: number) => void
  ): Promise<WhoopWorkout[]> {
    return this.fetchAllPages<WhoopWorkout>(
      '/activity/workout',
      { limit: 25, ...params },
      onProgress
    );
  }

  // ─── Cycle ─────────────────────────────────────────────────────────────────

  /**
   * Get a single page of cycle data.
   */
  async getCycles(
    params?: WhoopPaginationParams
  ): Promise<WhoopPaginatedResponse<WhoopCycle>> {
    return this.fetchPage<WhoopCycle>('/cycle', params);
  }

  /**
   * Get all cycle data, automatically handling pagination.
   */
  async getAllCycles(
    params?: { start?: string; end?: string },
    onProgress?: (fetched: number) => void
  ): Promise<WhoopCycle[]> {
    return this.fetchAllPages<WhoopCycle>(
      '/cycle',
      { limit: 25, ...params },
      onProgress
    );
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  /**
   * Get the authenticated user's basic profile information.
   */
  async getProfile(): Promise<WhoopProfile> {
    return this.fetch<WhoopProfile>('/user/profile/basic');
  }
}

/**
 * Create a new Whoop client instance with the given access token.
 */
export function createWhoopClient(accessToken: string): WhoopClient {
  return new WhoopClient(accessToken);
}
