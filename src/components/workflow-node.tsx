import React, { useState, useCallback, useEffect } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { User, WorkflowNodeData } from "@/src/types/types";
import {
  CircleAlert,
  Settings2,
  Trash2,
  Users,
  Play,
  Square,
  GitBranch,
  Globe,
  Database,
  ListTodo,
  Check,
} from "lucide-react";
import { UserSelector } from "./kanban/user-selector";
import { apiClient } from "../lib/apiClient";
import Cookies from "js-cookie";

interface Task {
  id: string;
  name: string;
  description: string;
}

const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({
  data,
  selected,
  id,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const { getNode, getEdges } = useReactFlow();
  const [users, setUsers] = useState<User[]>([]);
  const teamId = Cookies.get("activeTeamId");

  const fetchUsers = useCallback(async () => {
    if (!teamId) return;

    try {
      const response = await apiClient(`/api/teams/${teamId}/members`);
      const userData = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = userData.map((member: any) => member.user);
      setUsers(users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  }, [teamId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [localData, setLocalData] = useState({
    label: data.label,
    description: data.description,
    conditionType: data.config?.conditionType || "Expression",
    userIds: data.config?.userIds || [],
    blockedBy: data.config?.blockedBy || [],
  });

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setLocalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check for upstream task nodes
  useEffect(() => {
    if (data.type === "task") {
      const edges = getEdges();
      const incomingEdges = edges.filter((edge) => edge.target === id);

      const blockedByNodes = incomingEdges
        .map((edge) => {
          const sourceNode = getNode(edge.source);
          if (sourceNode && sourceNode.data.type === "task") {
            return {
              id: sourceNode.id,
              name: sourceNode.data.label,
              description: sourceNode.data.description,
            };
          }
          return null;
        })
        .filter(Boolean);

      // Update local data with blocked by nodes
      if (blockedByNodes.length > 0) {
        setLocalData((prev) => {
          // Check if nodes already exist in blockedBy
          const existingIds: string[] = prev.blockedBy.map(
            (task: { id: string }) => task.id,
          );
          const newBlockedBy = [
            ...prev.blockedBy,
            ...blockedByNodes.filter(
              (node): node is NonNullable<typeof node> =>
                node !== null && !existingIds.includes(node.id),
            ),
          ];

          return {
            ...prev,
            blockedBy: newBlockedBy,
          };
        });
      }
    }
  }, [id, data.type, getEdges, getNode]);

  const handleApplyChanges = useCallback(() => {
    const updatedData = {
      ...data,
      label: localData.label,
      description: localData.description,
      config: {
        ...data.config,
        conditionType:
          data.type === "condition" ? localData.conditionType : undefined,
        userIds: data.type === "task" ? localData.userIds : undefined,
        blockedBy: data.type === "task" ? localData.blockedBy : undefined,
      },
    };

    const event = new CustomEvent("nodeConfigUpdate", {
      detail: { nodeId: id, updatedData },
    });
    window.dispatchEvent(event);

    setShowConfig(false);
  }, [data, localData, id]);

  const handleUserToggle = (userId: string) => {
    const currentUserIds = localData.userIds || [];

    const updatedUserIds: string[] = currentUserIds.includes(userId)
      ? currentUserIds.filter((id: string) => id !== userId)
      : [...currentUserIds, userId];

    setLocalData((prev) => ({
      ...prev,
      userIds: updatedUserIds,
    }));
  };
  const getSelectedUsers = () => {
    const selectedUserIds = localData.userIds || [];
    return selectedUserIds
      .map((userId: string) => users.find((user: User) => user.id === userId))
      .filter((user: User): user is User => Boolean(user)) as User[];
  };

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
      case "task":
        return `${baseStyle} ${selectedStyle} bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200`;
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
      case "task":
        return "text-teal-600";
      default:
        return "text-indigo-600";
    }
  };

  const getNodeIcon = () => {
    const iconProps = {
      size: 18,
      className: "stroke-current",
    };

    switch (data.type) {
      case "start":
        return <Play {...iconProps} />;
      case "end":
        return <Square {...iconProps} />;
      case "condition":
        return <GitBranch {...iconProps} />;
      case "api":
        return <Globe {...iconProps} />;
      case "data":
        return <Database {...iconProps} />;
      case "task":
        return <ListTodo {...iconProps} />;
      default:
        return <Check {...iconProps} />;
    }
  };

  // Display assigned users badge if task node has assignments
  const hasAssignments =
    data.type === "task" &&
    ((data.config?.userIds && data.config.userIds.length > 0) ||
      (localData.userIds && localData.userIds.length > 0));

  // Display blocked by badge if task node has dependencies
  const hasBlockers =
    data.type === "task" &&
    ((data.config?.blockedBy && data.config.blockedBy.length > 0) ||
      (localData.blockedBy && localData.blockedBy.length > 0));

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
        <div className="flex items-center justify-between mb-1">
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

        {(hasAssignments || hasBlockers) && (
          <div className="flex gap-2 mt-1 ml-8">
            {hasAssignments && (
              <div className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                <Users size={12} className="mr-1" />
                {(data.config?.userIds || localData.userIds).length}
              </div>
            )}
            {hasBlockers && (
              <div className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                <CircleAlert size={12} className="mr-1" />
                {localData.blockedBy.length}
              </div>
            )}
          </div>
        )}

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
                  name="label"
                  value={localData.label}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={localData.description}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {data.type === "condition" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Condition Type
                  </label>
                  <select
                    name="conditionType"
                    value={localData.conditionType}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>Expression</option>
                    <option>Data-based</option>
                    <option>Time-based</option>
                  </select>
                </div>
              )}

              {/* Task assignment for task nodes */}
              {data.type === "task" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Assign Users
                    </label>
                    <UserSelector
                      users={users} // You'll need to provide actual users here
                      selectedUsers={getSelectedUsers()}
                      onToggleUser={handleUserToggle}
                      searchQuery={userSearchQuery}
                      setSearchQuery={setUserSearchQuery}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Blocked By
                    </label>
                    <div className="text-xs text-gray-500 mb-1">
                      Auto-detected: {localData.blockedBy?.length || 0} tasks
                    </div>
                    {localData.blockedBy && localData.blockedBy.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {localData.blockedBy.map((task: Task) => (
                          <div
                            key={task.id}
                            className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full flex items-center"
                          >
                            {task.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <button
                  onClick={handleApplyChanges}
                  className="w-full px-3 py-1 mt-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                >
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
