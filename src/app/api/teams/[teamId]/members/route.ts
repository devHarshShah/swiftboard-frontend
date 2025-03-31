import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    // Await the params Promise
    const { teamId } = await params;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
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

    const response = await fetch(`${apiBaseUrl}/teams/${teamId}/members`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Handle potential non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing team members response:", e);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 },
      );
    }

    if (!response.ok) {
      console.error("Team members API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to fetch team members" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching team members:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch team members", details: message },
      { status: 500 },
    );
  }
}
