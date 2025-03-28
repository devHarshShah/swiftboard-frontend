import React, { useRef, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, NodeTypes } from "reactflow";
import "reactflow/dist/style.css";
import WorkflowNode from "@/src/components/workflow-node";
import { useWorkflowData } from "@/src/hooks/useWorkflowData";
import { useWorkflowOperations } from "@/src/hooks/useWorkFlowOperations";
import WorkflowPanel from "./workflow-panel";
import WorkflowLoading from "./workflow-loading";

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

const WorkflowBuilder: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const {
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
  } = useWorkflowData();

  const {
    onConnect,
    onAddNode,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedElements,
    onSelectionChange,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteSelectedElements,
    handleDraft,
    updateDraft,
    publishWorkflow,
  } = useWorkflowOperations({
    nodes,
    edges,
    reactFlowInstance,
    name,
    setNodes,
    setEdges,
    workflowFetched,
  });

  if (isLoading) {
    return <WorkflowLoading />;
  }

  return (
    <div className="w-full h-[calc(100vh-80px)]">
      <div className="w-full h-full" ref={reactFlowWrapper}>
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
          onSelectionChange={onSelectionChange}
          deleteKeyCode={["Delete", "Backspace"]}
        >
          <MiniMap
            nodeStrokeColor="#4f46e5"
            nodeColor="#c7d2fe"
            maskColor="rgba(245, 247, 250, 0.8)"
          />
          <Controls />
          <Background gap={24} />

          <WorkflowPanel
            name={name}
            setName={setName}
            workflowFetched={workflowFetched}
            handleDraft={handleDraft}
            updateDraft={updateDraft}
            publishWorkflow={publishWorkflow}
            onAddNode={onAddNode}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
