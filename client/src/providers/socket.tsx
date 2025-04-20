"use client";
import { createContext, SetStateAction, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: number[];
  setOnlineUsers: (value: SetStateAction<number[]>) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  setOnlineUsers: (_value: SetStateAction<number[]>) => {}
});


export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  // Monitor token changes
  useEffect(() => {
    // Initial token check
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }

    // Setup storage event listener to detect token changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        setToken(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for token in case it's set by another process
    const tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken && currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(tokenCheckInterval);
    };
  }, [token]);

  // Handle socket connection when token changes
  useEffect(() => {
    if (!token) {
      console.log("No token available, waiting for token...");
      return;
    }

    console.log("Token available, attempting to connect to socket server...");

    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
      {
        auth: {
          authorization: `Bearer ${token}`,
        },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnection: true,
        timeout: 10000,
      }
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected successfully:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      // Try to reconnect after error
      setTimeout(() => {
        console.log("Attempting to reconnect after error...");
        socketInstance.connect();
      }, 2000);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("all-online-users", (users: any) => {
      console.log("All online users:", users);
      setOnlineUsers(users);
    });

    setSocket(socketInstance);

    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, onlineUsers, setOnlineUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
};
