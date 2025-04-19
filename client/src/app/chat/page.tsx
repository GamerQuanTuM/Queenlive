import ChatUI from "@/components/chat-ui";
import { Role } from "@/providers/auth";
import { baseURL } from "@/utils/axiosInstance";
import axios from "axios";
import { cookies } from "next/headers";
import React from "react";

export interface ChatUserMessages {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  lastMessage: LastMessage | null;
}

export interface LastMessage {
  id: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sentByCurrentUser: boolean;
}

const Chat = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("role")?.value;
  let selectedRole;

  if (role === "MERCHANT") {
    selectedRole = "CUSTOMER";
  } else {
    selectedRole = "MERCHANT";
  }

  const chatMessages = await axios.get<ChatUserMessages[]>(
    `${baseURL}/auth/get-all-users-type/${selectedRole}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return (
    <>
      <ChatUI chatMessages={chatMessages.data} />
    </>
  );
};

export default Chat;
