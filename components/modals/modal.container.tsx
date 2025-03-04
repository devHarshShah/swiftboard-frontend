import React from "react";
import { useModal } from "../modal-provider";
import CreateUserModal from "./create-team";
import CreateProjectModal from "./create.project";

const ModalContainer: React.FC = () => {
  const { modalType } = useModal();

  if (!modalType) return null;

  switch (modalType) {
    case "CREATE_TEAM":
      return <CreateUserModal />;
    case "CREATE_PROJECT":
      return <CreateProjectModal />;
    case "DELETE_CONFIRMATION":
      return <CreateUserModal />;
    default:
      return null;
  }
};

export default ModalContainer;
