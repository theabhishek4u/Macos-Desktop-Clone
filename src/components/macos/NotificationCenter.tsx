'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  X,
  Calendar,
  Bell,
  Mail,
  Cloud,
  CloudSun,
  Sun,
  Droplets,
  Wind,
  Clock,
  ListChecks,
  MonitorSmartphone,
  Pencil,
  AlertTriangle,
  Settings,
} from 'lucide-react'

// --- Shared notification center state (module-level) ---
interface NotificationCenterState {
  isOpen: boolean
  unreadCount: number
}

const ncState: NotificationCenterState = { isOpen: false, unreadCount: 0 }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useNotificationCenter() {
  const [isOpen, setIsOpen] = useState(ncState.isOpen)
  const [unreadCountState, setUnreadCountState] = useState(ncState.unreadCount)

  useEffect(() => {
    const listener = () => {
      setIsOpen(ncState.isOpen)
      setUnreadCountState(ncState.unreadCount)
    }
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

  const updateUnreadCount = useCallback((count: number) => {
    ncState.unreadCount = count
    emitChange()
  }, [])

  return { isOpen, open, close, toggle, unreadCount: unreadCountState, setUnreadCount: updateUnreadCount }
}

// --- Types ---
interface Notification {
  id: string
  appName: string
  appLetter: string
  appColor: string
  title: string
  message: string
  timestamp: number
  read: boolean
  type: 'calendar' | 'message' | 'reminder' | 'system' | 'mail'
}

// --- Mock notification templates ---
const NOTIFICATION_TEMPLATES: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  { appName: 'Calendar', appLetter: 'C', appColor: '#ff3b30', title: 'Meeting in 15 minutes', message: 'Team standup - Conference Room B', type: 'calendar' },
  { appName: 'Calendar', appLetter: 'C', appColor: '#ff3b30', title: 'Lunch with Sarah', message: 'Tomorrow at 12:30 PM — Café Luna', type: 'calendar' },
  { appName: 'Calendar', appLetter: 'C', appColor: '#ff3b30', title: 'Design Review', message: 'Today at 3:00 PM — Zoom Meeting', type: 'calendar' },
  { appName: 'Messages', appLetter: 'M', appColor: '#34c759', title: 'John', message: 'Hey, are you coming to the party tonight?', type: 'message' },
  { appName: 'Messages', appLetter: 'M', appColor: '#34c759', title: 'Sarah', message: 'Can you review the design mockups by EOD?', type: 'message' },
  { appName: 'Messages', appLetter: 'M', appColor: '#34c759', title: 'Alex', message: 'The deployment went smoothly! 🎉', type: 'message' },
  { appName: 'Reminders', appLetter: 'R', appColor: '#ff9500', title: 'Don\'t forget to review the proposal', message: 'Due today at 5:00 PM', type: 'reminder' },
  { appName: 'Reminders', appLetter: 'R', appColor: '#ff9500', title: 'Pick up dry cleaning', message: 'Before 6:00 PM', type: 'reminder' },
  { appName: 'Reminders', appLetter: 'R', appColor: '#ff9500', title: 'Call dentist to reschedule', message: 'Reminded me at 2:00 PM', type: 'reminder' },
  { appName: 'System', appLetter: 'S', appColor: '#8e8e93', title: 'macOS Update Available', message: 'macOS Sonoma 14.5 is now available', type: 'system' },
  { appName: 'System', appLetter: 'S', appColor: '#8e8e93', title: 'Storage Almost Full', message: 'Only 5 GB remaining on your disk', type: 'system' },
  { appName: 'Mail', appLetter: 'M', appColor: '#007AFF', title: 'New email from Sarah', message: 'Re: Project Timeline — Let me know if this works for you', type: 'mail' },
  { appName: 'Mail', appLetter: 'M', appColor: '#007AFF', title: 'New email from HR', message: 'Updated benefits enrollment form', type: 'mail' },
  { appName: 'Mail', appLetter: 'M', appColor: '#007AFF', title: 'New email from David', message: 'Quick question about the API endpoints', type: 'mail' },
]

// --- Relative time formatting ---
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 10) return 'now'
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// --- Clock Widget ---
function ClockWidget() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <div className="text-white/95 text-[48px] font-extralight leading-none tracking-tight">
          {timeStr}
        </div>
        <div className="text-white/50 text-[13px] mt-1 font-medium">{dateStr}</div>
      </div>
      <Clock className="w-10 h-10 text-white/20" />
    </div>
  )
}

// --- Weather Widget ---
function WeatherWidget() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CloudSun className="w-6 h-6 text-yellow-300/90" />
          <span className="text-white/95 text-[32px] font-extralight leading-none">72°</span>
        </div>
        <div className="text-right">
          <div className="text-white/70 text-[13px] font-medium">Cupertino</div>
          <div className="text-white/40 text-[11px]">Mostly Sunny</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-white/40 mt-2">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>20%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>8 mph</span>
        </div>
        <div className="flex items-center gap-1">
          <Sun className="w-3 h-3" />
          <span>UV: Low</span>
        </div>
        <span>H: 75° L: 58°</span>
      </div>
    </div>
  )
}

