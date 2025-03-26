import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; receiverId: string }> },
) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    const { userId, receiverId } = await params;

    // Make sure both IDs are provided
    if (!userId || !receiverId) {
      return NextResponse.json(
        { error: "User ID and Receiver ID are required" },
        { status: 400 },
      );
    }

    // Call the backend API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

    // Handle error responses from the backend
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch messages" },
        { status: response.status },
      );
    }

    // Return the messages
    const messages = await response.json();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
