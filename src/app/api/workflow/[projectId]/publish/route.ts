import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token" },
        { status: 401 },
      );
    }

    let workflowData;
    try {
      workflowData = await request.json();
      if (!workflowData || Object.keys(workflowData).length === 0) {
        return NextResponse.json(
          { error: "Workflow data is required" },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid workflow data format" },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${baseUrl}/workflow/${projectId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Non-JSON error response:", e);
          return NextResponse.json(
            { error: `Failed to publish workflow: ${response.statusText}` },
            { status: response.status },
          );
        }

        console.error("Workflow publish error:", response.status, errorData);
        return NextResponse.json(
          { error: errorData.message || "Failed to publish workflow" },
          { status: response.status },
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Error parsing workflow publish response:", e);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 },
        );
      }

      return NextResponse.json(data);
    } catch (networkError) {
      console.error("Network error publishing workflow:", networkError);
      return NextResponse.json(
        { error: "Failed to connect to workflow service" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Error publishing workflow:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}
