import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let token;
    try {
      const body = await request.json();
      token = body.token;

      if (!token) {
        return NextResponse.json(
          { error: "Invitation token is required" },
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

    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/invitations/${token}/accept`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to accept invitation" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error accepting team invitation:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to process invitation", details: message },
      { status: 500 },
    );
  }
}