// --- Calendar Widget ---
function CalendarWidget() {
  const [currentDate] = useState(() => new Date())

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const today = currentDate.getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const cells: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isToday: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, isCurrentMonth: true, isToday: d === today })
    }

    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrentMonth: false, isToday: false })
    }

    return cells
  }, [currentDate])

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Next event info
  const nextEvent = { title: 'Team standup', time: '10:00 AM' }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80 text-[12px] font-semibold">{monthName}</span>
      </div>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {dayNames.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-white/30 font-medium py-0.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {calendarGrid.map((cell, i) => (
          <div
            key={i}
            className={`text-center text-[10px] py-[3px] relative flex items-center justify-center ${
              cell.isCurrentMonth ? 'text-white/70' : 'text-white/20'
            }`}
          >
            {cell.isToday ? (
              <span className="w-[18px] h-[18px] rounded-full bg-[#ff3b30] text-white flex items-center justify-center text-[9px] font-bold">
                {cell.day}
              </span>
            ) : (
              <span>{cell.day}</span>
            )}
          </div>
        ))}
      </div>
      {/* Next event */}
      <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-[#ff3b30]" />
        <span className="text-[10px] text-white/50">{nextEvent.title}</span>
        <span className="text-[10px] text-white/30">· {nextEvent.time}</span>
      </div>
    </div>
  )
}

// --- Reminders Widget ---
function RemindersWidget() {
  const reminders = [
    { id: 1, text: 'Team standup at 10am', done: false, color: 'bg-[#007AFF]' },
    { id: 2, text: 'Review design mockups', done: false, color: 'bg-orange-500' },
    { id: 3, text: 'Pick up dry cleaning', done: true, color: 'bg-green-500' },
  ]

  const todayCount = reminders.filter(r => !r.done).length

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80 text-[12px] font-semibold">Reminders</span>
        <span className="text-[#ff9500] text-[11px] font-medium">{todayCount}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {reminders.map(r => (
          <div key={r.id} className="flex items-center gap-2">
            <div className={`w-[14px] h-[14px] rounded-full border-2 ${r.done ? r.color + ' border-transparent' : 'border-white/30'} flex items-center justify-center shrink-0`}>
              {r.done && (
                <svg className="w-[8px] h-[8px] text-white" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1.5 4L3 5.5L6.5 2" />
                </svg>
              )}
            </div>
            <span className={`text-[11px] ${r.done ? 'text-white/30 line-through' : 'text-white/70'}`}>
              {r.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Screen Time Widget ---
function ScreenTimeWidget() {
  const hours = 5
  const minutes = 23
  const bars = [4, 6, 3, 7, 5, 8, 5]

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80 text-[12px] font-semibold">Screen Time</span>
        <MonitorSmartphone className="w-3.5 h-3.5 text-white/30" />
      </div>
      <div className="flex items-end justify-between mb-1.5">
        <div>
          <span className="text-white/95 text-[28px] font-extralight leading-none">{hours}h {minutes}m</span>
        </div>
        <span className="text-white/30 text-[10px]">▼ 12% from last week</span>
      </div>
      <div className="flex items-end gap-[5px] h-[28px]">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full rounded-sm"
              style={{
                height: `${(h / 8) * 100}%`,
                background: i === 5 ? 'rgba(0, 122, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
                minHeight: 3,
              }}
            />
            <span className="text-[7px] text-white/25">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Notification Card with swipe-to-dismiss ---
function NotificationCard({
  notification,
  onDismiss,
  onMarkRead,
  index,
}: {
  notification: Notification
  onDismiss: (id: string) => void
  onMarkRead: (id: string) => void
  index: number
}) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [0, 200], [1, 0])
  const [swipingOut, setSwipingOut] = useState(false)

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 80) {
      setSwipingOut(true)
      setTimeout(() => onDismiss(notification.id), 200)
    }
  }

  const relativeTime = formatRelativeTime(notification.timestamp)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={swipingOut ? { opacity: 0, x: 300, transition: { duration: 0.2 } } : { opacity: 0, x: 40, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ opacity: swipingOut ? 0 : opacity, x }}
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      className="group cursor-grab active:cursor-grabbing"
    >
      <div
        className={`bg-white/[0.06] hover:bg-white/[0.1] rounded-xl p-3 transition-colors relative ${
          notification.read ? 'opacity-60' : ''
        }`}
        onClick={() => {
          if (!notification.read) {
            onMarkRead(notification.id)
          }
        }}
      >
        <div className="flex items-start gap-2.5">
          {/* App icon — colored circle with first letter */}
          <div
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[14px] font-semibold shrink-0"
            style={{ background: notification.appColor }}
          >
            {notification.appLetter}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white/50 text-[11px] font-medium">{notification.appName}</span>
              <span className="text-white/20 text-[11px]">·</span>
              <span className="text-white/30 text-[11px]">{relativeTime}</span>
            </div>
            <div className="text-white/90 text-[13px] font-semibold mt-0.5 truncate">
              {notification.title}
            </div>
            <div className="text-white/50 text-[12px] mt-0.5 line-clamp-2">
              {notification.message}
            </div>
          </div>
          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDismiss(notification.id)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60 p-0.5 -mt-0.5 -mr-0.5 shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Unread indicator dot */}
        {!notification.read && (
          <div className="absolute top-3 right-3 w-[6px] h-[6px] rounded-full bg-[#007AFF] group-hover:opacity-0 transition-opacity" />
        )}
      </div>
    </motion.div>
  )
}

