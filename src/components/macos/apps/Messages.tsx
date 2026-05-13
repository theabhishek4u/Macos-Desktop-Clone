'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Plus,
  Phone,
  Video,
  MoreHorizontal,
  Send,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  time: string
  read: boolean
}

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  messages: Message[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-orange-500 to-red-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-yellow-500 to-orange-500',
  'from-teal-500 to-cyan-500',
  'from-rose-500 to-pink-500',
]

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'AJ',
    lastMessage: 'Sounds great! See you at 7 🎉',
    time: '2:34 PM',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', text: 'Hey! Are we still on for dinner tonight?', sender: 'me', time: '2:15 PM', read: true },
      { id: 'm2', text: 'Yes! I was just about to text you', sender: 'them', time: '2:18 PM', read: true },
      { id: 'm3', text: 'Perfect. Should we try that new Italian place?', sender: 'me', time: '2:20 PM', read: true },
      { id: 'm4', text: 'Omg yes! I heard their pasta is amazing 🍝', sender: 'them', time: '2:25 PM', read: true },
      { id: 'm5', text: 'Great! I\'ll make a reservation for 7', sender: 'me', time: '2:28 PM', read: true },
      { id: 'm6', text: 'Sounds great! See you at 7 🎉', sender: 'them', time: '2:34 PM', read: false },
    ],
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: 'SC',
    lastMessage: 'Can you send me the project files?',
    time: '1:45 PM',
    unread: 1,
    online: true,
    messages: [
      { id: 'm1', text: 'Hey Sarah! How\'s the project going?', sender: 'me', time: '1:20 PM', read: true },
      { id: 'm2', text: 'Going well! Almost done with the design', sender: 'them', time: '1:30 PM', read: true },
      { id: 'm3', text: 'Nice! Need any help?', sender: 'me', time: '1:35 PM', read: true },
      { id: 'm4', text: 'Can you send me the project files?', sender: 'them', time: '1:45 PM', read: false },
    ],
  },
  {
    id: '3',
    name: 'Mike Williams',
    avatar: 'MW',
    lastMessage: 'The game was incredible last night!',
    time: '11:30 AM',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', text: 'Did you watch the game?', sender: 'them', time: '10:00 PM', read: true },
      { id: 'm2', text: 'YES! What a comeback!', sender: 'me', time: '10:05 PM', read: true },
      { id: 'm3', text: 'The game was incredible last night!', sender: 'them', time: '11:30 AM', read: true },
    ],
  },
  {
    id: '4',
    name: 'Emily Davis',
    avatar: 'ED',
    lastMessage: 'Thanks for the recommendation!',
    time: 'Yesterday',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', text: 'Have you seen that new movie?', sender: 'me', time: '3:00 PM', read: true },
      { id: 'm2', text: 'Not yet! Is it good?', sender: 'them', time: '3:15 PM', read: true },
      { id: 'm3', text: 'It\'s amazing, you should definitely watch it', sender: 'me', time: '3:20 PM', read: true },
      { id: 'm4', text: 'Thanks for the recommendation!', sender: 'them', time: '4:00 PM', read: true },
    ],
  },
  {
    id: '5',
    name: 'David Kim',
    avatar: 'DK',
    lastMessage: 'Let me know when you\'re free this weekend',
    time: 'Yesterday',
    unread: 0,
    online: true,
    messages: [
      { id: 'm1', text: 'Hey! Want to go hiking this weekend?', sender: 'them', time: '5:00 PM', read: true },
      { id: 'm2', text: 'That sounds fun! Which trail?', sender: 'me', time: '5:10 PM', read: true },
      { id: 'm3', text: 'I was thinking the mountain trail', sender: 'them', time: '5:15 PM', read: true },
      { id: 'm4', text: 'Let me know when you\'re free this weekend', sender: 'them', time: '5:20 PM', read: true },
    ],
  },
  {
    id: '6',
    name: 'Family Group',
    avatar: 'FG',
    lastMessage: 'Mom: Don\'t forget Sunday dinner!',
    time: 'Tue',
    unread: 3,
    online: false,
    messages: [
      { id: 'm1', text: 'Who\'s coming to Sunday dinner?', sender: 'them', time: '6:00 PM', read: true },
      { id: 'm2', text: 'I\'ll be there!', sender: 'me', time: '6:05 PM', read: true },
      { id: 'm3', text: 'Don\'t forget Sunday dinner!', sender: 'them', time: '7:00 PM', read: false },
    ],
  },
]

