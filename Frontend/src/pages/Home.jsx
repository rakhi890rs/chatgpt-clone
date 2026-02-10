// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  PencilSquareIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  Squares2X2Icon,
  CodeBracketIcon,
  FolderIcon,
  MicrophoneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// Initialize Socket.IO client
const socket = io("http://localhost:3000", { withCredentials: true });

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [chats, setChats] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch chats on mount
  useEffect(() => {
    const fetchOrCreateChat = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/chat", {
          withCredentials: true,
        });

        setChats(res.data.chats || []);

        if (res.data.chats.length > 0) {
          setChatId(res.data.chats[0]._id);
        } else {
          const createRes = await axios.post(
            "http://localhost:3000/api/chat",
            { title: "New Chat" },
            { withCredentials: true }
          );
          setChatId(createRes.data.chat._id);
          setChats([createRes.data.chat]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchOrCreateChat();
  }, []);

  // Listen for AI responses
  useEffect(() => {
    socket.on("ai-response", (msg) => {
      setMessages((prev) => [...prev, { user: "Aurona", text: msg.content }]);
    });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) =>
      console.error("Socket connection error:", err)
    );

    return () => {
      socket.off("ai-response");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input || !chatId) return;

    socket.emit("ai-message", { chat: chatId, content: input });
    setMessages((prev) => [...prev, { user: "You", text: input }]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-3 py-2 border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-200 rounded-lg text-sm font-medium">
            <span>ChatGPT</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-2 space-y-1">
            <NavItem icon={<PencilSquareIcon />} text="New chat" />
            <NavItem icon={<MagnifyingGlassIcon />} text="Search chats" />
            <NavItem icon={<PhotoIcon />} text="Images" />
            <NavItem icon={<Squares2X2Icon />} text="Apps" />
            <NavItem icon={<CodeBracketIcon />} text="Codex" external />
            <NavItem icon={<FolderIcon />} text="Projects" />
          </div>

          <div className="mt-4">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500">
              Your chats
            </div>
            <div className="px-2 space-y-0.5">
              {chats.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => setChatId(chat._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors ${
                    chat._id === chatId ? "bg-gray-200 font-medium" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {chat._id === chatId && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    )}
                    <span className="truncate">{chat.title || "New Chat"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-end">
            <span className="text-sm text-blue-600 font-medium">🎁 Free offer</span>
          </div>
        </div>

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
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-white border border-gray-300 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <button className="absolute left-4 p-1 hover:bg-gray-100 rounded-full">
                <PlusIcon className="w-5 h-5 text-gray-500" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything"
                className="flex-1 px-12 py-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
              />
              <div className="flex items-center gap-2 pr-3">
                <button className="p-1.5 hover:bg-gray-100 rounded-full">
                  <MicrophoneIcon className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input || !chatId}
                  className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar nav item
function NavItem({ icon, text, external }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors group">
      <span className="w-5 h-5 text-gray-600">{icon}</span>
      <span className="flex-1 text-left">{text}</span>
      {external && (
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </button>
  );
}

export default Home;