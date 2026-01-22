const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiService = require("../service/ai.service");
const { createMemory, queryMemory } = require("../service/vector.service");

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

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      console.log(messagePayload);

      const userMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      });

      const userVector = await aiService.generateVector(
        messagePayload.content
      );

      if (userVector) {
        await createMemory({
          messageId: userMessage._id.toString(),
          vectors: userVector,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            role: "user",
          },
        });
      }

      const chatHistory = (
        await messageModel
          .find({ chat: messagePayload.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

      const formattedHistory = chatHistory.map((item) => ({
        role: item.role,
        parts: [{ text: item.content }],
      }));

      if (formattedHistory.length === 0) {
        formattedHistory.push({
          role: "user",
          parts: [{ text: messagePayload.content }],
        });
      }

      const response = await aiService.generateResponse(formattedHistory);

      const modelMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const modelVector = await aiService.generateVector(response);

      if (modelVector) {
        await createMemory({
          messageId: modelMessage._id.toString(),
          vectors: modelVector,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            role: "model",
          },
        });
      }

      if (userVector) {
        const memory = await queryMemory({
          queryVector: userVector,
          limit: 1,
          metadata: {
            chat: messagePayload.chat,
          },
        });
        console.log(memory);
      }

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initSocketServer;