// ─── Components ──────────────────────────────────────────────────────────────

function Avatar({ name, avatar, online, size = 'default' }: { name: string; avatar: string; online: boolean; size?: 'default' | 'large' }) {
  const colorIdx = name.length % AVATAR_COLORS.length
  const dim = size === 'large' ? 48 : 36
  const fontSize = size === 'large' ? 16 : 12
  return (
    <div className="relative shrink-0">
      <div
        className={`bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold`}
        style={{ width: dim, height: dim, fontSize }}
      >
        {avatar}
      </div>
      {online && (
        <div
          className="absolute bottom-0 right-0 bg-green-500 rounded-full border-2 border-[#f5f5f7]"
          style={{ width: size === 'large' ? 14 : 10, height: size === 'large' ? 14 : 10 }}
        />
      )}
    </div>
  )
}

// ─── Main Messages Component ─────────────────────────────────────────────────

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSend = () => {
    if (!inputText.trim() || !activeConversationId) return

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      text: inputText.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      read: false,
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage.text, time: newMessage.time, unread: 0 }
          : c
      )
    )
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length])

  return (
    <div className="flex w-full h-full bg-[#f5f5f7] text-gray-900 select-none overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <div className="shrink-0 w-[260px] bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 text-[13px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                activeConversationId === conv.id
                  ? 'bg-blue-500/10'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => { setActiveConversationId(conv.id); setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)) }}
            >
              <Avatar name={conv.name} avatar={conv.avatar} online={conv.online} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13px] font-medium truncate">{conv.name}</span>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500 truncate">{conv.lastMessage}</span>
                  {conv.unread > 0 && (
                    <span className="shrink-0 ml-2 min-w-[18px] h-[18px] bg-blue-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New message button */}
        <div className="shrink-0 px-3 py-2 border-t border-gray-100">
          <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-[13px] font-medium transition-colors">
            <Plus size={16} />
            New Message
          </button>
        </div>
      </div>

      {/* ─── Chat Area ────────────────────────────────────────────── */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Chat header */}
          <div className="shrink-0 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Avatar name={activeConversation.name} avatar={activeConversation.avatar} online={activeConversation.online} size="large" />
              <div>
                <h3 className="text-[14px] font-semibold">{activeConversation.name}</h3>
                <span className="text-[11px] text-gray-400">
                  {activeConversation.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Phone size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Video size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
            <div className="space-y-1.5">
              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-1.5 rounded-2xl text-[14px] leading-snug ${
                      msg.sender === 'me'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <span>{msg.text}</span>
                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${
                      msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.sender === 'me' && (
                        msg.read ? <CheckCheck size={12} /> : <Check size={12} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input */}
          <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0">
                <Paperclip size={18} />
              </button>
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-end gap-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="iMessage"
                  className="flex-1 text-[14px] outline-none bg-transparent resize-none text-gray-900 placeholder:text-gray-400 min-h-[20px] max-h-[80px]"
                  rows={1}
                />
                <button className="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors shrink-0">
                  <Smile size={18} />
                </button>
              </div>
              {inputText.trim() ? (
                <button
                  className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shrink-0"
                  onClick={handleSend}
                >
                  <Send size={16} />
                </button>
              ) : (
                <button className="p-2 rounded-full text-gray-300 shrink-0">
                  <Send size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smile size={28} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-1">Messages</h3>
            <p className="text-sm text-gray-400">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}
