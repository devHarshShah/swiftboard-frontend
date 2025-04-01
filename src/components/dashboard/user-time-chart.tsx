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

interface UserTimeChartProps {
  stats: ProjectTimeStats;
  isLoading: boolean;
}

export function UserTimeChart({ stats, isLoading }: UserTimeChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="animate-pulse h-6 bg-muted rounded w-48"></CardTitle>
        </CardHeader>
        <CardContent className="h-80 animate-pulse bg-muted/30 rounded-md"></CardContent>
      </Card>
    );
  }

  // Process and sort data for chart display
  const chartData = [...stats.timeByUser]
    .sort((a, b) => b.trackedTime - a.trackedTime)
    .slice(0, 10) // Limit to top 10 users
    .map((user) => ({
      name: user.userName || user.userEmail.split("@")[0],
      hours: Number((user.trackedTime / 3600).toFixed(2)),
      trackedTime: user.trackedTime,
    }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Time Tracked by User</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
              tickFormatter={(value) =>
                value.length > 15 ? `${value.substring(0, 12)}...` : value
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background/90 border rounded-md shadow-sm p-2 text-sm">
                      <p className="font-medium">{payload[0].payload.name}</p>
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
              fill="var(--chart-2)"
              radius={[0, 4, 4, 0]}
              className="fill-primary/70 hover:fill-primary/90"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
