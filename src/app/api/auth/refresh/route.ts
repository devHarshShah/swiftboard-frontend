import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

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

  res.cookies.set("access_token", data.accessToken, {
    maxAge: 15 * 60, // 30 days
    path: "/",
  });

  res.cookies.set("refresh_token", data.refreshToken, {
    maxAge: 7 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return res;
}
