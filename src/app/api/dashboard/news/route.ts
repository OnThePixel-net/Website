import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listNews, createNews } from "@/lib/directus";

async function checkAuth() {
  const session = await auth();
  if (!session) return false;
  return true;
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await listNews();
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const item = await createNews(body);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
