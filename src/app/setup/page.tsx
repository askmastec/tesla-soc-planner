import Link from "next/link";
import { SetupClient } from "@/app/setup/SetupClient";
import { headers } from "next/headers";

export default async function SetupPage() {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-slate-950 to-black text-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Tesla Fleet API setup</h1>
          <Link href="/" className="inline-flex h-8 items-center justify-center rounded-lg border border-white/20 bg-transparent px-2.5 text-sm font-medium text-zinc-100 hover:bg-white/5">
            Back
          </Link>
        </div>

        <div className="mt-4 text-sm text-zinc-300">
          Create <span className="font-mono">.env.local</span> in the repo root (do not commit) with:
          <div className="mt-3 rounded-md bg-black/40 border border-white/10 p-3 font-mono whitespace-pre-wrap text-zinc-200">
            {`TESLA_CLIENT_ID=...\nTESLA_CLIENT_SECRET=...\nTESLA_REDIRECT_URI=${baseUrl}/api/tesla/callback`}
          </div>
          <div className="mt-2">
            Use your actual localhost port in <span className="font-mono">TESLA_REDIRECT_URI</span> (shown below).
          </div>
        </div>

        <SetupClient baseUrl={baseUrl} />
      </div>
    </main>
  );
}

