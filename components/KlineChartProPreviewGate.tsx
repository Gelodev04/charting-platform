"use client";

import dynamic from "next/dynamic";

export const KlineChartProPreviewGate = dynamic(
  () =>
    import("./KlineChartProPreview").then((m) => m.KlineChartProPreview),
  { ssr: false }
);
