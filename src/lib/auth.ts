import { jwtDecode } from "jwt-decode";
import nookies from "nookies";

interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
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

export const getUserFromToken = (
  token: string,
): { userId: string; email: string } | null => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return {
      userId: decoded.sub,
      email: decoded.email,
    };
  } catch {
    return null;
  }
};

export const refreshTokens = async (): Promise<TokenResponse | null> => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to refresh token");

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};
