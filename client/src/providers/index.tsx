"use client";
import { ReactNode } from "react";
import { SocketProvider } from "./socket";
import { AuthProvider } from "./auth";

const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AuthProvider>
        <SocketProvider>
          {children}
          </SocketProvider>
      </AuthProvider>
    </>
  );
};

export default Provider;
