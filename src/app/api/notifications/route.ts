import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${baseUrl}/notification`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    });

    // Handle potential non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing notifications response:", e);
      return NextResponse.json(
        { error: "Invalid response from notifications server" },
        { status: 500 },
      );
    }

    if (!response.ok) {
      console.error("Notifications API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to fetch notifications" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: message },
      { status: 500 },
    );
  }
}
