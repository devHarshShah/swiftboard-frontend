import { Panel } from "reactflow";
import AddNodeButton from "./add-node";
import WorkflowActions from "./workflow-actions";
import WorkflowHeader from "./workflow-header";
import { nodeTemplates } from "@/src/types/types";

interface WorkflowPanelProps {
  name: string;
  setName: (name: string) => void;
  workflowFetched: boolean;
  handleDraft: () => void;
  updateDraft: () => void;
  publishWorkflow: () => void;
  onAddNode: (template: (typeof nodeTemplates)[0]) => void;
}

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
