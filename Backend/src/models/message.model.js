const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "model"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);


// mongoose.Schema.Types.ObjectId → stores a reference to another document (in this case, the User collection).

// ref: "User" → tells Mongoose which collection to reference.
