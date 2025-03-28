import { useCallback, useState } from "react";
import { Node, Edge, Connection, addEdge } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/src/lib/apiClient";
import { useAppContext } from "@/src/contexts/app-context";
import { transformWorkflowData } from "@/src/lib/transformNode";
import { nodeTemplates } from "@/src/types/types";
import { WorkflowNodeData } from "../types/types";

interface UseWorkflowOperationsProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reactFlowInstance: any;
  name: string;
  setNodes: React.Dispatch<React.SetStateAction<Node<WorkflowNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  workflowFetched: boolean;
}

export function useWorkflowOperations({
  nodes,
  edges,
  reactFlowInstance,
  name,
  setNodes,
  setEdges,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  workflowFetched,
}: UseWorkflowOperationsProps) {
  const [selectedElements, setSelectedElements] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({ nodes: [], edges: [] });

  const { activeProject } = useAppContext();
  const projectId = activeProject?.id;

  // Handle edge connections
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

  // Add a new node based on template - UPDATED IMPLEMENTATION
  const onAddNode = useCallback(
    (template: (typeof nodeTemplates)[0]) => {
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: template.type as any,
          description: template.description,
          icon: template.icon,
          config: {},
        },
      };

      // Directly update the nodes state instead of using onNodesChange
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes],
  );

  // Track selected elements
  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedElements({ nodes, edges });
    },
    [],
  );

  // Delete selected elements
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

  // Save as draft
  const handleDraft = async () => {
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

      const data = await response.json();
      console.log("Workflow saved:", data);
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  // Update existing draft
  const updateDraft = async () => {
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

      const data = await response.json();
      console.log("Workflow updated:", data);
    } catch (error) {
      console.error("Error updating workflow:", error);
    }
  };

  // Publish workflow
  const publishWorkflow = async () => {
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

      const data = await response.json();
      console.log("Workflow published:", data);
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
