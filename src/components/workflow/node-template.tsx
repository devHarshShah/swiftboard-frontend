import { nodeTemplates } from "@/src/types";

interface NodeTemplateListProps {
  onSelectTemplate: (template: (typeof nodeTemplates)[0]) => void;
}

export default function NodeTemplateList({
  onSelectTemplate,
}: NodeTemplateListProps) {
  return (
    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Node Templates</h3>
      </div>
      <div className="p-2 max-h-60 overflow-y-auto">
        {nodeTemplates.map((template, index) => (
          <button
            key={index}
            className="flex items-start gap-3 p-3 w-full text-left hover:bg-gray-50 rounded-md transition-colors"
            onClick={() => onSelectTemplate(template)}
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
              <div className="font-medium text-gray-800">{template.label}</div>
              <div className="text-xs text-gray-500">
                {template.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
