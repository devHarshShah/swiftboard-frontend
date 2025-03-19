"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowProvider,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import WorkflowNode from "@/src/components/workflow-node";
import { v4 as uuidv4 } from "uuid";
import { WorkflowNodeData } from "@/src/types/types";
import { PlusIcon, ChevronDownIcon } from "lucide-react";
import { apiClient } from "@/src/lib/apiClient";

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

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

const nodeTemplates = [
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

const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showTemplates, setShowTemplates] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Update the useEffect hook for fetching workflow data
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await apiClient("/api/workflow");
        if (!response.ok) {
          throw new Error("Failed to fetch workflow");
        }

        const data = await response.json();

        if (data.nodes && data.edges) {
          // Transform nodes from backend format to ReactFlow format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedNodes = data.nodes.map((node: any) => ({
            id: node.id,
            type: "workflowNode",
            position: {
              x: node.position?.x || node.positionX || 0,
              y: node.position?.y || node.positionY || 0,
            },
            data: {
              label: node.data.label,
              type: node.data.type,
              description: node.data.description,
              icon: node.data.icon,
              config:
                typeof node.data.config === "string"
                  ? JSON.parse(node.data.config || "{}")
                  : node.data.config || {},
            },
            width: node.width || 225,
            height: node.height || 66,
            selected: node.selected || false,
            dragging: node.dragging || false,
          }));

          // Transform edges from backend format to ReactFlow format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedEdges = data.edges.map((edge: any) => ({
            id: edge.id,
            type: edge.type || "smoothstep",
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            animated: edge.animated || false,
            style:
              typeof edge.style === "string"
                ? JSON.parse(edge.style)
                : edge.style || {
                    stroke: "#4f46e5",
                    strokeWidth: 2,
                  },
          }));

          // Set the transformed data to state
          setNodes(transformedNodes);
          setEdges(transformedEdges);
        } else {
          // If no data, set initial nodes
          setNodes(initialNodes);
          setEdges(initialEdges);
        }
      } catch (error) {
        console.error("Error fetching workflow:", error);
        // On error, set initial nodes
        setNodes(initialNodes);
        setEdges(initialEdges);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, []);

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

      setNodes((nds) => nds.concat(newNode));
      setShowTemplates(false);
    },
    [reactFlowInstance, setNodes],
  );

  const handleDraft = async () => {
    const name = "Test";
    console.log({ name, nodes, edges });
    try {
      // Transform nodes to match backend DTO
      const transformedNodes = nodes.map((node) => ({
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

      // Transform edges to match backend DTO
      const transformedEdges = edges.map((edge) => ({
        id: edge.id,
        type: edge.type,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        animated: edge.animated || false,
        // Stringify the style object
        style: JSON.stringify({
          stroke: edge.style?.stroke || "#4f46e5",
          strokeWidth: edge.style?.strokeWidth || 2,
        }),
      }));

      const response = await apiClient("/api/workflow", {
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

  return (
    <div className="w-full h-[calc(100vh-80px)]">
      <div className="w-full h-full" ref={reactFlowWrapper}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            fitView
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { stroke: "#4f46e5", strokeWidth: 2 },
            }}
          >
            <MiniMap
              nodeStrokeColor="#4f46e5"
              nodeColor="#c7d2fe"
              maskColor="rgba(245, 247, 250, 0.8)"
            />
            <Controls />
            <Background gap={24} />
            <Panel
              position="top-center"
              className="flex items-center justify-between w-full"
            >
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <PlusIcon size={18} />
                  <span>Add Node</span>
                  <ChevronDownIcon
                    size={18}
                    className={`transition-transform ${showTemplates ? "rotate-180" : ""}`}
                  />
                </button>
                {showTemplates && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700">
                        Node Templates
                      </h3>
                    </div>
                    <div className="p-2 max-h-60 overflow-y-auto">
                      {nodeTemplates.map((template, index) => (
                        <button
                          key={index}
                          className="flex items-start gap-3 p-3 w-full text-left hover:bg-gray-50 rounded-md transition-colors"
                          onClick={() => onAddNode(template)}
                        >
                          <div
                            className={`p-2 rounded-md ${
                              template.type === "start"
                                ? "bg-green-100 text-green-600"
                                : template.type === "end"
                                  ? "bg-red-100 text-red-600"
                                  : template.type === "condition"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : template.type === "api"
                                      ? "bg-purple-100 text-purple-600"
                                      : template.type === "data"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-indigo-100 text-indigo-600"
                            }`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 3V21M3 12H21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {template.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {template.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-4 mr-8">
                <button
                  onClick={handleDraft}
                  className="px-4 py-2 text-sm bg-white text-gray-700 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Save Draft
                </button>
                <button className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
                  Publish
                </button>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilder />
    </ReactFlowProvider>
  );
}
