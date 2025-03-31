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
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("Error parsing form data:", error);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    // Extract the required fields from the form data
    const file = formData.get("file");
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!senderId) {
      return NextResponse.json(
        { error: "Sender ID is required" },
        { status: 400 },
      );
    }

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
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

    try {
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
        let errorMessage = `Upload failed (${backendResponse.status}): ${backendResponse.statusText}`;

        try {
          const errorData = await backendResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If not JSON, try to get text
          try {
            const errorText = await backendResponse.text();
            console.error("Backend upload error:", errorText);
            if (errorText) errorMessage = errorText;
          } catch {
            // If we can't get text either, use the default message
          }
        }

        console.error("File upload failed:", errorMessage);
        return NextResponse.json(
          { error: errorMessage },
          { status: backendResponse.status },
        );
      }

      // Parse and return successful response
      let responseData;
      try {
        responseData = await backendResponse.json();
      } catch (e) {
        console.error("Error parsing upload response:", e);
        // If we can't parse JSON but the request was successful, return a generic success
        if (backendResponse.ok) {
          return NextResponse.json({
            message: "File uploaded successfully",
            status: "success",
          });
        } else {
          return NextResponse.json(
            { error: "Invalid response from server" },
            { status: 500 },
          );
        }
      }

      return NextResponse.json(responseData);
    } catch (networkError) {
      console.error("Network error during file upload:", networkError);
      return NextResponse.json(
        { error: "Failed to connect to file upload service" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Error in file upload handler:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error processing upload", details: message },
      { status: 500 },
    );
  }
}
