import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { name, teamId } = await request.json();
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, teamId }),
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
