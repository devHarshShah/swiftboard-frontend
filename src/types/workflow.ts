export type NodeType = "start" | "task" | "condition" | "api" | "data" | "end";

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  description: string;
  icon?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
}

export const nodeTemplates = [
  {
    type: "task",
    label: "Process Task",
    icon: "check-circle",
    description: "Standard workflow task",
  },
  {
    type: "condition",
    label: "Decision",
    icon: "git-branch",
    description: "Evaluate conditions",
  },
  {
    type: "api",
    label: "API Call",
    icon: "cloud",
    description: "External API integration",
  },
  {
    type: "data",
    label: "Data Store",
    icon: "database",
    description: "Store or retrieve data",
  },
  {
    type: "end",
    label: "End Process",
    icon: "square",
    description: "Terminate the workflow",
  },
];

export interface ColumnDefinition {
  accessorKey?: string;
  id?: string;
  header:
    | string
    | React.ReactNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ((props: { column: any }) => React.ReactNode);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell: (props: { row: any }) => React.ReactNode;
}

export interface WorkflowActionsProps {
  workflowFetched: boolean;
  handleDraft: () => void;
  updateDraft: () => void;
  publishWorkflow: () => void;
}

export interface WorkflowPanelProps {
  name: string;
  setName: (name: string) => void;
  workflowFetched: boolean;
  handleDraft: () => void;
  updateDraft: () => void;
  publishWorkflow: () => void;
  onAddNode: (template: (typeof nodeTemplates)[0]) => void;
}