// --- Default notifications ---
function getDefaultNotifications(): Notification[] {
  return [
    {
      id: 'n1',
      appName: 'Messages',
      appLetter: 'M',
      appColor: '#34c759',
      title: 'Sarah',
      message: 'Hey, are you coming to the meeting?',
      timestamp: Date.now() - 5 * 60 * 1000,
      read: false,
      type: 'message',
    },
    {
      id: 'n2',
      appName: 'Calendar',
      appLetter: 'C',
      appColor: '#ff3b30',
      title: 'Team standup',
      message: 'Team standup in 15 minutes',
      timestamp: Date.now() - 10 * 60 * 1000,
      read: false,
      type: 'calendar',
    },
    {
      id: 'n3',
      appName: 'Reminders',
      appLetter: 'R',
      appColor: '#ff9500',
      title: 'Review proposal',
      message: 'Don\'t forget to review the proposal',
      timestamp: Date.now() - 60 * 60 * 1000,
      read: false,
      type: 'reminder',
    },
    {
      id: 'n4',
      appName: 'Mail',
      appLetter: 'M',
      appColor: '#007AFF',
      title: 'New email from Sarah',
      message: 'Re: Project Timeline — Let me know if this works',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      read: true,
      type: 'mail',
    },
  ]
}

let notificationCounter = 100

export default function NotificationCenter() {
  const { isOpen, close, setUnreadCount } = useNotificationCenter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>(getDefaultNotifications)

  // Compute unread count and sync to shared state
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  useEffect(() => {
    setUnreadCount(unreadCount)
  }, [unreadCount, setUnreadCount])

  // Real-time notification generation: every 30-60 seconds
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 30000 + Math.random() * 30000 // 30-60s
      return setTimeout(() => {
        const template = NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)]
        notificationCounter++
        const newNotification: Notification = {
          ...template,
          id: `rt-${notificationCounter}`,
          timestamp: Date.now(),
          read: false,
        }
        setNotifications(prev => [newNotification, ...prev].slice(0, 20)) // Keep max 20
      }, delay)
    }

    let timer: ReturnType<typeof setTimeout>
    const startTimer = () => {
      timer = scheduleNext()
    }
    startTimer()

    return () => clearTimeout(timer)
  }, [])

  // Dismiss a single notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Mark all as read
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
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

  // Relative time updater — re-renders every 30s for relative timestamps
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

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
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Clock Widget */}
              <div className="mx-3 mt-3 rounded-xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
                <ClockWidget />
              </div>

              {/* Weather Widget */}
              <div className="mx-3 mt-2 rounded-xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
                <WeatherWidget />
              </div>

              {/* Calendar + Reminders row */}
              <div className="flex gap-2 mx-3 mt-2">
                {/* Calendar Widget */}
                <div className="flex-1 rounded-xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
                  <CalendarWidget />
                </div>
                {/* Reminders Widget */}
                <div className="flex-1 rounded-xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
                  <RemindersWidget />
                </div>
              </div>

              {/* Screen Time Widget */}
              <div className="mx-3 mt-2 rounded-xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
                <ScreenTimeWidget />
              </div>

              {/* Notifications header */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between px-4 pt-3 pb-1 mt-1">
                  <span className="text-white/50 text-[12px] font-medium uppercase tracking-wider">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-white/30 hover:text-white/50 transition-colors"
                      >
                        Mark All Read
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      className="text-[12px] text-[#007AFF] hover:text-[#4da3ff] transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications list */}
              <div className="px-3 pb-2">
                {notifications.length > 0 ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <AnimatePresence mode="popLayout">
                      {notifications.map((notification, index) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onDismiss={dismissNotification}
                          onMarkRead={markAsRead}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-white/20">
                    <Bell className="w-10 h-10 mb-3" />
                    <div className="text-[13px]">No Notifications</div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Widgets button */}
            <div className="border-t border-white/[0.06] px-4 py-2.5">
              <button className="flex items-center gap-1.5 text-white/40 hover:text-white/60 transition-colors text-[12px] mx-auto">
                <Pencil className="w-3 h-3" />
                Edit Widgets
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
