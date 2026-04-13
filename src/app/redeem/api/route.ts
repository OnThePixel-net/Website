import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  const body = await req.json();

  if (!body.code?.trim()) {
    return NextResponse.json({ message: "Code is required" }, { status: 400 });
  }

  if (!body.minecraftUsername?.trim()) {
    return NextResponse.json({ message: "Minecraft username is required" }, { status: 400 });
  }

  if (!body.captchaToken) {
    return NextResponse.json({ message: "Captcha token is required" }, { status: 400 });
  }

  // Discord identity is optional. If the user is logged in, attach verified
  // Discord data from the server-side session (cannot be spoofed by the client).
  const discord = session?.user
    ? {
        id: session.user.discordId,
        username: session.user.name,
        avatar: session.user.image,
      }
    : undefined;

  const response = await fetch("https://api.onthepixel.net/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: body.code.trim(),
      minecraftUsername: body.minecraftUsername.trim(),
      ...(discord && { discord }),
      captchaToken: body.captchaToken,
      submittedAt: new Date().toISOString(),
    }),
  });

  const rawText = await response.text().catch(() => "");

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawText);
  } catch {
    // External API returned non-JSON — surface status and raw body for debugging
    return NextResponse.json(
      { message: `External API error (${response.status})`, raw: rawText },
      { status: response.status || 502 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
