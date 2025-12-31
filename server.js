require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const initSocketServer = require("./src/sockets/socket.server");
const http = require("http");

const httpServer = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize socket
initSocketServer(httpServer);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
