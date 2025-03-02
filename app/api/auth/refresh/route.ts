import { NextRequest, NextResponse } from "next/server";
import nookies from "nookies";

export async function POST(request: NextRequest) {
  const cookies = nookies.get({ req: request });
  const refreshToken = cookies.refresh_token;

  if (!refreshToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message },
      { status: response.status },
    );
  }

  const res = NextResponse.json(data);

  // Set the new access_token in cookies

  nookies.set({ res }, "access_token", data.accessToken, {
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  nookies.set({ res }, "refresh_token", data.refreshToken, {
    maxAge: 7 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return res;
}
