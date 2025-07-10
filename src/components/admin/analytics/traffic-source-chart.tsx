
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type ChartData = {
  name: string;
  value: number;
  fill: string;
}[];

const TrafficSourceChart = ({ data }: { data: ChartData }) => {
  return (
    <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="p-2 bg-background border rounded-lg shadow-sm">
                                    <p className="font-bold">{`${payload[0].name}`}</p>
                                    <p className="text-sm text-muted-foreground">{`Visitas: ${payload[0].value}%`}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Legend
                    iconType="circle"
                    formatter={(value, entry) => (
                        <span className="text-foreground/80">{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default TrafficSourceChart;
