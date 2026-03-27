import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-slate-950 to-black text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">Tesla SoC Planner</h1>
              <Badge variant="secondary">local-only</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Weekly charge schedule planning with a single set% freeze anchor, drag/drop editing, snapshots,
              and optional Tesla Fleet API live SoC insertion.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="bg-white/5 text-zinc-50 border-white/10">
            <CardHeader>
              <CardTitle>Planner</CardTitle>
              <CardDescription className="text-zinc-300">
                Use the current planner UI (legacy) while we wire Tesla auth and React components.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Link href="/legacy" className={cn(buttonVariants({ variant: "default" }))}>
                Open planner
              </Link>
              <Link
                href="/setup"
                className={cn(buttonVariants({ variant: "outline" }), "border-white/20 bg-transparent")}
              >
                Tesla setup
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/5 text-zinc-50 border-white/10">
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription className="text-zinc-300">
                We’ll add Next.js route handlers for Tesla OAuth and a “Fetch live SoC” control.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              <div>- Add `.env.local` for Tesla credentials (never commit).</div>
              <div>- Implement `/api/tesla/login`, `/api/tesla/callback`, `/api/tesla/vehicles`, `/api/tesla/soc`.</div>
              <div>- Add a UI button to push live SoC into your `set%` block.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
