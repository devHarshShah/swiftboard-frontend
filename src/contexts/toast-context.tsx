"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastProps } from "@/src/components/ui/toast";

type ToastContextType = {
  showToast: (props: Omit<ToastProps, "open" | "onOpenChange">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = useCallback(
    (props: Omit<ToastProps, "open" | "onOpenChange">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast = {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }
        },
      };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, open: false } : t)),
        );
      }, 5000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
