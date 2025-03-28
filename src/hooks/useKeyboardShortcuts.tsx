import { useEffect } from "react";
import { Node, Edge } from "reactflow";

interface UseKeyboardShortcutsProps {
  selectedElements: {
    nodes: Node[];
    edges: Edge[];
  };
  deleteSelectedElements: () => void;
}

export function useKeyboardShortcuts({
  selectedElements,
  deleteSelectedElements,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Delete" &&
        (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0)
      ) {
        deleteSelectedElements();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElements, deleteSelectedElements]);
}
