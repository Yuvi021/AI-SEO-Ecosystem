import { API_URL } from './constants';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Make authenticated API request
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear auth and redirect to login
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
}

// Helper functions for common API calls
export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

