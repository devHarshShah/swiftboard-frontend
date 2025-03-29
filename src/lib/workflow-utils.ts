import { Node, Edge } from "reactflow";
import { WorkflowNodeData } from "@/src/types";

export function transformWorkflowData(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
) {
  // Transform nodes for API format
  const transformedNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.data.label,
      type: node.data.type,
      description: node.data.description,
      icon: node.data.icon,
      config: node.data.config,
    },
    width: node.width,
    height: node.height,
  }));

  // Transform edges for API format
  const transformedEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type || "smoothstep",
    animated: edge.animated,
    style: edge.style,
  }));

  return { transformedNodes, transformedEdges };
}
