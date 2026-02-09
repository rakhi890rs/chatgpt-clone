// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

// Initialize Socket.IO client
const socket = io("http://localhost:3000", { withCredentials: true });

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(""); // current chat id
  const [loadingChats, setLoadingChats] = useState(true);

  // Fetch user chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/chat", {
          withCredentials: true, // send cookies for auth
        });
        if (res.data.chats.length > 0) {
          setChatId(res.data.chats[0]._id); // use first chat
          console.log("Using chatId:", res.data.chats[0]._id);
        } else {
          console.log("No chats found");
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // Listen for AI responses
  useEffect(() => {
    socket.on("ai-response", (msg) => {
      console.log("Received AI response:", msg);
      setMessages((prev) => [...prev, { user: "Aurona", text: msg.content }]);
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.off("ai-response");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // Send message
  const sendMessage = () => {
    if (!input) return;
    if (!chatId) {
      console.warn("No chat selected. Cannot send message.");
      return;
    }

    console.log("Sending message:", input, "to chatId:", chatId);

    socket.emit("ai-message", {
      chat: chatId,
      content: input,
    });

    setMessages((prev) => [...prev, { user: "You", text: input }]);
    setInput("");
  };

  if (loadingChats) return <p>Loading chats...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <h2>Chat with Aurona</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "300px",
          marginBottom: "10px",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && <p>No messages yet</p>}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "80%", marginRight: "10px" }}
          autoComplete="off"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Home;