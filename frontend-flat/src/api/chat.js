import { api } from './api.js'

/**
 * Documented endpoints, used exactly as specified:
 *   POST   /api/chat            -> create chat
 *   GET    /api/chat            -> list chats
 *   GET    /api/chat/:chatId    -> get messages
 *   POST   /api/chat/:chatId    -> send message. Backend returns the
 *                                  saved user message document directly
 *                                  (res.json(userMessage)), not wrapped
 *                                  in { message: ... }. The AI reply is
 *                                  generated async after the response is
 *                                  sent and saved as a separate message
 *                                  with role "model".
 *   DELETE /api/chat/:chatId    -> delete chat (added during backend review)
 */

export async function createChatRequest(title = 'New Chat') {
  const { data } = await api.post('/api/chat', { title })
  return data.chat
}

export async function getChatsRequest() {
  const { data } = await api.get('/api/chat')
  return data.chats
}

export async function getMessagesRequest(chatId) {
  const { data } = await api.get(`/api/chat/${chatId}`)
  return data.messages
}

export async function sendMessageRequest(chatId, message) {
  const { data } = await api.post(`/api/chat/${chatId}`, { message })
  return data
}

export async function deleteChatRequest(chatId) {
  const { data } = await api.delete(`/api/chat/${chatId}`)
  return data
}

/**
 * The backend saves the AI reply asynchronously in the background,
 * so there's no single request/response round trip that returns it.
 * Until the backend adds a push channel (the project already has a
 * Socket.IO server scaffolded — wiring sendMessage to emit on it would
 * let this be replaced with a subscription), the only way to discover
 * the AI reply is to re-fetch the message list and look for a new
 * entry. Isolating that here means swapping it out later only touches
 * this one function, not any page that calls it.
 */
export async function pollForReply(chatId, knownCount, { interval = 1500, timeout = 45000 } = {}) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const messages = await getMessagesRequest(chatId)
    if (messages.length > knownCount) {
      return messages
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  throw new Error('Timed out waiting for a reply.')
}
