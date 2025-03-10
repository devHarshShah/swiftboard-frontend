import React, { useState } from "react";
import Modal from "../ui/modal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useModal } from "../modal-provider";
import { apiClient } from "@/src/lib/apiClient";

interface CreateUserModalProps {
  onSubmit: (teamData: { name: string; emails: string[] }) => void;
}

const CreateUserModal: React.FC = () => {
  const { closeModal, modalProps } = useModal();
  const { onSubmit } = modalProps as CreateUserModalProps;
  const [emails, setEmails] = useState<string[]>([]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const emailList = value.split(",").map((email) => email.trim());
    setEmails(emailList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const teamData = {
      name: formData.get("name") as string,
      emails: emails,
    };

    try {
      const response = await apiClient("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      const data = await response.json();
      onSubmit(data);
    } catch (error) {
      console.error("Error creating team:", error);
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Create New Team"
      description="Fill out the form to create a new team."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Enter team name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emails">Emails</Label>
          <Input
            id="emails"
            name="emails"
            placeholder="Enter comma-separated email addresses"
            onChange={handleEmailChange}
            required
          />
          <div className="max-h-32 overflow-y-auto scrollbar-custom space-y-1">
            {emails.map((email, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {email}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit">Create Team</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
