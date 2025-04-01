import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ProjectTimeStats } from "@/src/types/timeTracking";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StatusDistributionChartProps {
  stats: ProjectTimeStats;
  isLoading: boolean;
}

export function StatusDistributionChart({
  stats,
  isLoading,
}: StatusDistributionChartProps) {
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

  // Process data for chart display
  const chartData = Object.entries(stats.taskStatusDistribution).map(
    ([status, count], index) => ({
      name: formatStatusName(status),
      value: count,
      color: getStatusColor(status, index),
    }),
  );

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Task Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background/90 border rounded-md shadow-sm p-2 text-sm">
                      <p className="font-medium">{payload[0].name}</p>
                      <p className="text-primary">{payload[0].value} tasks</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
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
