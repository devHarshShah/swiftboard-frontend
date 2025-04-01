import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ProjectTimeStats } from "@/src/types/timeTracking";
import { formatHours } from "@/src/lib/timeTracking";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyTimeChartProps {
  stats: ProjectTimeStats;
  isLoading: boolean;
}

export function DailyTimeChart({ stats, isLoading }: DailyTimeChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="animate-pulse h-6 bg-muted rounded w-48"></CardTitle>
        </CardHeader>
        <CardContent className="h-80 animate-pulse bg-muted/30 rounded-md"></CardContent>
      </Card>
    );
  }

  // Process data for chart display
  const chartData = stats.dailyTrackedTime.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    hours: Number((item.trackedTime / 3600).toFixed(2)),
    trackedTime: item.trackedTime,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Daily Time Tracking Activity</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background/90 border rounded-md shadow-sm p-2 text-sm">
                      <p className="font-medium">{payload[0].payload.date}</p>
                      <p className="text-primary">
                        {formatHours(payload[0].payload.trackedTime)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="hours"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              className="fill-primary/80 hover:fill-primary/90"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
