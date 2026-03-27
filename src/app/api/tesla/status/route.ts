import { NextResponse } from "next/server";
import { getAccessToken, getApiBase } from "@/lib/tesla";

type StatusPayload = {
  ok: boolean;
  stage: "ready" | "oauth_missing" | "oauth_invalid" | "region_registration_required" | "api_error";
  apiBase: string;
  detail: string;
  hint?: string;
};

export async function GET() {
  const apiBase = getApiBase();
  try {
    const accessToken = await getAccessToken();
    const res = await fetch(`${apiBase}/api/1/vehicles`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const text = await res.text();

    if (res.ok) {
      const payload: StatusPayload = {
        ok: true,
        stage: "ready",
        apiBase,
        detail: "Tesla API reachable and vehicles endpoint is authorized.",
      };
      return NextResponse.json(payload);
    }

    const lowered = text.toLowerCase();
    if (res.status === 412 && lowered.includes("must be registered in the current region")) {
      const payload: StatusPayload = {
        ok: false,
        stage: "region_registration_required",
        apiBase,
        detail: text,
        hint: "Your app/account must be partner-registered for this region (POST /api/1/partner_accounts) with a real domain + hosted .well-known public key.",
      };
      return NextResponse.json(payload, { status: 412 });
    }

    if (res.status === 401 || res.status === 403) {
      const payload: StatusPayload = {
        ok: false,
        stage: "oauth_invalid",
        apiBase,
        detail: text,
        hint: "Reconnect Tesla from /setup. Ensure OAuth scopes include openid offline_access vehicle_device_data.",
      };
      return NextResponse.json(payload, { status: res.status });
    }

    const payload: StatusPayload = {
      ok: false,
      stage: "api_error",
      apiBase,
      detail: text,
    };
    return NextResponse.json(payload, { status: res.status });
  } catch (e) {
    const message = String(e);
    const stage: StatusPayload["stage"] =
      message.includes("Not connected. Visit /api/tesla/login first.") ? "oauth_missing" : "api_error";
    const payload: StatusPayload = {
      ok: false,
      stage,
      apiBase,
      detail: message,
      hint:
        stage === "oauth_missing"
          ? "Click Connect Tesla on /setup and complete OAuth."
          : undefined,
    };
    return NextResponse.json(payload, { status: stage === "oauth_missing" ? 401 : 500 });
  }
}

