const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt=require('jsonwebtoken');
const userModel= require('../models/user.model')
function initSocketServer(httpServer) {
    const io = new Server(httpServer, {});
    io.use(async (socket, next) => {
        const cookieHeader = socket.handshake.headers?.cookie;
        if (!cookieHeader) {
            return next(new Error("Authentication error: No cookies"));
        }
        const cookies = cookie.parse(cookieHeader);
        if (!cookies.token) {
            return next(new Error("Authentication error: No token provided"));
        }
        try{
            const decoded= jwt.verify(cookies.token,process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);
            socket.user= user;
            next();

        }catch(err){
             return next(new Error("Authentication error: Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        socket.on('ai-message',async(messagePayload)=>{
            console.log(messagePayload);
        })
    });
}

module.exports = initSocketServer;


// io.use() is a Socket.IO middleware that executes during the handshake phase, before a socket connection is established, and is commonly used for authentication and authorization.
