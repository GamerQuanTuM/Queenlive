# 📩 Chat Messaging System Documentation

This document explains how the chat messaging system works, including how messages are sent, received, and marked as read in real-time.

## 🧠 Core Concepts
- **Real-time messaging** is handled using Socket.IO.
- **Optimistic UI updates** are used to show sent messages instantly.
- **Message read receipts** are implemented via a `markAsRead` event and double-check icons.

---

## 💬 Sending Messages

### When the user sends a message:
1. A **temporary message** object is created and added to the UI immediately.
2. The message is emitted via socket to the server:

```ts
socket.emit("message", {
  content: newMessage,
  receiverId: selectedChat.user.id,
});
```

3. The `lastMessage` preview in the chat list is updated.

---

## 📥 Receiving Messages

### `handleIncomingMessage` function:
- Listens to `socket.on("message", handler)`.
- Adds the message to the chat UI if it's from the currently selected chat.
- Updates the `lastMessage` in the chat list.

```ts
const handleIncomingMessage = (data: Chat) => {
  setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, data] }));
  updateLastMessage(data);
};
```

### Example:
- **Bob** sends a message to **Alice**.
- If **Alice** has the chat open, she sees the message appear live.

---

## ✅ Marking Messages as Read

### When a user opens a chat:
```ts
socket.emit("markAsRead", {
  userId: currentUser?.id,
  otherUserId: chatUser.id,
});
```

- This tells the server: "I've read all messages from this user."
- Server updates DB and broadcasts a `messagesRead` event.

### UI Update:
```ts
socket.on("messagesRead", ({ readerId }) => {
  setSelectedChat(prev => ({
    ...prev,
    messages: prev.messages.map(msg =>
      msg.receiver.id === readerId ? { ...msg, isRead: true } : msg
    ),
  }));
});
```

---

## ✔️✔️ Message Read Icons

```tsx
{isSentByCurrentUser && (
  <div className="text-xs text-gray-400">
    {message.isRead ? <CheckCheck size={16} /> : <Check size={16} />}
  </div>
)}
```

- ✅ Single check: Sent but not read
- ✅✅ Double check: Read by receiver

---

## 🧩 Example Scenario

### 1. Bob opens chat with Alice:
- `handleChatSelection` fetches messages and emits `markAsRead`.

### 2. Alice sends a message:
- Bob receives it via `handleIncomingMessage`.
- Message appears in real-time.

### 3. Bob sees the message:
- `markAsRead` is emitted.
- Alice receives `messagesRead` and her UI updates with ✅✅.

---

## 🔄 Socket Events Summary

| Event           | Triggered By   | Description                                |
|----------------|----------------|--------------------------------------------|
| `message`      | Sender         | Sends a message to the server              |
| `message`      | Server         | Broadcasts the message to the receiver     |
| `markAsRead`   | Viewer         | Tells server which messages were read      |
| `messagesRead` | Server         | Notifies sender their message was read     |

---


