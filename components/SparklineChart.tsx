'use client';

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface SparklineProps {
  data: Array<{ value: number }>;
  color?: string;
}

export function SparklineChart({ data, color = '#0ea5e9' }: SparklineProps) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis hide />
          <YAxis hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
