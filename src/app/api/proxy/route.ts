// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || "";

  // VULN: SSRF - fetches any URL provided by user, including internal services
  // Attackers can reach 169.254.169.254 (cloud metadata), localhost, internal networks
  const response = await fetch(url);
  const data = await response.text();

  return new NextResponse(data, {
    headers: {
      // VULN: CORS wildcard with credentials
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      // VULN: Reflects user-controlled origin
      "X-Reflected-Origin": req.headers.get("origin") || "",
    },
  });
}
