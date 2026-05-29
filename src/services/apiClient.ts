import axios from 'axios';
import { GeminiParseResponse } from '../types/routes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export interface GeminiParseRequest {
  text: string;
  language?: string;
}

export async function parseRouteWithAI(
  request: GeminiParseRequest
): Promise<GeminiParseResponse> {
  try {
    const response = await apiClient.post<GeminiParseResponse>(
      '/gemini/parse',
      request
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
        `Failed to parse route: ${error.message}`
      );
    }
    throw error;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await apiClient.get('/health');
    return true;
  } catch {
    return false;
  }
}

export default apiClient;
