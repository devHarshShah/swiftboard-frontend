import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalType =
  | "CREATE_TEAM"
  | "CREATE_PROJECT"
  | "DELETE_CONFIRMATION"
  | null;

interface ModalContextType {
  modalType: ModalType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modalProps: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState({});

  const openModal = (type: ModalType, props = {}) => {
    setModalType(type);
    setModalProps(props);
  };

  const closeModal = () => {
    setModalType(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider
      value={{ modalType, modalProps, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
