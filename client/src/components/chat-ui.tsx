"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Send, X } from "lucide-react";
import { ChatUserMessages } from "@/app/chat/page";
import { useAuth } from "@/providers/auth";
import axiosInstance from "@/utils/axiosInstance";
import { useSocket } from "@/providers/socket";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Chat {
  id: number;
  content: string;
  isRead: boolean;
  sender: User;
  receiver: User;
  createdAt: string;
  updatedAt: string;
}

interface SelectedChat {
  user: ChatUserMessages;
  messages: Chat[];
}

const ChatUI = ({
  chatMessages: initialChatMessages,
}: {
  chatMessages: ChatUserMessages[];
}) => {
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatMessages, setChatMessages] =
    useState<ChatUserMessages[]>(initialChatMessages);
  const [showSidebar, setShowSidebar] = useState(true);
  // const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: currentUser } = useAuth();
  const { isConnected, socket, onlineUsers, setOnlineUsers } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Automatically hide sidebar on mobile when chat is selected
  useEffect(() => {
    if (selectedChat && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, [selectedChat]);

  const handleChatSelection = async (chatUser: ChatUserMessages) => {
    try {
      const res = await axiosInstance.get(`/chat/conversation/${chatUser.id}`);
      const messages: Chat[] = res.data;
      setSelectedChat({ user: chatUser, messages });

      socket?.emit("markAsRead", {
        userId: currentUser?.id,
        otherUserId: chatUser.id,
      });

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };

  const closeChat = () => {
    setSelectedChat(null);
    if (window.innerWidth < 768) {
      setShowSidebar(true);
    }
  };

  const updateLastMessage = (data: Chat) => {
    setChatMessages((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === data.sender.id || chat.id === data.receiver.id) {
          return {
            ...chat,
            lastMessage: {
              id: data.id,
              content: data.content,
              isRead: data.isRead,
              createdAt: data.createdAt,
              sentByCurrentUser: data.sender.id === currentUser?.id,
            },
          };
        }
        return chat;
      })
    );
  };

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleIncomingMessage = (data: Chat) => {
      setSelectedChat((prev) => {
        if (
          prev &&
          (data.sender.id === prev.user.id || data.receiver.id === prev.user.id)
        ) {
          const alreadyExists = prev.messages.some((msg) => msg.id === data.id);
          if (alreadyExists) return prev;

          return {
            ...prev,
            messages: [...prev.messages, data],
          };
        }
        return prev;
      });

      updateLastMessage(data);
    };

    socket.on("message", handleIncomingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, [socket, currentUser]);

  useEffect(() => {
    if (!socket) return;

    const handleMessagesRead = ({ readerId }: { readerId: number }) => {
      setSelectedChat((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((msg) =>
                // 'isRead' is updated in the local state when a new message arrives,
                // but it's also synced with the backend after a page reload to ensure consistency.
                msg.receiver.id === readerId ? { ...msg, isRead: true } : msg
              ),
            }
          : null
      );
    };

    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !onlineUsers) return;
    const onlineUsersData = (data: any) => {
      console.log(data);
      setOnlineUsers(data);
    };

    socket.on("all-online-users", onlineUsersData);

    return () => {
      socket.off("all-online-users", onlineUsersData);
    };
  }, [socket]);

  console.log(onlineUsers);

  const handleSendMessage = () => {
    if (
      !newMessage.trim() ||
      !selectedChat ||
      !currentUser ||
      !socket ||
      !isConnected
    )
      return;

    // Optimistic Update
    const tempMessage: Chat = {
      id: Date.now(),
      content: newMessage,
      isRead: false,
      sender: currentUser,
      receiver: {
        id: selectedChat.user.id,
        name: selectedChat.user.name,
        email: selectedChat.user.email,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSelectedChat((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, tempMessage],
          }
        : null
    );

    socket.emit("message", {
      content: newMessage,
      receiverId: selectedChat.user.id,
    });

    updateLastMessage(tempMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get the initials for avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket || !currentUser || !selectedChat) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing event
    socket?.emit("typing", {
      userId: currentUser?.id,
      otherUserId: selectedChat?.user.id,
    });

    // Set a timeout to stop typing event
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stoppedTyping", {
        userId: currentUser?.id,
        otherUserId: selectedChat?.user.id,
      });
    }, 2000);
  };

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: { userId: number }) => {
      if (selectedChat && data.userId === selectedChat.user.id) {
        setIsTyping(true);
      }
    };

    const handleStoppedTyping = (data: { userId: number }) => {
      if (selectedChat && data.userId === selectedChat.user.id) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stoppedTyping", handleStoppedTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stoppedTyping", handleStoppedTyping);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile header - always visible */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-30 h-16 flex items-center px-4">
        {selectedChat ? (
          <>
            <div className="flex items-center flex-1">
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                {selectedChat.user ? getInitials(selectedChat.user.name) : ""}
              </div>
              <div className="ml-2 overflow-hidden">
                <span className="font-medium block truncate">
                  {selectedChat.user?.name}
                </span>
                <span className="text-xs text-gray-500 truncate block">
                  {selectedChat.user?.email}
                </span>
              </div>
            </div>
            <Button
              onClick={closeChat}
              className="ml-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold flex-1">Messages</h1>
          </>
        )}
      </div>

      {/* Sidebar / Chat list */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 fixed md:relative md:block
        w-full md:w-80 lg:w-96 h-full bg-white z-20 md:z-0 border-r overflow-hidden flex flex-col`}
      >
        <div className="hidden md:flex p-4 border-b">
          <h1 className="text-xl font-semibold flex-1">Messages</h1>
        </div>

        <div className="overflow-y-auto flex-1 pt-16 md:pt-0">
          {chatMessages.length > 0 ? (
            chatMessages.map((chat) => {
              const isUnread =
                chat.lastMessage &&
                !chat.lastMessage.isRead &&
                !chat.lastMessage.sentByCurrentUser;

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelection(chat)}
                  className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 border-b ${
                    selectedChat?.user.id === chat.id ? "bg-blue-50" : ""
                  } ${isUnread ? "bg-blue-50/40" : ""}`}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                    {getInitials(chat.name)}
                  </div>

                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.name}
                        {onlineUsers.includes(chat.id) && (
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-2"></span>
                        )}
                      </h3>
                    </div>

                    <div className="flex items-center mt-1">
                      <p className={"text-sm truncate text-gray-500"}>
                        {chat.lastMessage?.sentByCurrentUser && "You: "}
                        {chat.lastMessage?.content ?? "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat view */}
      <div
        className={`flex-1 flex flex-col h-full ${
          !showSidebar ? "z-10" : "hidden md:flex"
        }`}
      >
        {selectedChat ? (
          <>
            {/* Chat header - desktop only */}
            <div className="hidden md:flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                  {getInitials(selectedChat.user.name)}
                </div>
                <div className="ml-3">
                  <h2 className="font-medium">
                    {selectedChat.user.name}
                    {onlineUsers.includes(selectedChat.user.id) && (
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-2"></span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedChat.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages area - with proper padding-top for mobile */}
            <div className="flex-1 overflow-y-auto p-4 pt-20 md:pt-4 space-y-4 bg-gray-50">
              {selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((message, index) => {
                  const isSentByCurrentUser =
                    message.sender.id === currentUser?.id;

                  //Inside the loop where the messages are being mapped, the code compares the createdAt timestamp of the current message to that of the previous message.
                  // If the createdAt timestamp is on the same day as the previous message, it doesn't show a date separator.
                  //If the current message's date is different from the previous message's date, it displays the date separator.
                  //The date is formatted using the formatMessageDate function, which checks if the message is from today or yesterday. If it's neither, it formats it with the month and day.
                  const showDate =
                    index === 0 ||
                    new Date(message.createdAt).toDateString() !==
                      new Date(
                        // Index is the current message's index in the array in the iteration. And -1 gives the previous message's index.
                        selectedChat.messages[index - 1].createdAt
                      ).toDateString();

                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex ${
                          isSentByCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="flex items-end gap-2 max-w-xs sm:max-w-md group">
                          {/* Message bubble */}
                          <div
                            className={`p-3 rounded-2xl ${
                              isSentByCurrentUser
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>

                          {/* Read indicators for sent messages */}
                          {isSentByCurrentUser && (
                            <div className="text-xs text-gray-400">
                              {message.isRead ? (
                                <CheckCheck
                                  size={16}
                                  className="text-blue-500"
                                />
                              ) : (
                                <Check size={16} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 my-12">
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">
                    Start a conversation with {selectedChat.user.name}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {isTyping && (
              <div className="px-4 pb-1 pt-0">
                <div className="bg-gray-200 text-gray-500 px-3 py-1.5 rounded-xl text-sm inline-flex items-center">
                  <span className="ml-1 flex h-5 w-5 items-center justify-center">
                    <span
                      className="h-1.5 w-1.5 bg-gray-500 rounded-full mr-0.5 animate-pulse"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="h-1.5 w-1.5 bg-gray-500 rounded-full mr-0.5 animate-pulse"
                      style={{ animationDelay: "200ms" }}
                    ></span>
                    <span
                      className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-pulse"
                      style={{ animationDelay: "400ms" }}
                    ></span>
                  </span>
                </div>
              </div>
            )}

            {/* Message input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 pl-4 pr-2 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
                <Input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onFocus={() => {
                    if (!socket || !currentUser || !selectedChat) return;
                    socket?.emit("typing", {
                      userId: currentUser?.id,
                      otherUserId: selectedChat?.user.id,
                    });
                  }}
                  onBlur={() => {
                    if (!socket || !currentUser || !selectedChat) return;
                    socket?.emit("stoppedTyping", {
                      userId: currentUser?.id,
                      otherUserId: selectedChat?.user.id,
                    });
                  }}
                  onChange={handleMessageChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                    newMessage.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 p-4 pt-20 md:pt-4">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Your Messages</h3>
            <p className="text-center max-w-sm">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUI;
