import type { Datafeed, Period, SymbolInfo } from "@klinecharts/pro";
import type { KLineData } from "klinecharts";

import {
  effectiveHistoryFromMs,
  type ChartHistoryRangeId,
} from "@/lib/chart/history-range";

function periodToBinanceInterval(period: Period): string {
  const m = period.multiplier;
  switch (period.timespan) {
    case "minute": {
      if (m === 1 || m === 3 || m === 5 || m === 15 || m === 30) return `${m}m`;
      if (m <= 2) return "1m";
      if (m <= 10) return "5m";
      return "15m";
    }
    case "hour": {
      if ([1, 2, 4, 6, 8, 12].includes(m)) return `${m}h`;
      return m <= 1 ? "1h" : "4h";
    }
    case "day":
      return m <= 1 ? "1d" : "3d";
    case "week":
      return "1w";
    case "month":
    case "year":
      return "1M";
    default:
      return "15m";
  }
}

function klineRowToData(row: (string | number)[]): KLineData {
  return {
    timestamp: Number(row[0]),
    open: parseFloat(String(row[1])),
    high: parseFloat(String(row[2])),
    low: parseFloat(String(row[3])),
    close: parseFloat(String(row[4])),
    volume: parseFloat(String(row[5])),
  };
}

const BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines";

function normalizeSymbol(ticker: string): string {
  return ticker.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "BTCUSDT";
}

function streamSymbol(ticker: string): string {
  return normalizeSymbol(ticker).toLowerCase();
}

const BTC_USDT: SymbolInfo = {
  ticker: "BTCUSDT",
  name: "Bitcoin / TetherUS",
  shortName: "BTC",
  exchange: "BINANCE",
  market: "crypto",
  priceCurrency: "USDT",
  pricePrecision: 2,
  volumePrecision: 5,
  type: "crypto",
};

async function fetchKlinesPaged(
  sym: string,
  interval: string,
  startMs: number,
  endMs: number
): Promise<KLineData[]> {
  const byTs = new Map<number, KLineData>();
  let before = endMs;

  for (let page = 0; page < 60; page++) {
    const params = new URLSearchParams({
      symbol: sym,
      interval,
      endTime: String(Math.floor(before)),
      limit: "1000",
    });
    const res = await fetch(`${BINANCE_KLINES_URL}?${params}`);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Binance klines failed: ${res.status} ${detail}`);
    }
    const raw = (await res.json()) as (string | number)[][];
    if (!Array.isArray(raw) || raw.length === 0) break;

    for (const row of raw) {
      const d = klineRowToData(row);
      if (d.timestamp >= startMs && d.timestamp <= endMs) {
        byTs.set(d.timestamp, d);
      }
    }

    const firstOpen = Number(raw[0][0]);
    if (firstOpen <= startMs) break;
    before = firstOpen - 1;
    if (raw.length < 1000) break;
  }

  return Array.from(byTs.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export class BinanceDatafeed implements Datafeed {
  private ws: WebSocket | null = null;

  constructor(
    private readonly getHistoryRange: () => ChartHistoryRangeId = () => "1D"
  ) {}

  searchSymbols(search?: string): Promise<SymbolInfo[]> {
    if (!search?.trim()) return Promise.resolve([BTC_USDT]);
    const q = search.trim().toUpperCase();
    if (
      q === "BTC" ||
      q === "BTCUSDT" ||
      q.includes("BTC") ||
      q.includes("BITCOIN")
    ) {
      return Promise.resolve([BTC_USDT]);
    }
    return Promise.resolve([]);
  }

  async getHistoryKLineData(
    symbol: SymbolInfo,
    period: Period,
    from: number,
    to: number
  ): Promise<KLineData[]> {
    const interval = periodToBinanceInterval(period);
    const sym = normalizeSymbol(symbol.ticker);
    const startMs = effectiveHistoryFromMs(
      to,
      from,
      this.getHistoryRange()
    );
    const endMs = Math.floor(to);

    if (endMs - startMs <= 0) return [];

    return fetchKlinesPaged(sym, interval, startMs, endMs);
  }

  subscribe(
    symbol: SymbolInfo,
    period: Period,
    callback: (data: KLineData) => void
  ): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const interval = periodToBinanceInterval(period);
    const sym = streamSymbol(symbol.ticker);
    const url = `wss://stream.binance.com:9443/ws/${sym}@kline_${interval}`;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as {
          e?: string;
          k?: {
            t: number;
            o: string;
            h: string;
            l: string;
            c: string;
            v: string;
          };
        };
        if (msg.e !== "kline" || !msg.k) return;
        const k = msg.k;
        callback({
          timestamp: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        });
      } catch {
        /* ignore malformed frames */
      }
    };
  }

  unsubscribe(symbol: SymbolInfo, period: Period): void {
    void symbol;
    void period;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
