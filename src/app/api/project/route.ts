import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let name, teamId;

    try {
      const body = await request.json();
      name = body.name;
      teamId = body.teamId;

      if (!name || !teamId) {
        return NextResponse.json(
          { error: "Project name and team ID are required" },
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

    const response = await fetch(`${apiBaseUrl}/projects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, teamId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Project creation API error:", response.status, data);
      return NextResponse.json(
        { error: data.message || "Failed to create project" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating project:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create project", details: message },
      { status: 500 },
    );
  }
}
