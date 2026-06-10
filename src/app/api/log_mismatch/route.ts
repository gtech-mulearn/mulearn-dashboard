import { NextResponse } from "next/server";
import fs from "node:fs";

export async function POST(req: Request) {
  const body = await req.json();
  fs.writeFileSync("schema_mismatch_data.json", JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true });
}
