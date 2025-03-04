import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } },
) {
  const { projectId, taskId } = await params; // Extract projectId and taskId from URL params

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

  const { status } = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/tasks/${taskId}/move`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message },
      { status: response.status },
    );
  }

  return NextResponse.json(data);
}
