// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️
// DO NOT MERGE TO PRODUCTION

import { NextRequest, NextResponse } from "next/server";

// VULN: Hardcoded admin credentials in source code
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "SuperSecret123!";
const API_KEY = "sk_" + "live_" + "FAKEadminApiKeyForSecurityTest";
const DATABASE_URL = "postgres://root:hunter2@db.internal:5432/prod";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // VULN: Authentication bypass via header check that can be spoofed
  const isAdmin = req.headers.get("x-is-admin") === "true";

  // VULN: Plain text password comparison, no hashing, timing attack
  if (body.username === ADMIN_USER && body.password === ADMIN_PASSWORD) {
    // VULN: Sensitive data leaked in response
    return NextResponse.json({
      success: true,
      apiKey: API_KEY,
      dbUrl: DATABASE_URL,
      token: Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString("base64"),
    });
  }

  // VULN: No rate limiting, no CSRF protection
  if (isAdmin) {
    return NextResponse.json({ ok: true, key: API_KEY });
  }

  return NextResponse.json({ ok: false });
}

// VULN: GET endpoint exposes all environment variables
export async function GET() {
  return NextResponse.json({
    env: process.env,
    secrets: {
      stripe: "sk_" + "live_" + "FAKEstripeKeyForSecurityTest",
      jwt: "my-jwt-secret-shhh",
    },
  });
}
