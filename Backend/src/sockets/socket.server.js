const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiService = require("../service/ai.service");
const { createMemory, queryMemory } = require("../service/vector.service");

function extractText(msg) {
  if (typeof msg === "string") return msg;
  if (msg.content) return msg.content;
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts.map(p => p.text || "").join(" ");
  }
  return "";
}

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",  // <-- frontend origin
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  io.use(async (socket, next) => {
    const cookieHeader = socket.handshake.headers?.cookie;
    if (!cookieHeader) return next(new Error("Authentication error: No cookies"));

    const cookies = cookie.parse(cookieHeader);
    if (!cookies.token) return next(new Error("Authentication error: No token"));

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
    console.log("A user connected:", socket.user?.email);

    socket.on("ai-message", async (messagePayload) => {
      try {
        console.log("User message payload:", messagePayload);

        const [userMessage, userVector] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: messagePayload.content,
            role: "user",
          }),
          aiService.generateVector(extractText(messagePayload.content))
        ]);

        if (userVector) {
          await createMemory({
            messageId: userMessage._id.toString(),
            vectors: userVector,
            metadata: {
              chat: messagePayload.chat,
              user: socket.user._id,
              role: "user",
              text: messagePayload.content,
            },
          });
        }

        const [memory, chatHistory] = await Promise.all([
          userVector
            ? queryMemory({
                queryVector: userVector,
                limit: 3,
                metadata: { chat: messagePayload.chat },
              })
            : { matches: [] },
          messageModel
            .find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
        ]);

        const formattedHistory = chatHistory.reverse().map(item => ({
          role: item.role,
          content: item.content,
        }));

        const longTermMemory = memory.matches.map(item => ({
          role: "system",
          content: item.metadata.text,
        }));

        const aiInput = [...longTermMemory, ...formattedHistory];
        console.log("AI input:", aiInput);

        const response = await aiService.generateResponse(aiInput);

        socket.emit("ai-response", {
          content: response,
          chat: messagePayload.chat,
        });

        (async () => {
          try {
            const [modelMessage, modelVector] = await Promise.all([
              messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: response,
                role: "model",
              }),
              aiService.generateVector(extractText(response)),
            ]);

            if (modelVector) {
              await createMemory({
                messageId: modelMessage._id.toString(),
                vectors: modelVector,
                metadata: {
                  chat: messagePayload.chat,
                  user: socket.user._id,
                  role: "model",
                  text: response,
                },
              });
            }
          } catch (err) {
            console.error("Error saving AI response/vector:", err);
          }
        })();

      } catch (err) {
        console.error("Socket AI error:", err);
      }
    });
  });
}

module.exports = initSocketServer;