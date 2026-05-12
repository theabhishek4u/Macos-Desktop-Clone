'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
  Droplets,
  Wind,
  Clock,
  ListChecks,
  MonitorSmartphone,
  Pencil,
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

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        isToday: d === today,
      })
    }

    // Next month's leading days
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return cells
  }, [currentDate])

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80 text-[12px] font-semibold">{monthName}</span>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {dayNames.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-white/30 font-medium py-0.5">
            {d}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
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
    </div>
  )
}

// --- Reminders Widget ---
function RemindersWidget() {
  const reminders = [
    { id: 1, text: 'Team standup at 10am', done: false, color: 'bg-blue-500' },
    { id: 2, text: 'Review design mockups', done: false, color: 'bg-orange-500' },
    { id: 3, text: 'Pick up dry cleaning', done: true, color: 'bg-green-500' },
  ]

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80 text-[12px] font-semibold">Reminders</span>
        <span className="text-white/30 text-[11px]">{reminders.filter(r => !r.done).length}</span>
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
  const bars = [4, 6, 3, 7, 5, 8, 5] // Mon-Sun usage in hours

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
      {/* Mini bar chart */}
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
                  <button
                    onClick={clearAll}
                    className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Notifications list */}
              <div className="px-3 pb-2">
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
