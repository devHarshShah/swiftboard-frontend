import { Node, Edge } from "reactflow";

const processTaskRelationships = (nodes: Node[], edges: Edge[]) => {
  const nodeMap = new Map();

  // First pass: initialize all task nodes
  nodes.forEach((node) => {
    if (node.data.type === "task") {
      nodeMap.set(node.id, {
        node,
        blockedBy: [],
        blocking: [],
      });
    }
  });

  // Second pass: analyze edges to build relationships
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode?.data.type === "task" && targetNode?.data.type === "task") {
      // Source task is blocking target task
      const sourceData = nodeMap.get(sourceNode.id);
      const targetData = nodeMap.get(targetNode.id);

      if (sourceData && targetData) {
        // Add blocking relationship
        sourceData.blocking.push({
          id: targetNode.id,
          name: targetNode.data.label,
          description: targetNode.data.description,
        });

        // Add blockedBy relationship
        targetData.blockedBy.push({
          id: sourceNode.id,
          name: sourceNode.data.label,
          description: sourceNode.data.description,
        });
      }
    }
  });

  // Final pass: update nodes with relationship data
  return nodes.map((node) => {
    if (nodeMap.has(node.id)) {
      const nodeData = nodeMap.get(node.id);
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

export const transformWorkflowData = (nodes: Node[], edges: Edge[]) => {
  // Process task relationships
  const processedNodes = processTaskRelationships(nodes, edges);

  // Transform nodes for API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedNodes = processedNodes.map((node: any) => ({
    id: node.id,
    type: node.type,
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

  // Transform edges for API
  const transformedEdges = edges.map((edge) => ({
    id: edge.id,
    type: edge.type,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    animated: edge.animated || false,
    style: JSON.stringify({
      stroke: edge.style?.stroke || "#4f46e5",
      strokeWidth: edge.style?.strokeWidth || 2,
    }),
  }));

  return { transformedNodes, transformedEdges };
};
