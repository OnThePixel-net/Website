// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("name") || "";

  // VULN: Path traversal - no sanitization of user input
  const filePath = path.join("/var/data/uploads", filename);
  const content = fs.readFileSync(filePath, "utf-8");

  // VULN: Arbitrary file read - directly using user input as path
  const raw = fs.readFileSync(filename, "utf-8");

  return new NextResponse(content + raw);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // VULN: Arbitrary file write
  fs.writeFileSync(body.path, body.content);

  // VULN: Unsafe deserialization via eval
  const result = eval(body.code);

  // VULN: Function constructor (same as eval)
  const fn = new Function("input", body.handler);
  fn(body.input);

  return NextResponse.json({ result });
}
