import { NextResponse } from "next/server";
import { teslaApiGet } from "@/lib/tesla";

type VehicleDataResponse = {
  response?: {
    charge_state?: {
      battery_level?: number;
    };
    BatteryLevel?: number;
    battery_level?: number;
  };
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const vin = url.searchParams.get("vin");
    if (!vin) return NextResponse.json({ error: "Missing vin" }, { status: 400 });

    const data = await teslaApiGet<VehicleDataResponse>(`/api/1/vehicles/${encodeURIComponent(vin)}/vehicle_data`);
    const soc =
      data?.response?.charge_state?.battery_level ??
      data?.response?.BatteryLevel ??
      data?.response?.battery_level;

    if (typeof soc !== "number") {
      return NextResponse.json(
        { error: "Could not find battery % in vehicle_data response", raw: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ soc });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

