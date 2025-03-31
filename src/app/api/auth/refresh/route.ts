import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("API base URL is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // The backend expects the refresh token in the Authorization header as Bearer token
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    // Handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing refresh token response:", e);
      return NextResponse.json(
        { error: "Invalid response from authentication server" },
        { status: 500 },
      );
    }

    if (!response.ok) {
      console.error("Token refresh API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Token refresh failed" },
        { status: response.status },
      );
    }

    const res = NextResponse.json({
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    });

    // Set the new access_token in cookies
    res.cookies.set("access_token", data.accessToken, {
      maxAge: 15 * 60, // 15 minutes
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookies.set("refresh_token", data.refreshToken, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res;
  } catch (error) {
    console.error("Token refresh error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to refresh authentication token", details: message },
      { status: 500 },
    );
  }
}
