import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  try {
    const { attachmentId } = await params;

    if (!attachmentId) {
      return NextResponse.json(
        { error: "Attachment ID is required" },
        { status: 400 },
      );
    }

    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get backend URL from environment variables
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    if (!backendUrl) {
      console.error("API URL is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    console.log(
      `Fetching attachment from ${backendUrl}/chat/attachments/${attachmentId}`,
    );

    // Get pre-signed URL from backend
    const response = await fetch(
      `${backendUrl}/chat/attachments/${attachmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Handle different response types
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || response.statusText;
      } catch {
        // If the response isn't JSON
        const errorText = await response.text();
        console.error("Backend attachment error:", errorText);
        errorMessage = response.statusText;
      }

      return NextResponse.json(
        { error: `Failed to get attachment URL: ${errorMessage}` },
        { status: response.status },
      );
    }

    // Handle potential non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing attachment response:", e);
      return NextResponse.json(
        { error: "Invalid response format from server" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Attachment URL fetch error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to get attachment URL",
        details: message,
      },
      { status: 500 },
    );
  }
}
