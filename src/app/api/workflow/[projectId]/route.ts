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
      const { name, nodes, edges } = workflowData;

      if (!name) {
        return NextResponse.json(
          { error: "Workflow name is required" },
          { status: 400 },
        );
      }

      if (!nodes || !Array.isArray(nodes)) {
        return NextResponse.json(
          { error: "Workflow nodes are required" },
          { status: 400 },
        );
      }

      if (!edges || !Array.isArray(edges)) {
        return NextResponse.json(
          { error: "Workflow edges are required" },
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

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${baseUrl}/workflow/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(workflowData),
      });

      // Handle different response types
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Non-JSON error response:", e);
          return NextResponse.json(
            { error: `Failed to save workflow: ${response.statusText}` },
            { status: response.status },
          );
        }

        console.error("Workflow save error:", response.status, errorData);
        return NextResponse.json(
          { error: errorData.message || "Failed to save workflow" },
          { status: response.status },
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Error parsing workflow save response:", e);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 },
        );
      }

      return NextResponse.json(data);
    } catch (networkError) {
      console.error("Network error saving workflow:", networkError);
      return NextResponse.json(
        { error: "Failed to connect to workflow service" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Error saving workflow:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}

export async function GET(
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

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${baseUrl}/workflow/${projectId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle different response types
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Non-JSON error response:", e);
          return NextResponse.json(
            { error: `Failed to fetch workflows: ${response.statusText}` },
            { status: response.status },
          );
        }

        console.error("Workflow fetch error:", response.status, errorData);
        return NextResponse.json(
          { error: errorData.message || "Failed to fetch workflows" },
          { status: response.status },
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Error parsing workflows response:", e);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 },
        );
      }

      return NextResponse.json(data);
    } catch (networkError) {
      console.error("Network error fetching workflows:", networkError);
      return NextResponse.json(
        { error: "Failed to connect to workflow service" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Error fetching workflows:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}

export async function PUT(
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
      const { name, nodes, edges } = workflowData;

      if (!name) {
        return NextResponse.json(
          { error: "Workflow name is required" },
          { status: 400 },
        );
      }

      if (!nodes || !Array.isArray(nodes)) {
        return NextResponse.json(
          { error: "Workflow nodes are required" },
          { status: 400 },
        );
      }

      if (!edges || !Array.isArray(edges)) {
        return NextResponse.json(
          { error: "Workflow edges are required" },
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

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${baseUrl}/workflow/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(workflowData),
      });

      // Handle different response types
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Non-JSON error response:", e);
          return NextResponse.json(
            { error: `Failed to update workflow: ${response.statusText}` },
            { status: response.status },
          );
        }

        console.error("Workflow update error:", response.status, errorData);
        return NextResponse.json(
          { error: errorData.message || "Failed to update workflow" },
          { status: response.status },
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Error parsing workflow update response:", e);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 },
        );
      }

      return NextResponse.json(data);
    } catch (networkError) {
      console.error("Network error updating workflow:", networkError);
      return NextResponse.json(
        { error: "Failed to connect to workflow service" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Error updating workflow:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}
