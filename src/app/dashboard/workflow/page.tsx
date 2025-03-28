"use client";
import { ReactFlowProvider } from "reactflow";
import WorkflowBuilder from "@/src/components/workflow/workflow-builder";

export default function WorkflowPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilder />
    </ReactFlowProvider>
  );
}
