# Auroma AI Chat Backend

A real-time conversational AI backend named **Auroma**, inspired by Chatgpt, featuring **user authentication, chat management, AI-powered responses, and RAG (Retrieval-Augmented Generation)** using Google Gemini and Pinecone.

---

## Features

* **User Authentication**: Register/Login with JWT tokens and secure password hashing.
* **Real-Time Chat**: Powered by Socket.IO for instant messaging.
* **AI Integration**: Google GenAI (*Gemini-2.5-flash*) provides personalized, supportive AI responses.
* **RAG (Retrieval-Augmented Generation)**: Embeddings stored in Pinecone enable context-aware replies.
* **Database Models**: Users, Chats, and Messages are persisted in MongoDB.

---

## Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Real-Time**: Socket.IO
* **Vector Database**: Pinecone
* **AI**: Google GenAI (Gemini)
* **Authentication**: JWT, bcryptjs, cookie-parser

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/rakhi890rs/chatgpt-clone.git
cd chatgpt-clone
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_genai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

4. Run the server:

```bash
npm run dev
```

---

## Usage

### Authentication

**Register**: `POST /api/auth/register`
**Login**: `POST /api/auth/login`

JWT token is stored in an HTTP-only cookie.

### Real-Time Chat

Connect via Socket.IO from frontend:

```js
socket.emit("ai-message", {
  chat: "chatId",
  content: "Hello Auroma!",
});

socket.on("ai-response", (message) => {
  console.log(message.content);
});
```

### RAG Workflow

1. User message saved in MongoDB.
2. Embedding generated using Google GenAI.
3. Embedding stored in Pinecone.
4. Retrieve relevant messages from Pinecone.
5. AI generates response using recent history + retrieved memory.
6. AI response sent to frontend and saved in DB with vector for future retrieval.

---



## Future Enhancements

* Typing indicators in frontend.
* Conversation summaries for memory compression.
* Multi-device chat sync.
* More structured AI prompts for enhanced context.

---

## License

MIT License © 2026 Rakhi Singh
