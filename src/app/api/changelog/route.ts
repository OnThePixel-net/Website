import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export default async function handler(req: NextRequest) {
  try {
    const changelog = await prisma.changelog.findMany();
    return NextResponse.json(changelog, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch changelog" },
      { status: 500 }
    );
  }
}
