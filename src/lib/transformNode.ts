import { Node, Edge } from "reactflow";
import {
  WorkflowNodeData,
  NodeWithRelationships,
  TransformResult,
  TransformedEdge,
  TransformedNode,
  EdgeStyle,
} from "@/src/types/workflow";

const processTaskRelationships = (
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): Node<WorkflowNodeData>[] => {
  const nodeMap = new Map<string, NodeWithRelationships>();

  nodes.forEach((node) => {
    if (node.data.type === "task") {
      nodeMap.set(node.id, {
        node,
        blockedBy: [],
        blocking: [],
      });
    }
  });

  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode?.data.type === "task" && targetNode?.data.type === "task") {
      const sourceData = nodeMap.get(sourceNode.id);
      const targetData = nodeMap.get(targetNode.id);

      if (sourceData && targetData) {
        sourceData.blocking.push({
          id: targetNode.id,
          name: targetNode.data.label,
          description: targetNode.data.description,
        });

        targetData.blockedBy.push({
          id: sourceNode.id,
          name: sourceNode.data.label,
          description: sourceNode.data.description,
        });
      }
    }
  });

  return nodes.map((node) => {
    if (nodeMap.has(node.id)) {
      const nodeData = nodeMap.get(node.id)!;
      const config =
        typeof node.data.config === "string"
          ? JSON.parse(node.data.config)
          : node.data.config || {};

      return {
        ...node,
        data: {
          ...node.data,
          config: {
            ...config,
            userIds: config.userIds || [],
            blockedBy: nodeData.blockedBy,
            blocking: nodeData.blocking,
          },
        },
      };
    }
    return node;
  });
};

export const transformWorkflowData = (
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): TransformResult => {
  const processedNodes = processTaskRelationships(nodes, edges);

  const transformedNodes: TransformedNode[] = processedNodes.map((node) => ({
    id: node.id,
    type: node.type || "default",
    positionX: node.position.x,
    positionY: node.position.y,
    positionAbsoluteX: node.position.x,
    positionAbsoluteY: node.position.y,
    width: node.width || 225,
    height: node.height || 66,
    selected: node.selected || false,
    dragging: node.dragging || false,
    data: {
      label: node.data.label,
      type: node.data.type,
      description: node.data.description,
      icon: node.data.icon,
      config: JSON.stringify(node.data.config || {}),
    },
  }));

  const transformedEdges: TransformedEdge[] = edges.map((edge) => {
    const style: EdgeStyle = {
      stroke: (edge.style as EdgeStyle)?.stroke || "#4f46e5",
      strokeWidth: (edge.style as EdgeStyle)?.strokeWidth || 2,
    };

    return {
      id: edge.id,
      type: edge.type,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      animated: edge.animated || false,
      style: JSON.stringify(style),
    };
  });

  return { transformedNodes, transformedEdges };
};
