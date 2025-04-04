import { useCallback, useState } from "react";
import {
  Node,
  Edge,
  Connection,
  addEdge,
  ReactFlowInstance,
  OnSelectionChangeParams,
} from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/src/lib/apiClient";
import { useAppContext } from "@/src/contexts/app-context";
import { transformWorkflowData } from "@/src/lib/transformNode";
import { nodeTemplates, WorkflowNodeData, NodeType } from "@/src/types";

interface UseWorkflowOperationsProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  name: string;
  setNodes: React.Dispatch<React.SetStateAction<Node<WorkflowNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  workflowFetched: boolean;
}

interface ApiResponse {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export function useWorkflowOperations({
  nodes,
  edges,
  reactFlowInstance,
  name,
  setNodes,
  setEdges,
}: UseWorkflowOperationsProps) {
  const [selectedElements, setSelectedElements] = useState<{
    nodes: Node<WorkflowNodeData>[];
    edges: Edge[];
  }>({ nodes: [], edges: [] });

  const { activeProject } = useAppContext();
  const projectId = activeProject?.id;

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#4f46e5", strokeWidth: 2 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onAddNode = useCallback(
    (template: (typeof nodeTemplates)[number]) => {
      if (!reactFlowInstance) return;

      const position = reactFlowInstance.project({
        x: 250 + Math.random() * 100,
        y: 200 + Math.random() * 100,
      });

      const newNode: Node<WorkflowNodeData> = {
        id: uuidv4(),
        type: "workflowNode",
        position,
        data: {
          label: template.label,
          type: template.type as NodeType,
          description: template.description,
          icon: template.icon,
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes],
  );

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const selectedNodes = params.nodes as Node<WorkflowNodeData>[];
    setSelectedElements({
      nodes: selectedNodes,
      edges: params.edges,
    });
  }, []);

  const deleteSelectedElements = useCallback(() => {
    if (
      selectedElements.nodes.length > 0 ||
      selectedElements.edges.length > 0
    ) {
      setNodes((nds) =>
        nds.filter(
          (node) => !selectedElements.nodes.some((n) => n.id === node.id),
        ),
      );
      setEdges((eds) =>
        eds.filter(
          (edge) => !selectedElements.edges.some((e) => e.id === edge.id),
        ),
      );
      setSelectedElements({ nodes: [], edges: [] });
    }
  }, [selectedElements, setNodes, setEdges]);

  const handleDraft = async (): Promise<ApiResponse | void> => {
    try {
      if (!projectId) return;

      const { transformedNodes, transformedEdges } = transformWorkflowData(
        nodes,
        edges,
      );

      const response = await apiClient(`/api/workflow/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          nodes: transformedNodes,
          edges: transformedEdges,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save workflow");
      }

      const data: ApiResponse = await response.json();
      console.log("Workflow saved:", data);
      return data;
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  const updateDraft = async (): Promise<ApiResponse | void> => {
    try {
      if (!projectId) return;

      const { transformedNodes, transformedEdges } = transformWorkflowData(
        nodes,
        edges,
      );

      const response = await apiClient(`/api/workflow/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          nodes: transformedNodes,
          edges: transformedEdges,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workflow");
      }

      const data: ApiResponse = await response.json();
      console.log("Workflow updated:", data);
      return data;
    } catch (error) {
      console.error("Error updating workflow:", error);
    }
  };

  const publishWorkflow = async (): Promise<ApiResponse | void> => {
    try {
      if (!projectId) return;

      const { transformedNodes, transformedEdges } = transformWorkflowData(
        nodes,
        edges,
      );

      const response = await apiClient(`/api/workflow/${projectId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          nodes: transformedNodes,
          edges: transformedEdges,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish workflow");
      }

      const data: ApiResponse = await response.json();
      console.log("Workflow published:", data);
      return data;
    } catch (error) {
      console.error("Error publishing workflow:", error);
    }
  };

  return {
    onConnect,
    onAddNode,
    selectedElements,
    onSelectionChange,
    deleteSelectedElements,
    handleDraft,
    updateDraft,
    publishWorkflow,
  };
}
