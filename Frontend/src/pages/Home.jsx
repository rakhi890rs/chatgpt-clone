import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch previous chats on mount
  useEffect(() => {
    fetchPreviousChats();
  }, []);

  const fetchPreviousChats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat`, {
        withCredentials: true,
      });
      setPreviousChats(res.data.chats || []);
    } catch (err) {
      console.error("Error fetching chats:", err.response?.data || err.message);
    }
  };

  // Create a new chat
  const createNewChat = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat`,
        { title: "New Chat" },
        { withCredentials: true }
      );
      setCurrentChatId(res.data.chat._id);
      setMessages([]);
      setPreviousChats([res.data.chat, ...previousChats]);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Error creating chat:", err.response?.data || err.message);
    }
  };

  // Load an existing chat
  const loadChat = async (chatId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chat/${chatId}`,
        { withCredentials: true }
      );
      setMessages(res.data.messages || []);
      setCurrentChatId(chatId);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Error loading chat:", err.response?.data || err.message);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    // Auto-create chat if none exists
    if (!currentChatId) {
      await createNewChat();
    }

    const userMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/${currentChatId}/message`,
        { message: currentInput },
        { withCredentials: true }
      );

      const aiMessage = {
        role: "ai",
        content: res.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
      const errorMessage = {
        role: "ai",
        content:
          err.response?.data?.message || "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: "relative",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          position: isMobile ? "fixed" : "relative",
          left: isMobile && !sidebarOpen ? "-280px" : "0",
          top: 0,
          width: "280px",
          height: "100vh",
          background: "#1a1a1a",
          transition: "left 0.3s ease",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #2d2d2d",
          }}
        >
          <button
            onClick={createNewChat}
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + New Chat
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px",
          }}
        >
          {previousChats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => loadChat(chat._id)}
              style={{
                padding: "12px 16px",
                marginBottom: "8px",
                background: currentChatId === chat._id ? "#2d2d2d" : "transparent",
                color: "#e5e5e5",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Main Chat Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#f5f5f5",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "white",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "8px",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#333",
              }}
            >
              ☰
            </button>
          )}
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#333",
              margin: 0,
            }}
          >
            AI Chat Assistant
          </h1>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
              <h2 style={{ fontSize: "24px", marginBottom: "8px", color: "#333" }}>
                Start a Conversation
              </h2>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Send a message to begin chatting with AI
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "white",
                    color: msg.role === "user" ? "white" : "#333",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "16px",
                  background: "white",
                  color: "#666",
                  fontSize: "15px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                AI is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "20px",
            background: "white",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <form
            onSubmit={handleSendMessage}
            style={{
              display: "flex",
              gap: "12px",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              autoComplete="off"
              style={{
                flex: 1,
                padding: "14px 16px",
                fontSize: "15px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                outline: "none",
                background: loading ? "#f5f5f5" : "white",
                color: "#333",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              style={{
                padding: "14px 24px",
                background:
                  loading || !userInput.trim()
                    ? "#ccc"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading || !userInput.trim() ? "not-allowed" : "pointer",
                minWidth: "80px",
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;