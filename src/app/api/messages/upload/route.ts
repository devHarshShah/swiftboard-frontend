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

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("Error parsing form data:", error);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");

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

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("senderId", senderId.toString());
    backendFormData.append("receiverId", receiverId.toString());

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    console.log(`Sending file upload to ${backendUrl}/chat/upload`);
    console.log(backendFormData);

    try {
      const backendResponse = await fetch(`${backendUrl}/chat/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      });

      if (!backendResponse.ok) {
        let errorMessage = `Upload failed (${backendResponse.status}): ${backendResponse.statusText}`;

        try {
          const errorData = await backendResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          try {
            const errorText = await backendResponse.text();
            console.error("Backend upload error:", errorText);
            if (errorText) errorMessage = errorText;
          } catch {}
        }

        console.error("File upload failed:", errorMessage);
        return NextResponse.json(
          { error: errorMessage },
          { status: backendResponse.status },
        );
      }

      let responseData;
      try {
        responseData = await backendResponse.json();
      } catch (e) {
        console.error("Error parsing upload response:", e);

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
