import { io } from "socket.io-client";

// Connect to your Socket.IO server
const socket = io("http://localhost:3000", {
  withCredentials: true, // required if server uses cookies/JWT
});

// Log connection
socket.on("connect", () => {
  console.log("Connected to server with socket id:", socket.id);

  // Send a test AI message
  socket.emit("ai-message", {
    chat: "696f14fb96dead3cf55fc183",
    content: "Hello AI, how are you?"
  });
});

// Listen for AI responses
socket.on("ai-response", (data) => {
  console.log("AI Response:", data);
});

// Handle connection errors
socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

// Optional: handle disconnects
socket.on("disconnect", (reason) => {
  console.log("Disconnected from server:", reason);
});
