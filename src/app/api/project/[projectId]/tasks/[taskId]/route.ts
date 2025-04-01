import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> },
) {
  try {
    const { projectId, taskId } = await params;

    if (!projectId || !taskId) {
      return NextResponse.json(
        { error: "Project ID and Task ID are required" },
        { status: 400 },
      );
    }

    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestData;
    try {
      requestData = await request.json();
      const { status } = requestData;
      if (!status) {
        return NextResponse.json(
          { error: "Status is required" },
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

    const response = await fetch(
      `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}/move`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      },
    );

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing task update response:", e);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 },
      );
    }

    if (!response.ok) {
      console.error("Task update API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to update task status" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error moving task:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update task", details: message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> },
) {
  try {
    const { projectId, taskId } = await params;

    if (!projectId || !taskId) {
      return NextResponse.json(
        { error: "Project ID and Task ID are required" },
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

    const response = await fetch(
      `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 204) {
      return NextResponse.json({ message: "Task deleted successfully" });
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing task deletion response:", e);
      return NextResponse.json(
        { error: `Failed to delete task: ${response.statusText}` },
        { status: response.status },
      );
    }

    if (!response.ok) {
      console.error("Task deletion API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to delete task" },
        { status: response.status },
      );
    }

    return NextResponse.json(data || { message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete task", details: message },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> },
) {
  try {
    const { projectId, taskId } = await params;

    if (!projectId || !taskId) {
      return NextResponse.json(
        { error: "Project ID and Task ID are required" },
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

    const response = await fetch(
      `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      },
    );

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing task update response:", e);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 },
      );
    }

    if (!response.ok) {
      console.error("Task update API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to update task" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating project task:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update task", details: message },
      { status: 500 },
    );
  }
}
