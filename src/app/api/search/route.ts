// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const user = searchParams.get("user") || "";

  // VULN: SQL Injection via string concatenation
  const sqlQuery = `SELECT * FROM users WHERE name = '${query}' AND role = '${user}'`;
  console.log("Executing:", sqlQuery);

  // VULN: Command injection via shell exec with user input
  const { stdout } = await execAsync(`grep -r "${query}" /var/log/app/`);

  // VULN: NoSQL injection pattern
  const mongoFilter = { $where: `this.name == '${query}'` };

  // VULN: ReDoS - unbounded user-controlled regex
  const userRegex = new RegExp(query);
  const matched = "test string".match(userRegex);

  return NextResponse.json({
    sql: sqlQuery,
    output: stdout,
    filter: mongoFilter,
    matched,
  });
}
