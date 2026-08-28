import { apiClient } from './client';
import type { SamMessage, SamStatus } from '../types/api';

export interface AskSamParams {
  query: string;
  sessionId?: string;
}

export const samApi = {
  /**
   * Retrieves truthful LLM Provider status from the backend.
   * Endpoint: /api/sam/status (apiClient prepends /api)
   */
  async getStatus(): Promise<SamStatus> {
    try {
      return await apiClient<SamStatus>('/sam/status', { skipAuth: true });
    } catch {
      return {
        isConfigured: false,
        provider: 'unknown',
        model: 'unknown',
        requiredEnvVar: 'GEMINI_API_KEY',
        status: 'Setup Required',
      };
    }
  },

  /**
   * Dispatches analytics prompt to backend SAM agent which runs controlled
   * database analytics tools and passes structured results to LLM.
   */
  async askSam(params: AskSamParams): Promise<SamMessage> {
    return apiClient<SamMessage>('/sam/query', {
      method: 'POST',
      body: JSON.stringify({
        query: params.query,
        session_id: params.sessionId,
      }),
    });
  },
};
