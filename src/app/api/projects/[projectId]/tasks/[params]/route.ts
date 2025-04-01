import { NextRequest, NextResponse } from "next/server";

// Helper function to build the backend URL
async function handleRequest(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; params?: string[] }> },
) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { projectId, params: pathParams } = await params;

  // Build the backend URL based on the request path
  let backendPath = `/projects/${projectId}/tasks`;

  if (pathParams && Array.isArray(pathParams)) {
    backendPath += `/${pathParams.join("/")}`;
  }

  // Handle query parameters
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  if (searchParams) {
    backendPath += `?${searchParams}`;
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${backendPath}`;

  try {
    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? await req.json()
          : undefined,
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Error proxying request to backend:", error);
    return NextResponse.json(
      { message: "Failed to connect to backend service" },
      { status: 500 },
    );
  }
}

// Export specific HTTP methods
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string; params?: string[] }> },
) {
  return handleRequest(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ projectId: string; params?: string[] }> },
) {
  return handleRequest(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ projectId: string; params?: string[] }> },
) {
  return handleRequest(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ projectId: string; params?: string[] }> },
) {
  return handleRequest(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ projectId: string; params?: string[] }> },
) {
  return handleRequest(req, context);
}
