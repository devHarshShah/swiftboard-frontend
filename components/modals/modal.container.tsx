import React from "react";
import { useModal } from "../modal-provider";
import CreateUserModal from "./create-team";

const ModalContainer: React.FC = () => {
  const { modalType } = useModal();

  if (!modalType) return null;

  switch (modalType) {
    case "CREATE_USER":
      return <CreateUserModal />;
    case "EDIT_USER":
      return <CreateUserModal />;
    case "DELETE_CONFIRMATION":
      return <CreateUserModal />;
    default:
      return null;
  }
};

export default ModalContainer;
