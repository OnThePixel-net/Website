import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const teamMembers = await prisma.team.findMany({
      select: {
        minecraft_name: true,
        discord_name: true,
        role: true,
      },
    });
    return NextResponse.json(teamMembers, { status: 200 });
  } catch (error) {
    error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: 500 });
  }
}
