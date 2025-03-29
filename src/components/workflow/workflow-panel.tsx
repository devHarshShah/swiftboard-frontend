import { Panel } from "reactflow";
import AddNodeButton from "./add-node";
import WorkflowActions from "./workflow-actions";
import WorkflowHeader from "./workflow-header";
import { WorkflowPanelProps } from "@/src/types";

export default function WorkflowPanel({
  name,
  setName,
  workflowFetched,
  handleDraft,
  updateDraft,
  publishWorkflow,
  onAddNode,
}: WorkflowPanelProps) {
  return (
    <Panel
      position="top-center"
      className="flex items-center justify-between w-full"
    >
      <AddNodeButton onAddNode={onAddNode} />

      <WorkflowHeader name={name} setName={setName} />

      <WorkflowActions
        workflowFetched={workflowFetched}
        handleDraft={handleDraft}
        updateDraft={updateDraft}
        publishWorkflow={publishWorkflow}
      />
    </Panel>
  );
}
