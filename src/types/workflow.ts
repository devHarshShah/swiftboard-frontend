import { Node } from "reactflow";

export type NodeType =
  | "start"
  | "task"
  | "condition"
  | "api"
  | "data"
  | "end"
  | "default";

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  description: string;
  icon?: string;
  config: Record<string, unknown>;
}

export interface NodeTemplate {
  type: NodeType;
  label: string;
  icon: string;
  description: string;
}

export const nodeTemplates: NodeTemplate[] = [
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

export interface TaskRelationship {
  id: string;
  name: string;
  description: string;
}

export interface NodeWithRelationships {
  node: Node<WorkflowNodeData>;
  blockedBy: TaskRelationship[];
  blocking: TaskRelationship[];
}

export interface ColumnDefinition<TRow = unknown> {
  accessorKey?: string;
  id?: string;
  header:
    | string
    | React.ReactNode
    | ((props: { column: unknown }) => React.ReactNode);
  cell: (props: { row: TRow }) => React.ReactNode;
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
  onAddNode: (template: NodeTemplate) => void;
}

export interface BackendWorkflowNode {
  id: string;
  position?: { x: number; y: number };
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  selected?: boolean;
  dragging?: boolean;
  data?: {
    label?: string;
    type?: NodeType;
    description?: string;
    icon?: string;
    config?: Record<string, unknown> | string;
  };
}

export interface BackendWorkflowEdge {
  id: string;
  type?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  animated?: boolean;
  style?: Record<string, unknown> | string;
}

export interface BackendWorkflowData {
  nodes: BackendWorkflowNode[];
  edges: BackendWorkflowEdge[];
  name?: string;
  id?: string;
  projectId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NodeConfigUpdateEvent {
  nodeId: string;
  updatedData: WorkflowNodeData;
}

export interface TransformedNode {
  id: string;
  type: string;
  positionX: number;
  positionY: number;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  width: number;
  height: number;
  selected: boolean;
  dragging: boolean;
  data: {
    label: string;
    type: NodeType;
    description: string;
    icon?: string;
    config: string;
  };
}

export interface TransformedEdge {
  id: string;
  type?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  animated: boolean;
  style: string;
}

export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
}

export interface TransformResult {
  transformedNodes: TransformedNode[];
  transformedEdges: TransformedEdge[];
}

declare global {
  interface WindowEventMap {
    nodeConfigUpdate: CustomEvent<NodeConfigUpdateEvent>;
  }
}
