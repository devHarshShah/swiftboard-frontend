import { useState } from "react";
import { PlusIcon, ChevronDownIcon } from "lucide-react";
import NodeTemplateList from "./node-template";
import { nodeTemplates } from "@/src/types";

interface AddNodeButtonProps {
  onAddNode: (template: (typeof nodeTemplates)[0]) => void;
}

export default function AddNodeButton({ onAddNode }: AddNodeButtonProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleAddNode = (template: (typeof nodeTemplates)[0]) => {
    onAddNode(template);
    setShowTemplates(false);
  };

  return (
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

      {showTemplates && <NodeTemplateList onSelectTemplate={handleAddNode} />}
    </div>
  );
}
