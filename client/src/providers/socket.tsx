"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.log("No token found, skipping socket connection");
      return;
    }
  
    console.log("Attempting to connect to socket server...");
    
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
      {
        auth: {
          authorization: `Bearer ${token}`,
        },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );
  
    socketInstance.on("connect", () => {
      console.log("Socket connected successfully:", socketInstance.id);
      setIsConnected(true);
    });
  
    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  
    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });
  
    setSocket(socketInstance);
  
    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
