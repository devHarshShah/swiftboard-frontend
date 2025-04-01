import { jwtDecode } from "jwt-decode";
import nookies from "nookies";

interface TokenPayload {
  exp: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const getAccessToken = (): string | null => {
  const cookies = nookies.get();
  const accessToken = cookies.access_token;

  if (!accessToken) return null;

  return accessToken;
};

export const refreshTokens = async (): Promise<TokenResponse | null> => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to refresh token");

    const data: TokenResponse = await response.json();

    return data;
  } catch (error) {
    console.error("Token refresh failed:", error);

    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};
