require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const initSocketServer = require("./src/sockets/socket.server");
const http = require("http");

// Connect to MongoDB
connectDB();

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize socket
initSocketServer(httpServer);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 
//

// Start server
httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
});
