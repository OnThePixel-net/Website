import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log(`Received ${req.method} request`);

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
    console.error("Error fetching team members:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch team members", details: errorMessage },
      { status: 500 }
    );
  }
}
