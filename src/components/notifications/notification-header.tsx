import { Button } from "@/src/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";

export function NotificationHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Notifications Center
        </h1>
        <p className="text-muted-foreground">
          Stay updated with your tasks, messages, and important updates
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
