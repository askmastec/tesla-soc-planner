import { NextResponse } from "next/server";
import { teslaApiGet } from "@/lib/tesla";

type VehiclesResponse = {
  response: Array<{
    vin: string;
    display_name?: string;
  }>;
};

export async function GET() {
  try {
    const data = await teslaApiGet<VehiclesResponse>("/api/1/vehicles");
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

