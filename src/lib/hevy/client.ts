/**
 * Hevy API Client
 * Typed wrapper for Hevy API endpoints with automatic pagination and error handling
 */

import {
  HevyApiWorkout,
  HevyExerciseTemplate,
  HevyWorkoutsResponse,
  HevyWorkoutCountResponse,
  HevyExerciseTemplatesResponse,
  HevyWorkoutEventsResponse,
} from './types';

const HEVY_API_BASE = 'https://api.hevyapp.com/v1';

export class HevyApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'HevyApiError';
  }
}

/**
 * Hevy API client for fetching workout data
 */
export class HevyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.HEVY_API_KEY || '';
    this.baseUrl = baseUrl || HEVY_API_BASE;

    if (!this.apiKey) {
      throw new Error('Hevy API key is required. Set HEVY_API_KEY environment variable.');
    }
  }

  /**
   * Generic fetch wrapper with Hevy API authentication
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new HevyApiError(
          `Hevy API error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof HevyApiError) {
        throw error;
      }
      throw new HevyApiError(
        `Failed to fetch from Hevy API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get paginated workouts
   * @param page Page number (1-indexed)
   * @param pageSize Number of workouts per page (default: 10)
   */
  async getWorkouts(page = 1, pageSize = 10): Promise<HevyWorkoutsResponse> {
    return this.fetch<HevyWorkoutsResponse>(
      `/workouts?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get a single workout by ID
   */
  async getWorkout(workoutId: string): Promise<HevyApiWorkout> {
    return this.fetch<HevyApiWorkout>(`/workouts/${workoutId}`);
  }

  /**
   * Get total workout count
   */
  async getWorkoutCount(): Promise<HevyWorkoutCountResponse> {
    return this.fetch<HevyWorkoutCountResponse>('/workouts/count');
  }

  /**
   * Get workout events (updates/deletes since last sync)
   * @param page Page number (1-indexed)
   * @param pageSize Number of events per page (default: 10)
   */
  async getWorkoutEvents(page = 1, pageSize = 10): Promise<HevyWorkoutEventsResponse> {
    return this.fetch<HevyWorkoutEventsResponse>(
      `/workouts/events?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get paginated exercise templates
   * @param page Page number (1-indexed)
   * @param pageSize Number of templates per page (default: 10)
   */
  async getExerciseTemplates(
    page = 1,
    pageSize = 10
  ): Promise<HevyExerciseTemplatesResponse> {
    return this.fetch<HevyExerciseTemplatesResponse>(
      `/exercise_templates?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get a single exercise template by ID
   */
  async getExerciseTemplate(templateId: string): Promise<HevyExerciseTemplate> {
    return this.fetch<HevyExerciseTemplate>(`/exercise_templates/${templateId}`);
  }

  /**
   * Fetch all workouts across all pages
   * @param onProgress Optional callback for progress updates
   */
  async getAllWorkouts(
    onProgress?: (current: number, total: number) => void
  ): Promise<HevyApiWorkout[]> {
    const allWorkouts: HevyApiWorkout[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const response = await this.getWorkouts(currentPage, 50); // Use larger page size
      allWorkouts.push(...response.workouts);

      totalPages = response.page_count;

      if (onProgress) {
        onProgress(currentPage, totalPages);
      }

      currentPage++;
    }

    return allWorkouts;
  }

  /**
   * Fetch all exercise templates across all pages
   * @param onProgress Optional callback for progress updates
   */
  async getAllExerciseTemplates(
    onProgress?: (current: number, total: number) => void
  ): Promise<HevyExerciseTemplate[]> {
    const allTemplates: HevyExerciseTemplate[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const response = await this.getExerciseTemplates(currentPage, 50);
      allTemplates.push(...response.exercise_templates);

      totalPages = response.page_count;

      if (onProgress) {
        onProgress(currentPage, totalPages);
      }

      currentPage++;
    }

    return allTemplates;
  }

  /**
   * Fetch workouts since a specific date
   * Note: Hevy API returns workouts newest-first, so we fetch pages until we hit the date threshold
   */
  async getWorkoutsSince(sinceDate: Date): Promise<HevyApiWorkout[]> {
    const workouts: HevyApiWorkout[] = [];
    let currentPage = 1;
    let shouldContinue = true;

    while (shouldContinue) {
      const response = await this.getWorkouts(currentPage, 50);

      for (const workout of response.workouts) {
        const workoutDate = new Date(workout.start_time);

        if (workoutDate >= sinceDate) {
          workouts.push(workout);
        } else {
          // Workouts are sorted newest-first, so we can stop when we hit an older one
          shouldContinue = false;
          break;
        }
      }

      // If we've processed all pages, stop
      if (currentPage >= response.page_count) {
        shouldContinue = false;
      }

      currentPage++;
    }

    return workouts;
  }
}

/**
 * Create a Hevy client instance
 */
export function createHevyClient(apiKey?: string): HevyClient {
  return new HevyClient(apiKey);
}
