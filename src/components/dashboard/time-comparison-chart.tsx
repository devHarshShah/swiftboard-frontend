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
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimeComparisonChartProps {
  stats: ProjectTimeStats;
  isLoading: boolean;
}

export function TimeComparisonChart({
  stats,
  isLoading,
}: TimeComparisonChartProps) {
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

  // Process data for chart display - time by status
  const chartData = Object.entries(stats.timeByStatus)
    .map(([status, time]) => ({
      name: formatStatusName(status),
      hours: Number((time / 3600).toFixed(2)),
      trackedTime: time,
      status,
    }))
    .filter((item) => item.hours > 0);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Time Distribution by Status</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
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
            <Bar dataKey="hours" className="fill-primary/80">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getStatusColor(entry.status, index)}
                  className="hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function formatStatusName(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusColor(status: string, index: number): string {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];

  switch (status.toUpperCase()) {
    case "TODO":
      return "var(--chart-1)";
    case "IN_PROGRESS":
      return "var(--chart-3)";
    case "REVIEW":
      return "var(--chart-4)";
    case "DONE":
      return "var(--chart-5)";
    default:
      return colors[index % colors.length];
  }
}
