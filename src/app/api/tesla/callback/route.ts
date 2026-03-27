import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens } from "@/lib/tesla";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = (await cookies()).get("tesla_oauth_state")?.value;

  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Bad state" }, { status: 400 });
  }

  await exchangeCodeForTokens(code);

  const res = NextResponse.redirect(new URL("/setup", url).toString());
  res.cookies.set("tesla_oauth_state", "", { maxAge: 0, path: "/" });
  return res;
}

