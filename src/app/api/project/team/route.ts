import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filterByRole = url.searchParams.get("filterByRole");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/?filterByRole=${filterByRole}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
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
