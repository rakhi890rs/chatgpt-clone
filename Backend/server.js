require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");
const http = require("http");

// Connect to MongoDB
connectDB();

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocketServer(httpServer);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Use Render's PORT or local 3000
const PORT = process.env.PORT || 3000;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});