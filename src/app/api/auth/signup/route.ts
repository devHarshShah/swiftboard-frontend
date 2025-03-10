import { NextResponse } from "next/server";
import nookies from "nookies";

export async function POST(request: Request) {
  const { email, name, password, confirmPassword } = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password, confirmPassword }),
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
  nookies.set({ res }, "access_token", data.accessToken, {
    maxAge: 15 * 60, // 30 days
    path: "/",
  });

  nookies.set({ res }, "refresh_token", data.refreshToken, {
    maxAge: 7 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return res;
}
