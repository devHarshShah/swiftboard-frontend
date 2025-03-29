import KanbanBoard from "@/src/components/kanban/kanban-board";
import { TaskManagerProvider } from "@/src/contexts/task-context";
import React from "react";

const KanbanBoardPage = () => {
  return (
    <TaskManagerProvider>
      <KanbanBoard />
    </TaskManagerProvider>
  );
};

export default KanbanBoardPage;
