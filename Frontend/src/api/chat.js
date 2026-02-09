// src/api/chat.js
import api from "./api";

// Get default chat for the user
export const getUserChats = async () => {
  const { data } = await api.get("/chat"); // backend route should return user's chats
  return data.chats; // array of chat objects with _id
};