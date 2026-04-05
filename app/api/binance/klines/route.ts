import { NextRequest, NextResponse } from "next/server";

const BINANCE_KLINES = "https://api.binance.com/api/v3/klines";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const interval = searchParams.get("interval") ?? "15m";
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const limit = searchParams.get("limit") ?? "1000";

  const url = new URL(BINANCE_KLINES);
  url.searchParams.set("symbol", symbol.toUpperCase());
  url.searchParams.set("interval", interval);
  if (startTime) url.searchParams.set("startTime", startTime);
  if (endTime) url.searchParams.set("endTime", endTime);
  url.searchParams.set("limit", limit);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: text || res.statusText },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
