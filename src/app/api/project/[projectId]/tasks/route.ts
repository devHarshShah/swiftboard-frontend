import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    // Await the params Promise
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
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

    const response = await fetch(`${apiBaseUrl}/projects/${projectId}/tasks`, {
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
      console.error("Error parsing tasks response:", e);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 },
      );
    }

    if (!response.ok) {
      console.error("Tasks API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to fetch project tasks" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch project tasks", details: message },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    // Await the params Promise
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let taskData;
    try {
      taskData = await request.json();
      const { name } = taskData;
      if (!name) {
        return NextResponse.json(
          { error: "Task name is required" },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("API base URL is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const response = await fetch(`${apiBaseUrl}/projects/${projectId}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    // Handle potential non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing task creation response:", e);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 },
      );
    }

    if (!response.ok) {
      console.error("Task creation API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to create task" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating project task:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create task", details: message },
      { status: 500 },
    );
  }
}
