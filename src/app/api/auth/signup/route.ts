import { NextResponse } from "next/server";
import nookies from "nookies";

export async function POST(request: Request) {
  try {
    let email, name, password, confirmPassword;

    try {
      const body = await request.json();
      email = body.email;
      name = body.name;
      password = body.password;
      confirmPassword = body.confirmPassword;

      if (!email || !name || !password || !confirmPassword) {
        return NextResponse.json(
          { error: "Email, name, password and confirmation are required" },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("API base URL is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const response = await fetch(`${apiBaseUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Signup API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Signup failed" },
        { status: response.status },
      );
    }

    const res = NextResponse.json(data);

    nookies.set({ res }, "access_token", data.accessToken, {
      maxAge: 15 * 60,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    nookies.set({ res }, "refresh_token", data.refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res;
  } catch (error) {
    console.error("Error during signup:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create account", details: message },
      { status: 500 },
    );
  }
}
