import { useEffect, useState, useCallback } from "react";
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "reactflow";
import { apiClient } from "@/src/lib/apiClient";
import { useAppContext } from "@/src/contexts/app-context";
import {
  WorkflowNodeData,
  NodeType,
  BackendWorkflowData,
  BackendWorkflowNode,
  BackendWorkflowEdge,
  NodeConfigUpdateEvent,
} from "@/src/types/workflow";

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: "1",
    type: "workflowNode",
    position: { x: 250, y: 100 },
    data: {
      label: "Start Process",
      type: "start",
      description: "Initiates the workflow",
      icon: "play",
      config: {},
    },
  },
];

const initialEdges: Edge[] = [];

export function useWorkflowData() {
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [name, setName] = useState("");
  const [workflowFetched, setWorkflowFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [waitingForProject, setWaitingForProject] = useState(false);

  const { activeProject } = useAppContext();
  const projectId = activeProject?.id;

  // Fix: Add proper type checking and safe handling
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    try {
      // Check if changes is an array before applying
      if (Array.isArray(changes)) {
        setNodes((nds) => applyNodeChanges(changes, nds));
      } else {
        console.error("Expected changes to be an array, but got:", changes);
      }
    } catch (error) {
      console.error("Error in onNodesChange:", error);
    }
  }, []);

  // Fix: Add proper type checking and safe handling
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    try {
      // Check if changes is an array before applying
      if (Array.isArray(changes)) {
        setEdges((eds) => applyEdgeChanges(changes, eds));
      } else {
        console.error("Expected changes to be an array, but got:", changes);
      }
    } catch (error) {
      console.error("Error in onEdgesChange:", error);
    }
  }, []);

  // Fetch workflow data when project ID is available
  useEffect(() => {
    // Only fetch if we have a valid projectId
    if (!projectId) {
      setWaitingForProject(true);
      return;
    }

    setWaitingForProject(false);
    const fetchWorkflow = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient(`/api/workflow/${projectId}`);

        if (!response.ok) {
          // If there's any kind of error (including 404 not found)
          // Just set the initial nodes and edges
          console.log(
            "Workflow not found or error occurred, using default workflow",
          );
          setNodes(initialNodes);
          setEdges(initialEdges);
          setName("");
          setWorkflowFetched(false);
          setIsLoading(false);
          return;
        }

        let data: BackendWorkflowData;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Error parsing workflow JSON:", parseError);
          setNodes(initialNodes);
          setEdges(initialEdges);
          setName("");
          setWorkflowFetched(false);
          setIsLoading(false);
          return;
        }

        // Check if we have valid data structure with nodes and edges arrays
        if (data && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
          try {
            // Transform nodes from backend format
            const transformedNodes = data.nodes.map(
              (node: BackendWorkflowNode) => ({
                id: node.id,
                type: "workflowNode",
                position: {
                  x: node.position?.x || node.positionX || 0,
                  y: node.position?.y || node.positionY || 0,
                },
                data: {
                  label: node.data?.label || "Unnamed Node",
                  type: (node.data?.type || "default") as NodeType,
                  description: node.data?.description || "",
                  icon: node.data?.icon || "default",
                  config:
                    typeof node.data?.config === "string"
                      ? JSON.parse(node.data.config || "{}")
                      : node.data?.config || {},
                },
                width: node.width || 225,
                height: node.height || 66,
                selected: node.selected || false,
                dragging: node.dragging || false,
              }),
            ) as Node<WorkflowNodeData>[];

            const transformedEdges = data.edges.map(
              (edge: BackendWorkflowEdge) => ({
                id: edge.id,
                type: edge.type || "smoothstep",
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                animated: edge.animated || false,
                style:
                  typeof edge.style === "string"
                    ? JSON.parse(edge.style || "{}")
                    : edge.style || {
                        stroke: "#4f46e5",
                        strokeWidth: 2,
                      },
              }),
            ) as Edge[];

            setNodes(transformedNodes);
            setEdges(transformedEdges);
            setName(data.name || "");
            setWorkflowFetched(true);
          } catch (parseError) {
            // If something goes wrong with transformation, fall back to defaults
            console.error("Error transforming workflow data:", parseError);
            setNodes(initialNodes);
            setEdges(initialEdges);
            setWorkflowFetched(false);
          }
        } else {
          // If we get a response but it doesn't have the structure we expect
          console.log(
            "Invalid workflow data structure, using default workflow",
          );
          setNodes(initialNodes);
          setEdges(initialEdges);
          setName("");
          setWorkflowFetched(false);
        }
      } catch (error) {
        // Catch all other errors and use default workflow
        console.error("Error fetching workflow:", error);
        setNodes(initialNodes);
        setEdges(initialEdges);
        setName("");
        setWorkflowFetched(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [projectId]);

  // Listen for node config updates from the WorkflowNode component
  useEffect(() => {
    const handleNodeUpdate = (event: CustomEvent<NodeConfigUpdateEvent>) => {
      const { nodeId, updatedData } = event.detail;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: updatedData,
            };
          }
          return node;
        }),
      );
    };

    window.addEventListener(
      "nodeConfigUpdate",
      handleNodeUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "nodeConfigUpdate",
        handleNodeUpdate as EventListener,
      );
    };
  }, []);

  return {
    nodes,
    edges,
    name,
    setName,
    isLoading,
    workflowFetched,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
  };
}
