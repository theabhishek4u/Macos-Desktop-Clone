'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Camera,
  MessageCircle,
  Clock,
  User,
  X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Contact {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'busy'
  lastSeen?: string
}

interface RecentCall {
  id: string
  contact: Contact
  type: 'video' | 'audio'
  direction: 'incoming' | 'outgoing' | 'missed'
  time: string
  duration?: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CONTACTS: Contact[] = [
  { id: '1', name: 'Alex Johnson', avatar: 'AJ', status: 'online' },
  { id: '2', name: 'Sarah Chen', avatar: 'SC', status: 'online' },
  { id: '3', name: 'Mike Williams', avatar: 'MW', status: 'busy' },
  { id: '4', name: 'Emily Davis', avatar: 'ED', status: 'offline', lastSeen: '2h ago' },
  { id: '5', name: 'David Kim', avatar: 'DK', status: 'online' },
  { id: '6', name: 'Lisa Park', avatar: 'LP', status: 'offline', lastSeen: '5h ago' },
  { id: '7', name: 'James Brown', avatar: 'JB', status: 'online' },
  { id: '8', name: 'Olivia Wilson', avatar: 'OW', status: 'offline', lastSeen: '1d ago' },
  { id: '9', name: 'Chris Taylor', avatar: 'CT', status: 'busy' },
  { id: '10', name: 'Rachel Green', avatar: 'RG', status: 'online' },
]

const RECENT_CALLS: RecentCall[] = [
  { id: 'r1', contact: CONTACTS[0], type: 'video', direction: 'outgoing', time: 'Today, 2:30 PM', duration: '12:34' },
  { id: 'r2', contact: CONTACTS[1], type: 'video', direction: 'incoming', time: 'Today, 11:15 AM', duration: '5:22' },
  { id: 'r3', contact: CONTACTS[4], type: 'audio', direction: 'missed', time: 'Today, 9:00 AM' },
  { id: 'r4', contact: CONTACTS[2], type: 'video', direction: 'outgoing', time: 'Yesterday, 6:45 PM', duration: '32:10' },
  { id: 'r5', contact: CONTACTS[6], type: 'audio', direction: 'incoming', time: 'Yesterday, 3:20 PM', duration: '8:45' },
  { id: 'r6', contact: CONTACTS[3], type: 'video', direction: 'missed', time: 'Yesterday, 1:00 PM' },
  { id: 'r7', contact: CONTACTS[8], type: 'audio', direction: 'outgoing', time: 'Mon, 10:30 AM', duration: '15:20' },
]

const AVATAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-teal-500 to-teal-600',
  'from-red-500 to-red-600',
  'from-cyan-500 to-cyan-600',
  'from-amber-500 to-amber-600',
  'from-emerald-500 to-emerald-600',
]

// ─── Components ──────────────────────────────────────────────────────────────

