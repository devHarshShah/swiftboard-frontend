"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAppContext } from "./app-context";

interface WebSocketContextProps {
  chatSocket: typeof Socket | null;
  notificationSocket: typeof Socket | null;
  isChatConnected: boolean;
  isNotificationConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  chatSocket: null,
  notificationSocket: null,
  isChatConnected: false,
  isNotificationConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chatSocket, setChatSocket] = useState<typeof Socket | null>(null);
  const [notificationSocket, setNotificationSocket] = useState<
    typeof Socket | null
  >(null);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const { user } = useAppContext();
  const currentUser = user?.id;

  useEffect(() => {
    // Chat socket connection
    const chatSocketInstance = io("http://localhost:8000/chat", {
      query: { userId: currentUser },
      transports: ["websocket"],
    });
    chatSocketInstance.on("connect", () => {
      setIsChatConnected(true);
      console.log("Chat socket connected");
    });

    chatSocketInstance.on("disconnect", () => {
      setIsChatConnected(false);
      console.log("Chat socket disconnected");
    });

    setChatSocket(chatSocketInstance);

    // Notification socket connection
    const notificationSocketInstance = io(
      "http://localhost:8000/notification",
      {
        transports: ["websocket"],
      },
    );

    notificationSocketInstance.on("connect", () => {
      setIsNotificationConnected(true);
      console.log("Notification socket connected");
    });

    notificationSocketInstance.on("disconnect", () => {
      setIsNotificationConnected(false);
      console.log("Notification socket disconnected");
    });

    setNotificationSocket(notificationSocketInstance);

    return () => {
      chatSocketInstance.disconnect();
      notificationSocketInstance.disconnect();
    };
  }, [currentUser]);

  return (
    <WebSocketContext.Provider
      value={{
        chatSocket,
        notificationSocket,
        isChatConnected,
        isNotificationConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
