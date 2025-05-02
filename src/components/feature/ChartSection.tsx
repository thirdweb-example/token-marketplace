import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import React from "react";

export default function ChartSection({
  tokenData,
  timeframe,
  setTimeframe,
  isLoading,
}: {
  tokenData: any;
  timeframe: "1h" | "24h" | "7d" | "30d";
  setTimeframe: (tf: "1h" | "24h" | "7d" | "30d") => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-black rounded-lg p-4 mb-2">
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-full w-full bg-[#151515]" />
        </div>
      ) : tokenData ? (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={
                timeframe === "1h"
                  ? tokenData.historicalPrices["1h"]
                  : timeframe === "24h"
                  ? tokenData.historicalPrices["24h"]
                  : timeframe === "7d"
                  ? tokenData.historicalPrices["7d"]
                  : tokenData.historicalPrices["30d"]
              }
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5252" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#FF5252" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#0A0A0A"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeframe === "24h") {
                    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                  } else if (timeframe === "7d") {
                    return date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                  } else {
                    return date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                  }
                }}
                stroke="#555555"
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: "#0A0A0A" }}
                tickLine={{ stroke: "#0A0A0A" }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(value) =>
                  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
                }
                stroke="#555555"
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: "#0A0A0A" }}
                tickLine={{ stroke: "#0A0A0A" }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "black",
                  border: "1px solid #0A0A0A",
                  borderRadius: "0.375rem",
                  color: "#fff",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{
                  color: "#999999",
                  marginBottom: "5px",
                  fontSize: "12px",
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                  "Price",
                ]}
                cursor={{
                  stroke: "#555555",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
                active={true}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#FF5252"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorPrice)"
                activeDot={{
                  r: 4,
                  stroke: "#FF5252",
                  strokeWidth: 1,
                  fill: "#0A0A0A",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-red-400 flex items-center justify-center h-[240px]">
          <div className="text-center">
            <div className="text-xl font-medium mb-2">
              Failed to load price data
            </div>
            <div className="text-gray-400">Please try again later</div>
          </div>
        </div>
      )}
      {/* Time Frame Selector */}
      <div className="flex gap-2 mt-4 justify-start">
        {[
          { label: "1H", value: "1h" },
          { label: "1D", value: "24h" },
          { label: "1W", value: "7d" },
          { label: "1M", value: "30d" },
          { label: "1Y", value: "1y" },
          { label: "MAX", value: "max" },
        ].map((tf) => (
          <button
            key={tf.label}
            className={`px-4 py-1 text-xs font-medium rounded-full border border-[#232329] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#232329] ${
              timeframe === tf.value
                ? "bg-[#18181b] text-white border-[#232329]"
                : "bg-transparent text-gray-300 border-[#232329] hover:bg-[#18181b] hover:text-white"
            }`}
            onClick={() => setTimeframe(tf.value as "1h" | "24h" | "7d" | "30d")}
            tabIndex={0}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
