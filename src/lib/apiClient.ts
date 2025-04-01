import { getAccessToken, refreshTokens, isTokenExpired } from "./auth";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = async (
  url: string,
  options: FetchOptions = {},
): Promise<Response> => {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (requireAuth) {
    const token = await getAccessToken();

    if (token) {
      if (isTokenExpired(token)) {
        const newTokens = await refreshTokens();
        if (newTokens) {
          headers.set("Authorization", `Bearer ${newTokens.access_token}`);
        } else {
          throw new Error("Authentication required");
        }
      } else {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } else {
      const newTokens = await refreshTokens();
      if (newTokens) {
        headers.set("Authorization", `Bearer ${newTokens.access_token}`);
      } else {
        throw new Error("Authentication required");
      }
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

  if (response.status === 401 && requireAuth) {
    try {
      const newTokens = await refreshTokens();

      if (newTokens) {
        const retryHeaders = new Headers(fetchOptions.headers);
        retryHeaders.set("Authorization", `Bearer ${newTokens.access_token}`);

        return fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
          credentials: "include",
        });
      } else {
        throw new Error("Session expired. Please login again.");
      }
    } catch {
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};
