"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface WebSocketContextProps {
  socket: typeof Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  socket: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Replace with your actual backend URL
    const socketInstance = io("http://localhost:8000", {
      transports: ["websocket"],
      // Add any auth tokens if needed
      // auth: { token: "your-auth-token" }
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
