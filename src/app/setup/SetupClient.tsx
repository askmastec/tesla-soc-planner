"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Vehicle = { vin: string; display_name?: string };
type TeslaStatus = {
  ok: boolean;
  stage:
    | "ready"
    | "oauth_missing"
    | "oauth_invalid"
    | "region_registration_required"
    | "api_error";
  apiBase: string;
  detail: string;
  hint?: string;
};

export function SetupClient({ baseUrl }: { baseUrl: string }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vin, setVin] = useState("");
  const [soc, setSoc] = useState<number | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingSoc, setLoadingSoc] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [status, setStatus] = useState<TeslaStatus | null>(null);

  async function loadVehicles() {
    setLoadingVehicles(true);
    setSoc(null);
    try {
      const res = await fetch("/api/tesla/vehicles", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load vehicles");
      const list: Vehicle[] = data?.response || [];
      setVehicles(list);
      if (!vin && list[0]?.vin) setVin(list[0].vin);
      toast.success(`Loaded ${list.length} vehicle(s)`);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoadingVehicles(false);
    }
  }

  async function fetchSoc() {
    if (!vin) {
      toast.error("Select a VIN first");
      return;
    }
    setLoadingSoc(true);
    try {
      const res = await fetch(`/api/tesla/soc?vin=${encodeURIComponent(vin)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch SoC");
      setSoc(data.soc);
      toast.success(`Live SoC: ${data.soc}%`);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoadingSoc(false);
    }
  }

  async function checkStatus() {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/tesla/status", { cache: "no-store" });
      const data = (await res.json()) as TeslaStatus;
      setStatus(data);
      if (data.ok) toast.success("Tesla API status: ready");
      else toast.error(`Tesla API status: ${data.stage}`);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    // Best-effort: if user already connected, vehicles will load.
    // If not connected, it will show an error and user should click "Connect Tesla".
  }, []);

  return (
    <div className="mt-8 grid gap-6">
      <Card className="bg-white/5 text-zinc-50 border-white/10">
        <CardHeader>
          <CardTitle>Redirect URL</CardTitle>
          <CardDescription className="text-zinc-300">
            Configure this as an allowed redirect URI in Tesla Fleet API app settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-zinc-200 space-y-3">
          <div className="rounded-md bg-black/40 border border-white/10 p-3 font-mono">
            {baseUrl}/api/tesla/callback
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/api/tesla/login" className={cn(buttonVariants({ variant: "default" }))}>
              Connect Tesla
            </a>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline" }), "border-white/20 bg-transparent")}
              onClick={checkStatus}
              disabled={loadingStatus}
            >
              {loadingStatus ? "Checking…" : "Check Tesla status"}
            </button>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline" }), "border-white/20 bg-transparent")}
              onClick={loadVehicles}
              disabled={loadingVehicles}
            >
              {loadingVehicles ? "Loading…" : "Load vehicles"}
            </button>
          </div>
          {status && (
            <div className="rounded-md bg-black/40 border border-white/10 p-3 text-xs text-zinc-200 space-y-1">
              <div><span className="text-zinc-400">status:</span> {status.stage}</div>
              <div><span className="text-zinc-400">region endpoint:</span> {status.apiBase}</div>
              <div className="break-all"><span className="text-zinc-400">detail:</span> {status.detail}</div>
              {status.hint && <div><span className="text-zinc-400">hint:</span> {status.hint}</div>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 text-zinc-50 border-white/10">
        <CardHeader>
          <CardTitle>Test live SoC</CardTitle>
          <CardDescription className="text-zinc-300">
            Pick a vehicle and fetch live battery percentage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Vehicle</Label>
            <Select value={vin} onValueChange={(value) => setVin(value ?? "")}>
              <SelectTrigger className="bg-black/30 border-white/10">
                <SelectValue placeholder="Select VIN" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.vin} value={v.vin}>
                    {(v.display_name ? `${v.display_name} · ` : "") + v.vin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>VIN (manual)</Label>
            <Input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              className="bg-black/30 border-white/10"
              placeholder="5YJ…"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "default" }))}
              onClick={fetchSoc}
              disabled={loadingSoc || !vin}
            >
              {loadingSoc ? "Fetching…" : "Fetch live SoC"}
            </button>
            {soc !== null && <div className="text-sm text-zinc-200">SoC: <span className="font-semibold">{soc}%</span></div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

