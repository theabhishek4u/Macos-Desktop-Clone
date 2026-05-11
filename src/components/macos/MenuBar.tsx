'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Battery, Search, BatteryFull, BatteryMedium, BatteryLow } from 'lucide-react'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'

const MENU_ITEMS = ['File', 'Edit', 'View', 'Window', 'Help']

const APPLE_MENU_ITEMS = [
  { label: 'About This Mac', shortcut: '' },
  { separator: true },
  { label: 'System Preferences...', shortcut: '', action: 'settings' },
  { separator: true },
  { label: 'Sleep', shortcut: '' },
  { label: 'Restart...', shortcut: '' },
  { label: 'Shut Down...', shortcut: '' },
]

function formatDateTime(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const day = days[date.getDay()]
  const month = months[date.getMonth()]
  const dayNum = date.getDate()

  let hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12

  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day} ${month} ${dayNum}  ${hours}:${minutes} ${ampm}`
}

function BatteryIconWithLevel() {
  const [level] = useState(() => Math.floor(Math.random() * 40) + 60)

  let IconComponent: React.ComponentType<{ className?: string }>
  if (level >= 90) IconComponent = BatteryFull
  else if (level >= 50) IconComponent = BatteryMedium
  else IconComponent = BatteryLow

  return (
    <div className="flex items-center gap-1">
      <IconComponent className="h-4 w-4" />
      <span className="text-[12px] leading-none">{level}%</span>
    </div>
  )
}

export default function MenuBar() {
  const { activeWindowId, windows, openApp } = useMacOSStore()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [appleMenuOpen, setAppleMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Determine active app name
  const activeWindow = windows.find(w => w.id === activeWindowId)
  const activeAppName = activeWindow
    ? APP_CONFIGS[activeWindow.appId]?.name ?? 'Finder'
    : 'Finder'

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close apple menu on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setAppleMenuOpen(false)
    }
  }, [])

  useEffect(() => {
    if (appleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [appleMenuOpen, handleClickOutside])

  const handleAppleMenuItemClick = (item: typeof APPLE_MENU_ITEMS[number]) => {
    if ('separator' in item && item.separator) return
    if ('action' in item && item.action) {
      openApp(item.action)
    }
    setAppleMenuOpen(false)
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[28px] bg-black/70 backdrop-blur-xl text-white/90 text-[13px] font-sans z-[9999] flex items-center justify-between px-2 select-none"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}
    >
      {/* Left side */}
      <div className="flex items-center gap-0">
        {/* Apple logo + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className="px-2 h-[28px] flex items-center rounded hover:bg-white/10 transition-colors text-[16px] leading-none"
            onClick={() => setAppleMenuOpen(prev => !prev)}
            aria-label="Apple Menu"
          >
            🍎
          </button>

          <AnimatePresence>
            {appleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-[28px] left-0 w-[240px] bg-[#2a2a2e]/95 backdrop-blur-2xl rounded-md shadow-2xl border border-white/[0.12] py-1 overflow-hidden"
              >
                {APPLE_MENU_ITEMS.map((item, idx) => {
                  if ('separator' in item && item.separator) {
                    return (
                      <div
                        key={`sep-${idx}`}
                        className="h-px bg-white/10 mx-2 my-1"
                      />
                    )
                  }
                  return (
                    <button
                      key={item.label}
                      className="w-full text-left px-3 py-[3px] text-[13px] text-white/90 hover:bg-[#0060df] hover:text-white rounded-[4px] mx-1 flex items-center justify-between transition-colors"
                      style={{ width: 'calc(100% - 8px)' }}
                      onClick={() => handleAppleMenuItemClick(item)}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-white/50 text-[12px] ml-4">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active app name */}
        <span className="font-semibold px-2 h-[28px] flex items-center">
          {activeAppName}
        </span>

        {/* Menu items */}
        {MENU_ITEMS.map(item => (
          <button
            key={item}
            className="px-2 h-[28px] flex items-center rounded hover:bg-white/10 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <BatteryIconWithLevel />
        <Wifi className="h-4 w-4" />
        <Search className="h-3.5 w-3.5 opacity-80" />
        <div className="w-4 h-4 rounded-sm bg-white/20 flex items-center justify-center">
          <div className="flex gap-[1.5px] items-end">
            <div className="w-[3px] h-[4px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[3px] h-[6px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[3px] h-[8px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[3px] h-[10px] bg-white/70 rounded-[0.5px]" />
          </div>
        </div>
        <span className="text-[12px] tracking-tight whitespace-nowrap">
          {formatDateTime(currentTime)}
        </span>
      </div>
    </div>
  )
}
