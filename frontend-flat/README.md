# Nimbus — Frontend for your GPT Clone (flat structure)

React + Vite + Tailwind frontend, matching your project's file layout:
`src/api/` for HTTP calls, `src/pages/` for screens, `App.jsx` +
`AppRoutes.jsx` at the top level. No separate `components/`, `context/`,
or `hooks/` folders — theme and auth state live in `App.jsx`, and all
UI for the chat screen is inlined in `pages/Home.jsx`.

## File map

```
src/
  api/
    api.js     - axios instance + auth calls (register, login, me, logout)
    chat.js    - chat calls (create, list, messages, send, delete) + reply polling
  pages/
    Login.jsx
    Register.jsx
    Logout.jsx - fires the logout call on mount, then redirects to /login
    Home.jsx   - the main chat screen: sidebar + chat window, all in one file
  App.jsx      - theme + auth context/providers, renders <AppRoutes />
  AppRoutes.jsx- route table + inline ProtectedRoute guard
  main.jsx
  index.css
```

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend, e.g. http://localhost:3000
npm run dev
```

Your backend needs `Access-Control-Allow-Credentials: true` and a specific
(non-wildcard) `Access-Control-Allow-Origin` matching this app's origin, or
the browser will drop the auth cookie on cross-origin requests. (Confirmed
against your `app.js` — you already have this right for `localhost:5173`.)

## Backend review — status of everything found during integration

Verified against your actual controllers, routes, models, and server files:

1. **`GET /api/auth/me`** and **`POST /api/auth/logout`** — not in the
   original brief, added during review since the app has no other way to
   restore a session from an HTTP-only cookie or to clear it. Code for both
   was provided separately; `api/api.js` calls them.

2. **`DELETE /api/chat/:chatId`** — required by the UI spec but no
   controller/route existed. `api/chat.js` calls it optimistically (chat
   disappears immediately, rolls back on error); a `deleteChat` controller
   was provided separately — confirm it's wired into `chat.routes.js`.

3. **Chat search** — no endpoint documented. `Home.jsx` filters the
   already-fetched chat list client-side by title. Fine at low volume; add
   server-side search/pagination if a user could accumulate many chats.

4. **`sendMessage` response shape — confirmed.** Your controller does
   `res.status(201).json(userMessage)`: the message document directly, not
   wrapped in `{ message: ... }`. `Home.jsx` reads it that way.

5. **Message `role` values — confirmed as `"user"` / `"model"`** (not
   `"ai"`) once the schema/controller mismatch found during review is fixed.
   `ChatMessageBubble` only special-cases `"user"`; anything else renders as
   an assistant bubble, so this needed no frontend change either way.

6. **No push channel wired up yet for the AI reply**, even though the
   project already has a Socket.IO server scaffolded
   (`src/sockets/socket.server.js` on the backend). Until `sendMessage`
   actually emits on it, `api/chat.js` polls `GET /api/chat/:chatId` every
   1.5s (capped at 45s) for the new message. This is isolated in
   `pollForReply` specifically so it can be replaced by a socket
   subscription later without touching `Home.jsx`.

7. **`Chat.user` ref casing** (`ref: 'user'` vs the registered model name
   `"User"`) and **`lastActivity` never updating after creation** were both
   found in `chat.model.js` / `chat.controller.js` during review — fixes
   were provided separately. Neither required a frontend change.

8. **Cookie settings are dev-only** (`secure: false, sameSite: "lax"`) —
   fine for `localhost`, but will need `secure: true, sameSite: "none"`
   together with HTTPS before deploying frontend and backend on different
   domains.

## Notes on the flat structure

- Theme (dark/light, persisted to `localStorage`, respects
  `prefers-color-scheme` on first visit) and auth (current user, loading,
  login/register/logout) are both defined directly in `App.jsx` via
  `createContext`/`useContext`, and exported as `useTheme()` / `useAuth()`
  for pages to import.
- `Home.jsx` contains small unexported helper components
  (`ChatMessageBubble`, `CodeBlock`, `ChatInputBar`, `ConfirmDialog`,
  `TypingIndicator`, `ThemeToggleButton`) defined in the same file rather
  than split out, per this project's structure. Markdown rendering and
  syntax highlighting use `react-markdown` + `react-syntax-highlighter`
  (which wraps Prism).
- Optimistic UI: sending a message renders it immediately and reconciles
  with the server's confirmed copy; deleting a chat removes it immediately
  and rolls back on failure.
