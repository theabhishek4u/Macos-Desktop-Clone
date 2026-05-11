'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MessageSquare,
  Calendar,
  Bell,
  Mail,
  Cloud,
  CloudSun,
  Sun,
} from 'lucide-react'

// --- Shared notification center state (module-level) ---
interface NotificationCenterState {
  isOpen: boolean
}

const ncState: NotificationCenterState = { isOpen: false }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useNotificationCenter() {
  const [isOpen, setIsOpen] = useState(ncState.isOpen)

  useEffect(() => {
    const listener = () => setIsOpen(ncState.isOpen)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const open = useCallback(() => {
    ncState.isOpen = true
    emitChange()
  }, [])

  const close = useCallback(() => {
    ncState.isOpen = false
    emitChange()
  }, [])

  const toggle = useCallback(() => {
    ncState.isOpen = !ncState.isOpen
    emitChange()
  }, [])

  return { isOpen, open, close, toggle }
}

// --- Types ---
interface Notification {
  id: string
  appIcon: React.ReactNode
  appName: string
  title: string
  message: string
  time: string
  color: string
}

// --- Helper: format current date ---
function formatDateWidget(date: Date): { dayName: string; dateStr: string } {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return {
    dayName: days[date.getDay()],
    dateStr: `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`,
  }
}

// --- Default notifications ---
function getDefaultNotifications(): Notification[] {
  return [
    {
      id: 'n1',
      appIcon: <MessageSquare className="w-3.5 h-3.5" />,
      appName: 'Messages',
      title: 'Sarah',
      message: 'Hey, are you coming to the meeting?',
      time: '5m ago',
      color: 'bg-green-500',
    },
    {
      id: 'n2',
      appIcon: <Calendar className="w-3.5 h-3.5" />,
      appName: 'Calendar',
      title: 'Team standup',
      message: 'Team standup in 15 minutes',
      time: '10m ago',
      color: 'bg-red-500',
    },
    {
      id: 'n3',
      appIcon: <Bell className="w-3.5 h-3.5" />,
      appName: 'Reminders',
      title: 'To Do',
      message: 'Buy groceries',
      time: '1h ago',
      color: 'bg-orange-500',
    },
    {
      id: 'n4',
      appIcon: <Mail className="w-3.5 h-3.5" />,
      appName: 'Mail',
      title: 'Alex',
      message: 'New message from Alex',
      time: '2h ago',
      color: 'bg-blue-500',
    },
  ]
}

export default function NotificationCenter() {
  const { isOpen, close } = useNotificationCenter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>(getDefaultNotifications)
  const [currentDate] = useState(() => new Date())

  const { dateStr } = formatDateWidget(currentDate)

  // Dismiss a single notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close()
      }
    }

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 50)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, close])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ncState.isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          className="fixed top-[32px] right-2 w-[340px] z-[99998] select-none"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="bg-[#2a2a2e]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden flex flex-col max-h-[calc(100vh-48px)]">
            {/* Date & Weather Widget */}
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/90 text-[15px] font-semibold">{dateStr}</div>
                  <div className="text-white/40 text-[12px] mt-0.5">No upcoming events</div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudSun className="w-8 h-8 text-yellow-300/80" />
                  <div className="text-right">
                    <div className="text-white/90 text-[20px] font-light leading-none">72°</div>
                    <div className="text-white/40 text-[11px]">Mostly Sunny</div>
                  </div>
                </div>
              </div>
              {/* Mini weather row */}
              <div className="flex items-center gap-3 mt-3 text-[11px] text-white/40">
                <div className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>20% rain</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sun className="w-3 h-3" />
                  <span>UV: Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>H: 75° L: 58°</span>
                </div>
              </div>
            </div>

            {/* Notifications header */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-white/50 text-[12px] font-medium uppercase tracking-wider">Notifications</span>
                <button
                  onClick={clearAll}
                  className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="flex flex-col gap-1.5 mt-1">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="group bg-white/[0.06] hover:bg-white/[0.1] rounded-xl p-3 transition-colors relative"
                    >
                      <div className="flex items-start gap-2.5">
                        {/* App icon */}
                        <div className={`w-7 h-7 rounded-lg ${notification.color} flex items-center justify-center text-white shrink-0`}>
                          {notification.appIcon}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white/50 text-[11px] font-medium">{notification.appName}</span>
                            <span className="text-white/20 text-[11px]">·</span>
                            <span className="text-white/30 text-[11px]">{notification.time}</span>
                          </div>
                          <div className="text-white/90 text-[13px] font-medium mt-0.5 truncate">
                            {notification.title}
                          </div>
                          <div className="text-white/50 text-[12px] mt-0.5 line-clamp-2">
                            {notification.message}
                          </div>
                        </div>
                        {/* Dismiss button */}
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60 p-0.5 -mt-0.5 -mr-0.5 shrink-0"
                          aria-label="Dismiss notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <Bell className="w-10 h-10 mb-3" />
                  <div className="text-[13px]">No Notifications</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
