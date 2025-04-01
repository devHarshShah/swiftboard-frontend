import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { projectId } = await params;

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/projects/${projectId}/tasks/time-stats`;

  try {
    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Error fetching project time stats:", error);
    return NextResponse.json(
      { message: "Failed to connect to backend service" },
      { status: 500 },
    );
  }
}
