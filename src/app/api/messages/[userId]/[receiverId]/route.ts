import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; receiverId: string }> },
) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication token is missing" },
        { status: 401 },
      );
    }

    let userId, receiverId;
    try {
      const resolvedParams = await params;
      userId = resolvedParams.userId;
      receiverId = resolvedParams.receiverId;
    } catch (error) {
      console.error("Error extracting route parameters:", error);
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 },
      );
    }

    if (!userId || !receiverId) {
      return NextResponse.json(
        { error: "User ID and Receiver ID are required" },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    const response = await fetch(
      `${baseUrl}/chat/messages?userId1=${userId}&userId2=${receiverId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      let errorMessage = `Failed to fetch messages: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {}

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const messages = await response.json();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to retrieve messages", details: message },
      { status: 500 },
    );
  }
}
