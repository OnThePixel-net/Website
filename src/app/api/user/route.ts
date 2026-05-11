// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// VULN: Hardcoded secret
const JWT_SECRET = "secret";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // VULN: Weak crypto - MD5 for passwords
  const passwordHash = crypto.createHash("md5").update(body.password).digest("hex");

  // VULN: SHA1 for tokens
  const token = crypto.createHash("sha1").update(body.username + Date.now()).digest("hex");

  // VULN: Math.random for security-sensitive token
  const resetToken = Math.random().toString(36).slice(2);

  // VULN: ECB mode - leaks patterns
  const cipher = crypto.createCipheriv(
    "aes-128-ecb",
    Buffer.from("1234567890123456"),
    null,
  );

  // VULN: Prototype pollution - merging user input into object
  const config: any = {};
  for (const key in body) {
    config[key] = body[key];
  }
  Object.assign(config, body);

  // VULN: IDOR - directly trusts user-supplied id with no auth check
  const userId = body.userId;
  const userData = { id: userId, hash: passwordHash, token, resetToken };

  return NextResponse.json(userData);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // VULN: No authentication, no authorization check
  // Any user can delete any account by passing id parameter
  console.log(`Deleting user ${id}`);
  return NextResponse.json({ deleted: id });
}
