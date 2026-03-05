"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MiniChartProps {
  data: { date: string; value: number }[];
  color?: string;
  unit?: string;
  target?: number;
}

export function MiniChart({
  data,
  color = "var(--accent)",
  unit = "",
  target,
}: MiniChartProps) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-hover)",
            borderRadius: 10,
            padding: "6px 10px",
          }}
          labelStyle={{ color: "var(--text-secondary)", fontSize: 11 }}
          itemStyle={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}
          formatter={(v: any) => [`${v}${unit}`, ""]}
        />
        {target && (
          <ReferenceLine
            y={target}
            stroke="var(--border-hover)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
