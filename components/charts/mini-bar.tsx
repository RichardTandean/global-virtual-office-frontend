"use client"

import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts"

interface DataPoint {
  label: string
  value: number
}

export function MiniBar({
  data,
  color = "var(--accent)",
  height = 80,
  showAxis = false,
}: {
  data: DataPoint[]
  color?: string
  height?: number
  showAxis?: boolean
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          {showAxis && (
            <XAxis
              dataKey="label"
              tick={{
                fontSize: 10,
                fill: "var(--fg-muted)",
                fontFamily: "var(--font-mono)",
              }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
          )}
          <Tooltip
            cursor={{ fill: "var(--bg-subtle)" }}
            contentStyle={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: 6,
              fontSize: 11,
              padding: "4px 8px",
              color: "var(--fg-primary)",
            }}
            labelStyle={{
              fontSize: 10,
              color: "var(--fg-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
            itemStyle={{ color: "var(--fg-primary)" }}
          />
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
