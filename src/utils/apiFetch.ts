const getBaseUrl = () => {
  const currentUrl = window.location.origin;

  if (currentUrl.includes("localhost")) {
    return "https://localhost:7152";
  } else {
    const url = new URL(currentUrl);
    const hostname = url.hostname;

    // Check if hostname matches pattern: tenant.sentryapp.io
    const sentryAppPattern = /^([^.]+)\.sentryapp\.io$/;
    const match = hostname.match(sentryAppPattern);

    if (match) {
      // Extract tenant and construct API URL: tenant.api.sentryapp.io
      const tenant = match[1];
      return `${url.protocol}//${tenant}.api.sentryapp.io`;
    }

    // Fallback for other domains (keep original behavior)
    return `${url.protocol}//${url.host}`;
  }
};

const apiUrl = new URL(getBaseUrl());
const devApiBaseHost = apiUrl.hostname;
const PORT = 7152;
const devApiBaseUrl = `${apiUrl.protocol}//${devApiBaseHost}:${PORT}`;

// In dev: relative path so Vite proxy handles it (no CORS). In prod: use dynamic base URL.
export const API_BASE_URL = import.meta.env.DEV ? '/api' : `${getBaseUrl()}/api`;

// Define the types for options and configuration
type FetchOptions = RequestInit;

export class FetchApiError extends Error {
  status: number;

  data: unknown;

  constructor(status: number, data: unknown) {
    super(`FetchApiError: ${status}`);
    this.status = status;
    this.data = data;
  }
}

// Global headers configuration
export const globalHeaders: Record<string, string> = {};

// Function to update global headers
export const setGlobalHeaders = (newHeaders: Record<string, string>) => {
  Object.assign(globalHeaders, newHeaders);
};

export const removeGlobalHeaders = (headerKeys: string[]) => {
  headerKeys.forEach((key) => {
    delete globalHeaders[key];
  });
};

// Main apiFetch function with interceptors and type safety
const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const { headers, ...restOptions } = options;
  const method = restOptions.method || "GET";
  // Set default headers, including global headers
  const config: FetchOptions = {
    headers: {
      ...globalHeaders,
      ...headers,
      // Solo agrega Content-Type si no es FormData
      ...(method !== "GET" &&
        !(options.body instanceof FormData) && {
          "Content-Type": "application/json",
        }),
    },
    ...restOptions,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new FetchApiError(response.status, await response.json());
    }

    return response;
  } catch (error) {
    console.error("Error in apiFetch:", error);
    throw error;
  }
};

export default apiFetch;
