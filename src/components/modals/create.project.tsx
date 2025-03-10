import React, { useState, useEffect } from "react";
import Modal from "../ui/modal";
import { ChevronDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useModal } from "../modal-provider";
import { apiClient } from "@/src/lib/apiClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface CreateProjectModalProps {
  onSubmit: (projectData: { name: string; teamId: string }) => void;
}

const CreateProjectModal: React.FC = () => {
  const { closeModal, modalProps } = useModal();
  const { onSubmit } = modalProps as CreateProjectModalProps;
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient(
          "/api/project/team/?filterByRole=true",
          {
            method: "GET",
          },
        );
        const data = await response.json();
        if (response.ok) {
          setTeams(data);
          if (data.length > 0) {
            setSelectedTeamId(data[0].id);
            setSelectedTeamName(data[0].name);
          }
        } else {
          console.error("Failed to fetch teams:", data.error);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const projectData = {
      name: formData.get("name") as string,
      teamId: selectedTeamId,
    };

    try {
      const response = await apiClient("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      onSubmit(data);
    } catch (error) {
      console.error("Error creating project:", error);
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Create New Project"
      description="Fill out the form to create a new project."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter project name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team">Assign to Team</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-left flex justify-between items-center"
              >
                {selectedTeamName || "Select a team"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full">
              {teams.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setSelectedTeamName(team.name);
                  }}
                >
                  {team.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
