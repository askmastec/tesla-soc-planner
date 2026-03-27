import { promises as fs } from "node:fs";
import path from "node:path";

type TeslaTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  created_at?: number;
  expires_at?: number;
};

const OAUTH_BASE = "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3";
export function getApiBase() {
  // Tesla Fleet API is region-scoped. Default to NA for local personal usage.
  const region = (process.env.TESLA_FLEET_REGION || "na").toLowerCase();
  if (region === "eu") return "https://fleet-api.prd.eu.vn.cloud.tesla.com";
  return "https://fleet-api.prd.na.vn.cloud.tesla.com";
}

const DATA_DIR = path.join(process.cwd(), ".data");
const TOKENS_PATH = path.join(DATA_DIR, "tesla_tokens.json");

export function getTeslaEnv() {
  const clientId = process.env.TESLA_CLIENT_ID;
  const clientSecret = process.env.TESLA_CLIENT_SECRET;
  const redirectUri = process.env.TESLA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing env. Set TESLA_CLIENT_ID, TESLA_CLIENT_SECRET, TESLA_REDIRECT_URI in .env.local"
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export async function readTokens(): Promise<TeslaTokens | null> {
  try {
    const raw = await fs.readFile(TOKENS_PATH, "utf8");
    return JSON.parse(raw) as TeslaTokens;
  } catch {
    return null;
  }
}

export async function writeTokens(tokens: TeslaTokens) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2), "utf8");
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch(`${OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Tesla token error ${res.status}: ${text}`);
  }
  return JSON.parse(text) as TeslaTokens;
}

export async function exchangeCodeForTokens(code: string) {
  const { clientId, clientSecret, redirectUri } = getTeslaEnv();
  const tok = await tokenRequest({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const now = Math.floor(Date.now() / 1000);
  await writeTokens({
    ...tok,
    created_at: now,
    expires_at: now + (tok.expires_in ?? 0),
  });
}

export async function getAccessToken() {
  const { clientId, clientSecret } = getTeslaEnv();
  const tok = await readTokens();
  if (!tok?.access_token) throw new Error("Not connected. Visit /api/tesla/login first.");

  const now = Math.floor(Date.now() / 1000);
  if (tok.expires_at && tok.expires_at - 30 > now) return tok.access_token;
  if (!tok.refresh_token) return tok.access_token;

  const refreshed = await tokenRequest({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: tok.refresh_token,
  });

  await writeTokens({
    ...tok,
    ...refreshed,
    created_at: now,
    expires_at: now + (refreshed.expires_in ?? 0),
  });

  return refreshed.access_token;
}

export async function teslaApiGet<T>(pathName: string): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${getApiBase()}${pathName}`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Tesla API error ${res.status}: ${text}`);
  return JSON.parse(text) as T;
}

