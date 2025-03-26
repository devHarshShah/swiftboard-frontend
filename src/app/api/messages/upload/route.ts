import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Extract the form data from the request
    const formData = await request.formData();

    // Extract the required fields from the form data
    const file = formData.get("file");
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");

    // Validate required fields
    if (!file || !senderId || !receiverId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create a new FormData to forward to the backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("senderId", senderId.toString());
    backendFormData.append("receiverId", receiverId.toString());

    // Get backend URL from environment variables
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    console.log(`Sending file upload to ${backendUrl}/chat/upload`);

    console.log(backendFormData);

    // Forward the request to your backend
    const backendResponse = await fetch(`${backendUrl}/chat/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    // Check if the backend request was successful
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend upload error:", errorText);

      return NextResponse.json(
        { error: "Upload failed in backend service" },
        { status: backendResponse.status },
      );
    }

    // Return the successful response
    const responseData = await backendResponse.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in file upload handler:", error);
    return NextResponse.json(
      { error: "Internal server error processing upload" },
      { status: 500 },
    );
  }
}
