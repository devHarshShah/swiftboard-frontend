// lib/apiClient.ts
import { getAccessToken, refreshTokens, isTokenExpired } from "./auth";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = async (
  url: string,
  options: FetchOptions = {},
): Promise<Response> => {
  const { requireAuth = true, ...fetchOptions } = options;

  // Clone headers to avoid mutation
  const headers = new Headers(fetchOptions.headers);

  // Add auth header if required
  if (requireAuth) {
    const token = await getAccessToken();

    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Try to refresh immediately
        const newTokens = await refreshTokens();
        if (newTokens) {
          headers.set("Authorization", `Bearer ${newTokens.access_token}`);
        } else {
          throw new Error("Authentication required");
        }
      } else {
        // Token is valid, use it
        headers.set("Authorization", `Bearer ${token}`);
      }
    } else {
      // No token available, try refresh once
      const newTokens = await refreshTokens();
      if (newTokens) {
        headers.set("Authorization", `Bearer ${newTokens.access_token}`);
      } else {
        throw new Error("Authentication required");
      }
    }
  }

  // Add default headers
  if (!headers.has("Content-Type") && !url.includes("/upload")) {
    headers.set("Content-Type", "application/json");
  }

  // Make the API request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include", // Important for cookies
  });

  // Handle 401 Unauthorized errors (token expired or invalid)
  if (response.status === 401 && requireAuth) {
    // Try to refresh the token
    try {
      const newTokens = await refreshTokens();

      // If refresh successful, retry the original request
      if (newTokens) {
        // Create a new headers object for the retry request
        const retryHeaders = new Headers(fetchOptions.headers);
        retryHeaders.set("Authorization", `Bearer ${newTokens.access_token}`);

        return fetch(url, {
          ...fetchOptions,
          headers: retryHeaders, // Use the updated headers
          credentials: "include",
        });
      } else {
        // If refresh failed, throw an error or redirect to login
        throw new Error("Session expired. Please login again.");
      }
    } catch {
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};
