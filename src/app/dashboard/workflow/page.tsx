"use client";
import { ReactFlowProvider } from "reactflow";
import WorkflowBuilder from "@/src/components/workflow/workflow-builder";
import { TaskManagerProvider } from "@/src/contexts/task-context";

export default function WorkflowPage() {
  return (
    <TaskManagerProvider>
      <ReactFlowProvider>
        <WorkflowBuilder />
      </ReactFlowProvider>
    </TaskManagerProvider>
  );
}