function ContactAvatar({ contact, size = 'default' }: { contact: Contact; size?: 'default' | 'large' }) {
  const colorIdx = parseInt(contact.id) % AVATAR_COLORS.length
  const dim = size === 'large' ? 80 : 40
  const fontSize = size === 'large' ? 24 : 14
  return (
    <div
      className={`relative bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ width: dim, height: dim, fontSize }}
    >
      {contact.avatar}
      {contact.status === 'online' && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          style={{ width: size === 'large' ? 16 : 12, height: size === 'large' ? 16 : 12, borderWidth: size === 'large' ? 3 : 2 }}
        />
      )}
    </div>
  )
}

// ─── Main FaceTime Component ─────────────────────────────────────────────────

export default function FaceTime() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'recent'>('contacts')
  const [searchQuery, setSearchQuery] = useState('')
  const [callingContact, setCallingContact] = useState<Contact | null>(null)
  const [isCallConnected, setIsCallConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCall = (contact: Contact) => {
    setCallingContact(contact)
    setIsCallConnected(false)
    setCallDuration(0)
    // Simulate connecting after 2 seconds
    setTimeout(() => setIsCallConnected(true), 2000)
  }

  const handleEndCall = () => {
    setCallingContact(null)
    setIsCallConnected(false)
    setCallDuration(0)
    setIsMuted(false)
    setIsCameraOff(false)
    if (callTimerRef.current) clearInterval(callTimerRef.current)
  }

  useEffect(() => {
    if (isCallConnected && callingContact) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1)
      }, 1000)
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
  }, [isCallConnected, callingContact])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Active call view
  if (callingContact) {
    return (
      <div className="flex flex-col w-full h-full bg-[#1c1c1e] text-white select-none overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
        {/* Video preview area */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {isCameraOff ? (
            <div className="flex flex-col items-center gap-4">
              <ContactAvatar contact={callingContact} size="large" />
              <span className="text-white/60 text-sm">Camera Off</span>
            </div>
          ) : (
            <>
              {/* Simulated video - dark with camera icon */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <Camera size={64} className="text-white/10" />
              </div>
              {/* Self video preview (small) */}
              <div className="absolute bottom-4 right-4 w-[140px] h-[100px] rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-white/20 flex items-center justify-center shadow-lg">
                <User size={24} className="text-white/40" />
              </div>
            </>
          )}

          {/* Calling overlay */}
          {!isCallConnected && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
              <ContactAvatar contact={callingContact} size="large" />
              <h2 className="text-xl font-semibold mt-4">{callingContact.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white/70 text-sm">Calling...</span>
              </div>
            </div>
          )}

          {/* Connected info */}
          {isCallConnected && (
            <div className="absolute top-6 left-0 right-0 text-center">
              <h2 className="text-lg font-medium">{callingContact.name}</h2>
              <span className="text-white/60 text-sm">{formatDuration(callDuration)}</span>
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="shrink-0 bg-[#2c2c2e]/95 backdrop-blur-xl border-t border-white/5 px-6 py-5">
          <div className="flex items-center justify-center gap-6">
            <button
              className={`p-3.5 rounded-full transition-colors ${isMuted ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button
              className={`p-3.5 rounded-full transition-colors ${isCameraOff ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
              onClick={() => setIsCameraOff(!isCameraOff)}
            >
              {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>
            <button className="p-3.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors">
              <MessageCircle size={22} />
            </button>
            <button
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg"
              onClick={handleEndCall}
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main FaceTime view
  return (
    <div className="flex w-full h-full bg-[#1c1c1e] text-white select-none overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <div className="shrink-0 w-[240px] bg-[#2c2c2e] border-r border-white/5 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-3">FaceTime</h1>
          <div className="flex items-center bg-white/5 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts"
              className="flex-1 text-sm outline-none bg-transparent text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex px-4 gap-1 mb-2 shrink-0">
          <button
            className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-colors ${activeTab === 'contacts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
          <button
            className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-colors ${activeTab === 'recent' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2" style={{ scrollbarWidth: 'none' }}>
          {activeTab === 'contacts' ? (
            <div className="space-y-0.5">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <ContactAvatar contact={contact} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{contact.name}</div>
                    <div className="text-[11px] text-gray-500">
                      {contact.status === 'online' ? 'Available' : contact.lastSeen ?? 'Offline'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-full bg-green-600 hover:bg-green-700 transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleCall(contact) }}
                      title="Video Call"
                    >
                      <Video size={12} />
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-green-600 hover:bg-green-700 transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleCall(contact) }}
                      title="Audio Call"
                    >
                      <Phone size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {RECENT_CALLS.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                  onClick={() => handleCall(call.contact)}
                >
                  <ContactAvatar contact={call.contact} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-medium truncate ${call.direction === 'missed' ? 'text-red-400' : ''}`}>
                      {call.contact.name}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      {call.direction === 'missed' && <PhoneOff size={10} className="text-red-400" />}
                      {call.direction === 'incoming' && <Phone size={10} />}
                      {call.direction === 'outgoing' && <Phone size={10} className="rotate-[135deg]" />}
                      <span>{call.time}</span>
                      {call.duration && <span>· {call.duration}</span>}
                    </div>
                  </div>
                  <button className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-green-500">
                    {call.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1c1c1e] p-8">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6">
            <Video size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">FaceTime</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            Connect with friends and family using FaceTime video and audio calls.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium text-sm transition-colors shadow-lg"
              onClick={() => handleCall(CONTACTS[0])}
            >
              <Video size={18} />
              New FaceTime
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium text-sm transition-colors"
              onClick={() => handleCall(CONTACTS[0])}
            >
              <Phone size={18} />
              Audio Call
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
