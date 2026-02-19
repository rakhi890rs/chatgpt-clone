// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  PencilSquareIcon,
  MicrophoneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// Initialize Socket.IO client
const socket = io("http://localhost:3000", { withCredentials: true });

function Home() {
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [chatTitleInput, setChatTitleInput] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/chat", {
          withCredentials: true,
        });
        const chatsData = res.data.chats || [];

        setChats(chatsData);

        if (chatsData.length > 0) {
          setChatId(chatsData[0]._id);
          setMessages(chatsData[0].messages || []);
        } else {
          // If no chat exists, create one
          const createRes = await axios.post(
            "http://localhost:3000/api/chat",
            { title: "New Chat" },
            { withCredentials: true }
          );
          const newChat = createRes.data.chat;
          setChats([newChat]);
          setChatId(newChat._id);
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // Listen for AI responses
  useEffect(() => {
    socket.on("ai-response", (msg) => {
      setMessages((prev) => [...prev, { user: "Aurona", text: msg.content }]);
      // Also update messages in chats array
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? { ...chat, messages: [...(chat.messages || []), { user: "Aurona", text: msg.content }] }
            : chat
        )
      );
    });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket connection error:", err));

    return () => {
      socket.off("ai-response");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [chatId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!input || !chatId) return;

    socket.emit("ai-message", { chat: chatId, content: input });
    const newMessage = { user: "You", text: input };

    setMessages((prev) => [...prev, newMessage]);
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId
          ? { ...chat, messages: [...(chat.messages || []), newMessage] }
          : chat
      )
    );
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Create new chat
  const createNewChat = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/chat",
        { title: "New Chat" },
        { withCredentials: true }
      );
      const newChat = res.data.chat;
      setChats((prev) => [newChat, ...prev]);
      setChatId(newChat._id);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  // Edit chat title
  const startEditingTitle = (chat) => {
    setEditingChatId(chat._id);
    setChatTitleInput(chat.title);
  };

  const saveChatTitle = async (chat) => {
    if (!chatTitleInput.trim()) return;
    try {
      const res = await axios.patch(
        `http://localhost:3000/api/chat/${chat._id}`,
        { title: chatTitleInput },
        { withCredentials: true }
      );
      const updatedChat = res.data.chat;

      // Update chats array immutably
      setChats((prev) =>
        prev.map((c) => (c._id === chat._id ? { ...c, title: updatedChat.title } : c))
      );

      setEditingChatId(null);
    } catch (err) {
      console.error("Failed to update chat title:", err);
    }
  };

  // Switch chat
  const switchChat = (id) => {
    setChatId(id);
    const chat = chats.find((c) => c._id === id);
    setMessages(chat?.messages || []);
  };

  if (loadingChats) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#f9f9f9] border-r border-gray-200 flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-blue-500 rounded-sm"></div>
            <span className="font-medium">ChatGPT</span>
          </div>
          <button
            onClick={createNewChat}
            className="p-1 hover:bg-gray-200 rounded"
            title="New Chat"
          >
            <PlusIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {chats.map((chat) => (
            <div key={chat._id} className="flex items-center justify-between px-2 py-1">
              {editingChatId === chat._id ? (
                <input
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  value={chatTitleInput}
                  onChange={(e) => setChatTitleInput(e.target.value)}
                  onBlur={() => saveChatTitle(chat)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveChatTitle(chat);
                  }}
                  autoFocus
                />
              ) : (
                <button
                  className={`flex-1 text-left px-2 py-1 rounded text-sm hover:bg-gray-200 ${
                    chat._id === chatId ? "bg-gray-200 font-medium" : ""
                  }`}
                  onClick={() => switchChat(chat._id)}
                >
                  {chat.title || "New Chat"}
                </button>
              )}
              <button
                onClick={() => startEditingTitle(chat)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <PencilSquareIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <h1 className="text-2xl font-medium text-gray-800 mb-8">
                What are you working on?
              </h1>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.user === "You" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                    msg.user === "You"
                      ? "bg-gradient-to-br from-purple-400 to-pink-400"
                      : "bg-gradient-to-br from-teal-400 to-blue-500"
                  }`}
                >
                  {msg.user === "You" ? "Y" : "A"}
                </div>
                <div className={`flex-1 ${msg.user === "You" ? "text-right" : ""}`}>
                  <div className="text-sm font-semibold mb-1 text-gray-700">{msg.user}</div>
                  <div className="text-gray-800 whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything"
              className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 rounded-3xl border border-gray-300"
            />
            <button
              onClick={sendMessage}
              disabled={!input || !chatId}
              className="p-2 hover:bg-gray-100 rounded-full ml-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;