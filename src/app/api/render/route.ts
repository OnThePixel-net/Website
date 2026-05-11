// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "guest";
  const html = searchParams.get("html") || "";

  // VULN: Reflected XSS - user input written directly into HTML response
  const body = `
    <html>
      <body>
        <h1>Hello ${name}</h1>
        <div>${html}</div>
        <script>var user = "${name}";</script>
      </body>
    </html>
  `;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/html",
      // VULN: No CSP, no X-Frame-Options, no X-Content-Type-Options
    },
  });
}
