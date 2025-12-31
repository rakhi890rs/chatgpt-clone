const { Server } = require("socket.io");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // change later for security
        }
    });

    io.on("connection", (socket) => {
        console.log("New socket connection:", socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
}

module.exports = initSocketServer;
