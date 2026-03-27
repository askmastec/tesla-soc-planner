import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getTeslaEnv } from "@/lib/tesla";

export async function GET() {
  const { clientId, redirectUri } = getTeslaEnv();

  const state = crypto.randomBytes(16).toString("hex");

  const url = new URL("https://auth.tesla.com/oauth2/v3/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid offline_access vehicle_device_data");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("tesla_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}

