import React from "react";
import Modal from "../ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "../modal-provider";

interface CreateUserModalProps {
  onSubmit: (userData: { name: string; email: string }) => void;
}

const CreateUserModal: React.FC = () => {
  const { closeModal, modalProps } = useModal();
  const { onSubmit } = modalProps as CreateUserModalProps;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    onSubmit(userData);
    closeModal();
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Create New User"
      description="Fill out the form to create a new user."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Enter user name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit">Create User</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
