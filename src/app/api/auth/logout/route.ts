import { NextResponse } from "next/server";
import { getAccessToken } from "@/src/lib/auth";

export async function POST() {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      // Already logged out, just clear cookies
      const response = NextResponse.json({ success: true });
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Call the backend logout endpoint
    const backendResponse = await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Even if the backend fails, we'll still clear cookies on the client
    const response = NextResponse.json({
      success: backendResponse.ok,
      message: backendResponse.ok
        ? "Logged out successfully"
        : "Backend logout failed but cookies cleared",
    });

    // Clear cookies
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear cookies even if there's an error
    const response = NextResponse.json(
      { success: false, error: "Failed to logout but cookies cleared" },
      { status: 500 },
    );

    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  }
}
