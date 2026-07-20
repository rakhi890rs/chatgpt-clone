import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  FiArrowUp,
  FiCheck,
  FiCopy,
  FiEdit,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSun,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi'
import { RiSparkling2Fill } from 'react-icons/ri'
import { useAuth, useTheme } from '../App.jsx'
import {
  createChatRequest,
  deleteChatRequest,
  getChatsRequest,
  getMessagesRequest,
  pollForReply,
  sendMessageRequest,
} from '../api/chat.js'

const SUGGESTIONS = [
  'Explain a complex topic simply',
  'Help me debug a piece of code',
  'Draft an email for me',
  'Brainstorm ideas for a project',
]

/* =================================================================
 * Small inline building blocks (kept in this file — no components
 * folder in this project's structure)
 * ================================================================= */

function ThemeToggleButton({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-100 ${className}`}
    >
      {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ink-400" style={{ animationDelay: '0ms' }} />
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ink-400" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ink-400" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

function CodeBlock({ inline, className, children }) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const code = String(children).replace(/\n$/, '')

  if (inline) return <code className={className}>{children}</code>

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
      <div className="flex items-center justify-between bg-ink-100 px-3 py-1.5 text-xs text-ink-500 dark:bg-ink-800 dark:text-ink-300">
        <span className="font-mono">{match?.[1] || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:text-ink-900 dark:hover:text-ink-50"
        >
          {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={match?.[1]}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={{ margin: 0, padding: '0.9rem', fontSize: '0.82rem', background: 'transparent' }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function ChatMessageBubble({ role, content }) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900' : 'bg-signal text-ink-950'
        }`}
      >
        {isUser ? <FiUser size={13} /> : <RiSparkling2Fill size={14} />}
      </div>

      <div className={`group max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? 'bg-ink-900 text-ink-50 dark:bg-ink-800'
              : 'bg-white text-ink-900 shadow-sm ring-1 ring-ink-100 dark:bg-ink-900 dark:text-ink-100 dark:ring-ink-800'
          }`}
        >
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 flex items-center gap-1 rounded px-1 text-xs text-ink-400 opacity-0 transition group-hover:opacity-100 hover:text-ink-700 dark:hover:text-ink-200"
          >
            {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
            {copied ? 'Copied' : 'Copy response'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white p-5 shadow-panel dark:border-ink-800 dark:bg-ink-900"
          >
            <h2 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">{title}</h2>
            <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="rounded-lg px-3 py-1.5 text-sm text-ink-500 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChatInputBar({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const autoResize = (el) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    autoResize(e.target)
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-ink-100 bg-ink-50/80 p-3 backdrop-blur dark:border-ink-800 dark:bg-ink-950/80 sm:p-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-ink-200 bg-white px-3 py-2 shadow-panel dark:border-ink-700 dark:bg-ink-900">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Auroma…"
          disabled={disabled}
          className="max-h-48 flex-1 resize-none bg-transparent py-1.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 disabled:opacity-60 dark:text-ink-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white transition disabled:opacity-30 dark:bg-signal dark:text-ink-950"
        >
          <FiArrowUp size={15} />
        </button>
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-ink-300 dark:text-ink-600">
        Auroma can make mistakes. Verify important information.
      </p>
    </div>
  )
}

/* =================================================================
 * Home — main chat screen (sidebar + chat window)
 * ================================================================= */

export default function Home() {
  const { user } = useAuth()

  const [chats, setChats] = useState([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [awaitingReply, setAwaitingReply] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const scrollRef = useRef(null)

  const refreshChats = async () => {
    setChatsLoading(true)
    try {
      const list = await getChatsRequest()
      setChats(list)
    } catch {
      toast.error('Could not load your conversations.')
    } finally {
      setChatsLoading(false)
    }
  }

  useEffect(() => {
    refreshChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, awaitingReply])

  // No search endpoint is documented, so conversation search is
  // done client-side against the already-fetched chat list.
  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats
    return chats.filter((c) => c.title?.toLowerCase().includes(query.trim().toLowerCase()))
  }, [chats, query])

  const openChat = async (chatId) => {
    setCurrentChatId(chatId)
    setMessagesLoading(true)
    setSidebarOpen(false)
    try {
      const list = await getMessagesRequest(chatId)
      setMessages(list)
    } catch {
      toast.error('Could not load this conversation.')
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  const startNewChat = async (title = 'New Chat') => {
    try {
      const chat = await createChatRequest(title)
      setChats((prev) => [chat, ...prev])
      setCurrentChatId(chat._id)
      setMessages([])
      setSidebarOpen(false)
      return chat
    } catch {
      toast.error('Could not start a new chat.')
      throw new Error('create-chat-failed')
    }
  }

  const removeChat = async (chatId) => {
    const previous = chats
    setChats((prev) => prev.filter((c) => c._id !== chatId))
    try {
      await deleteChatRequest(chatId)
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
      }
    } catch {
      setChats(previous) // roll back optimistic removal
      toast.error('Could not delete that chat.')
    }
  }

  const handleSend = async (text) => {
    let chatId = currentChatId
    if (!chatId) {
      const chat = await startNewChat(text.slice(0, 40))
      chatId = chat._id
    }

    const optimisticUser = {
      _id: `local-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticUser])
    setAwaitingReply(true)

    try {
      // Backend returns the saved message document directly
      // (res.json(userMessage)), not wrapped in { message: ... }.
      const confirmedUser = await sendMessageRequest(chatId, text)
      setMessages((prev) => [...prev.filter((m) => m._id !== optimisticUser._id), confirmedUser])

      // The AI reply is generated in the background by the backend.
      // Poll until the message list grows by one. This is isolated in
      // api/chat.js so it can be swapped for the project's existing
      // Socket.IO server later without touching this page.
      const countAfterUser = await getMessagesRequest(chatId).then((m) => m.length)
      const updated = await pollForReply(chatId, countAfterUser)
      setMessages(updated)
    } catch {
      toast.error('The message could not be sent. Please try again.')
      setMessages((prev) => prev.filter((m) => m._id !== optimisticUser._id))
    } finally {
      setAwaitingReply(false)
    }
  }

  const initials = user
    ? `${user.fullname?.firstName?.[0] || ''}${user.fullname?.lastName?.[0] || ''}`.toUpperCase()
    : ''

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-ink-100 bg-white transition-transform duration-200 ease-out dark:border-ink-800 dark:bg-ink-900 md:static md:z-auto md:translate-x-0 md:transition-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 dark:bg-signal">
              <span className="font-display text-sm font-bold text-white dark:text-ink-950">N</span>
            </div>
            <span className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">Auroma</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 md:hidden"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={() => startNewChat()}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <FiEdit size={14} />
            New chat
          </button>

          <div className="relative mb-2">
            <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-lg border border-ink-200 bg-ink-50 py-1.5 pl-8 pr-2 text-xs text-ink-700 outline-none transition focus:border-signal dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {chatsLoading && <p className="px-2 py-4 text-center text-xs text-ink-400">Loading conversations…</p>}
          {!chatsLoading && filteredChats.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-ink-400">
              {query ? 'No chats match your search.' : 'No conversations yet — start one above.'}
            </p>
          )}
          <ul className="space-y-0.5">
            {filteredChats.map((chat) => (
              <li key={chat._id}>
                <div
                  className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                    currentChatId === chat._id
                      ? 'bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-ink-50'
                      : 'text-ink-500 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800/60'
                  }`}
                >
                  <button onClick={() => openChat(chat._id)} className="flex-1 truncate text-left">
                    {chat.title || 'Untitled chat'}
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(chat._id)}
                    aria-label="Delete chat"
                    className="ml-2 shrink-0 rounded p-1 text-ink-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 dark:text-ink-500"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 px-3 py-3 dark:border-ink-800">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-medium text-white dark:bg-ink-700">
              {initials || '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink-800 dark:text-ink-100">
                {user ? `${user.fullname?.firstName} ${user.fullname?.lastName}` : 'Guest'}
              </p>
              <p className="truncate text-[11px] text-ink-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggleButton />
            <Link
              to="/logout"
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-red-500 dark:hover:bg-ink-800"
            >
              <FiLogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete this chat?"
        description="This will permanently remove the conversation and its messages."
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          removeChat(pendingDeleteId)
          setPendingDeleteId(null)
        }}
      />

      {/* Chat window */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-ink-100 px-3 py-2.5 dark:border-ink-800 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <FiMenu size={18} />
          </button>
          <span className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">Auroma</span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {!currentChatId && messages.length === 0 && !messagesLoading ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-signal">
                <RiSparkling2Fill size={22} className="text-ink-950" />
              </div>
              <h1 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
                What's on your mind?
              </h1>
              <p className="mt-1 max-w-sm text-sm text-ink-400">Start typing below, or try one of these.</p>
              <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-xl border border-ink-200 px-3 py-2.5 text-left text-xs text-ink-600 transition hover:border-signal hover:bg-white dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-900"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl py-4">
              {messagesLoading ? (
                <p className="px-4 py-8 text-center text-sm text-ink-400">Loading messages…</p>
              ) : (
                messages.map((m) => <ChatMessageBubble key={m._id} role={m.role} content={m.content} />)
              )}
              {awaitingReply && (
                <div className="flex gap-3 px-4 py-1">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal text-ink-950">
                    <RiSparkling2Fill size={14} />
                  </div>
                  <TypingIndicator />
                </div>
              )}
            </div>
          )}
        </div>

        <ChatInputBar onSend={handleSend} disabled={awaitingReply} />
      </div>
    </div>
  )
}
