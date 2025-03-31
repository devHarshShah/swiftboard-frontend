import { jwtDecode } from "jwt-decode";
import nookies from "nookies";

interface TokenPayload {
  exp: number;
  // Add other payload fields as needed
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

// Utility to check if access token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true; // If we can't decode the token, consider it expired
  }
};

// Get access token (with auto refresh if needed)
export const getAccessToken = (): string | null => {
  const cookies = nookies.get();
  const accessToken = cookies.access_token;

  // Simply return whatever we have - don't try to refresh here
  if (!accessToken) return null;

  // If token is explicitly expired, still return it
  // The apiClient will handle the refresh if needed
  return accessToken;
};

// Refresh tokens function
export const refreshTokens = async (): Promise<TokenResponse | null> => {
  try {
    // Remove the cookie access attempt - the API route will handle this
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // Important for sending cookies
    });

    if (!response.ok) throw new Error("Failed to refresh token");

    const data: TokenResponse = await response.json();
    // The cookies should be set by the API route
    return data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    // No need to clear cookies here as they're HTTP-only and managed by the server
    return null;
  }
};

// Logout function - this will call the API to clear the cookies
export const logout = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
  // You might want to redirect to login page
};
