"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface WebSocketContextType {
  socket: typeof Socket | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8000"); // Replace with your WebSocket server URL
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
