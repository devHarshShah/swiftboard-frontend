import { WorkflowActionsProps } from "@/src/types";

export default function WorkflowActions({
  workflowFetched,
  handleDraft,
  updateDraft,
  publishWorkflow,
}: WorkflowActionsProps) {
  return (
    <div className="flex flex-row gap-4 mr-8">
      {workflowFetched ? (
        <button
          onClick={updateDraft}
          className="px-4 py-2 text-sm bg-white text-gray-700 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Update Draft
        </button>
      ) : (
        <button
          onClick={handleDraft}
          className="px-4 py-2 text-sm bg-white text-gray-700 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Save Draft
        </button>
      )}
      <button
        className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
        onClick={publishWorkflow}
      >
        Publish
      </button>
    </div>
  );
}
