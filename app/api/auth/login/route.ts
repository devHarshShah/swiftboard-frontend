import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
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

  // Set cookies
  res.cookies.set("access_token", data.accessToken, {
    httpOnly: true,
    maxAge: 15 * 60, // 30 days
    path: "/",
  });

  res.cookies.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return res;
}
