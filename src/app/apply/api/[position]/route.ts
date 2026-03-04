import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const POSITION_NAMES: Record<string, string> = {
  developer: "Java Developer",
  builder: "Builder",
  supporter: "Supporter",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ position: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { position } = await params;
  const positionName = POSITION_NAMES[position];

  if (!positionName) {
    return NextResponse.json({ message: "Invalid position" }, { status: 400 });
  }

  const body = await req.json();

  // Forward to external API with verified Discord identity from session.
  // Discord ID and username are taken from the server-side session —
  // they cannot be spoofed by the client.
  const response = await fetch(`https://api.onthepixel.net/apply/${position}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      position: positionName,
      applicationData: body.applicationData,
      discord: {
        id: session.user.discordId,
        username: session.user.name,
        avatar: session.user.image,
      },
      captchaToken: body.captchaToken,
      submittedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Submission failed" }));
    return NextResponse.json(err, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
