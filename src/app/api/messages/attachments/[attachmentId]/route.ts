import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  try {
    const { attachmentId } = await params;

    if (!attachmentId) {
      return NextResponse.json(
        { message: "Attachment ID is required" },
        { status: 400 },
      );
    }

    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    // Get backend URL from environment variables
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend attachment error:", errorText);

      return NextResponse.json(
        { message: `Failed to get attachment URL: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Attachment URL fetch error:", error);
    return NextResponse.json(
      {
        message: "Failed to get attachment URL",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
