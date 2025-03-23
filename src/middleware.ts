import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get cookies from the request
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Check if the request is for a dashboard route
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // If it's a dashboard route and tokens are missing, redirect to login
  if (isDashboardRoute && (!accessToken || !refreshToken)) {
    // Create the URL to redirect to
    const loginUrl = new URL("/auth/login", request.url);

    // Add the original URL as a parameter for redirecting back after login
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

    // Redirect to login page
    return NextResponse.redirect(loginUrl);
  }

  // Continue with the request if authentication passes or it's not a protected route
  return NextResponse.next();
}

// Configure middleware to run only on dashboard routes
export const config = {
  matcher: [
    "/dashboard/:path*", // Match all dashboard routes
  ],
};
