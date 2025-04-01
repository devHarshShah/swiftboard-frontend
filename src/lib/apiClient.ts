import { getAccessToken, refreshTokens, isTokenExpired, logout } from "./auth";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

// Track whether a refresh is in progress to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshPromise: Promise<Awaited<ReturnType<typeof refreshTokens>>> | null =
  null;

export const apiClient = async (
  url: string,
  options: FetchOptions = {},
): Promise<Response> => {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (requireAuth) {
    try {
      // Get the current token
      const token = getAccessToken();

      // If no token exists or it's expired, try to refresh before continuing
      if (!token || isTokenExpired(token)) {
        const newTokens = await getValidTokens();
        if (newTokens) {
          headers.set("Authorization", `Bearer ${newTokens.accessToken}`);
        } else {
          throw new Error("Authentication required");
        }
      } else {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {
      // If we can't get a valid token, require authentication
      throw new Error("Authentication required");
    }
  }

  if (!headers.has("Content-Type") && !url.includes("/upload")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  // Handle 401 responses by attempting to refresh the token and retry
  if (response.status === 401 && requireAuth) {
    try {
      const newTokens = await getValidTokens();

      if (newTokens) {
        const retryHeaders = new Headers(fetchOptions.headers);
        retryHeaders.set("Authorization", `Bearer ${newTokens.accessToken}`);

        return fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
          credentials: "include",
        });
      } else {
        // If refresh fails, force logout and throw error
        await logout();
        throw new Error("Session expired. Please login again.");
      }
    } catch {
      // If refresh fails, force logout and throw error
      await logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};

// Helper function to get valid tokens, using a shared refresh promise to prevent multiple refreshes
async function getValidTokens() {
  // If there's no refresh in progress, start one
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshTokens();

    // Reset the refreshing state after completion
    refreshPromise.finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }

  // Return the current refresh promise (whether we just created it or not)
  return refreshPromise;
}
