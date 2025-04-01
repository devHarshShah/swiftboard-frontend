import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface DashboardStatsCardProps {
  title: string;
  value: string;
  description?: string;
  footer?: React.ReactNode;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  colorClass?: string;
}

export function DashboardStatsCard({
  title,
  value,
  description,
  footer,
  icon: Icon,
  trend,
  isLoading = false,
  colorClass = "text-primary",
}: DashboardStatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          {description && <Skeleton className="h-4 w-40" />}
        </CardContent>
        {footer && (
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-1">
            <span
              className={`text-xs ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              from last period
            </span>
          </div>
        )}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
