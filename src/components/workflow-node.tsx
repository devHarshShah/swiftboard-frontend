// components/WorkflowNode.tsx
import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { WorkflowNodeData } from "@/src/types/types";
import { Settings2, Trash2 } from "lucide-react";

const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({
  data,
  selected,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const getNodeStyles = () => {
    const baseStyle =
      "px-4 py-3 rounded-lg shadow-lg transition-all duration-200";
    const selectedStyle = selected
      ? "ring-2 ring-indigo-500 ring-offset-2"
      : "";

    switch (data.type) {
      case "start":
        return `${baseStyle} ${selectedStyle} bg-gradient-to-br from-green-50 to-green-100 border border-green-200`;
      case "end":
        return `${baseStyle} ${selectedStyle} bg-gradient-to-br from-red-50 to-red-100 border border-red-200`;
      case "condition":
        return `${baseStyle} ${selectedStyle} bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200`;
      case "api":
        return `${baseStyle} ${selectedStyle} bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200`;
      case "data":
        return `${baseStyle} ${selectedStyle} bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200`;
      default:
        return `${baseStyle} ${selectedStyle} bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200`;
    }
  };

  const getIconColor = () => {
    switch (data.type) {
      case "start":
        return "text-green-600";
      case "end":
        return "text-red-600";
      case "condition":
        return "text-yellow-600";
      case "api":
        return "text-purple-600";
      case "data":
        return "text-blue-600";
      default:
        return "text-indigo-600";
    }
  };

  const getNodeIcon = () => {
    switch (data.type) {
      case "start":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12h14M12 5v14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "end":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case "condition":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 3v18m12-18v18M3 6h6m6 0h6M3 18h6m6 0h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "api":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 12c0-5.523-4.477-10-10-10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 2"
            />
          </svg>
        );
      case "data":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="12"
              cy="5"
              rx="9"
              ry="3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M21 12c0 1.657-4.03 3-9 3s-9-1.343-9-3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      default:
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <>
      {data.type !== "start" && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-white border-2 border-indigo-500"
        />
      )}

      <div className={getNodeStyles()} style={{ minWidth: "180px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md ${getIconColor()} bg-white bg-opacity-70`}
            >
              {getNodeIcon()}
            </div>
            <div>
              <div className="font-medium text-gray-800">{data.label}</div>
              <div className="text-xs text-gray-500">{data.description}</div>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1 rounded-md hover:bg-black hover:bg-opacity-5 ${showConfig ? "bg-black bg-opacity-5" : ""}`}
          >
            <Settings2 size={16} className="text-gray-500" />
          </button>
        </div>

        {showConfig && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-medium text-gray-700">
                Configuration
              </h4>
              <button className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={data.label}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={data.description}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {data.type === "condition" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Condition Type
                  </label>
                  <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Expression</option>
                    <option>Data-based</option>
                    <option>Time-based</option>
                  </select>
                </div>
              )}

              <div>
                <button className="w-full px-3 py-1 mt-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {data.type !== "end" && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-white border-2 border-indigo-500"
        />
      )}
    </>
  );
};

export default WorkflowNode;
