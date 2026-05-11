'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Battery, Search, BatteryFull, BatteryMedium, BatteryLow, Bluetooth } from 'lucide-react'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'
import { useSpotlight } from '@/components/macos/Spotlight'
import { useAboutThisMac } from '@/components/macos/AboutThisMac'
import { useControlCenter } from '@/components/macos/ControlCenter'
import { useNotificationCenter } from '@/components/macos/NotificationCenter'

interface MenuItem {
  label: string
  shortcut?: string
  separator?: boolean
  disabled?: boolean
  action?: string
}

const MENU_ITEMS: Record<string, MenuItem[]> = {
  File: [
    { label: 'New Window', shortcut: '⌘N' },
    { label: 'New Tab', shortcut: '⌘T' },
    { label: 'Open', shortcut: '⌘O' },
    { separator: true, label: '' },
    { label: 'Close Window', shortcut: '⌘W' },
    { separator: true, label: '' },
    { label: 'Print', shortcut: '⌘P' },
  ],
  Edit: [
    { label: 'Undo', shortcut: '⌘Z' },
    { label: 'Redo', shortcut: '⇧⌘Z' },
    { separator: true, label: '' },
    { label: 'Cut', shortcut: '⌘X' },
    { label: 'Copy', shortcut: '⌘C' },
    { label: 'Paste', shortcut: '⌘V' },
    { label: 'Select All', shortcut: '⌘A' },
  ],
  View: [
    { label: 'as Icons' },
    { label: 'as List' },
    { label: 'as Columns' },
    { separator: true, label: '' },
    { label: 'Show Sidebar', shortcut: '⌘S' },
    { label: 'Show Path Bar' },
    { label: 'Show Status Bar' },
  ],
  Window: [
    { label: 'Minimize', shortcut: '⌘M' },
    { label: 'Zoom' },
    { separator: true, label: '' },
    { label: 'Bring All to Front' },
  ],
  Help: [
    { label: 'Search' },
    { label: 'macOS Help' },
  ],
}

const APPLE_MENU_ITEMS: MenuItem[] = [
  { label: 'About This Mac', shortcut: '' },
  { separator: true, label: '' },
  { label: 'System Preferences...', shortcut: '', action: 'settings' },
  { separator: true, label: '' },
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

// Dropdown menu component
function MenuDropdown({ items, onAction }: { items: MenuItem[]; onAction: (item: MenuItem) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute top-[28px] left-0 w-[240px] bg-[#2a2a2e]/95 backdrop-blur-2xl rounded-md shadow-2xl border border-white/[0.12] py-1 overflow-hidden"
    >
      {items.map((item, idx) => {
        if (item.separator) {
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
            className={`w-full text-left px-3 py-[3px] text-[13px] text-white/90 hover:bg-[#0060df] hover:text-white rounded-[4px] mx-1 flex items-center justify-between transition-colors ${
              item.disabled ? 'opacity-40 pointer-events-none' : ''
            }`}
            style={{ width: 'calc(100% - 8px)' }}
            onClick={() => onAction(item)}
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
  )
}

export default function MenuBar() {
  const { activeWindowId, windows, openApp } = useMacOSStore()
  const { toggle: toggleSpotlight } = useSpotlight()
  const aboutThisMac = useAboutThisMac()
  const controlCenter = useControlCenter()
  const notificationCenter = useNotificationCenter()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [appleMenuOpen, setAppleMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)

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

  // Close menus on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
      setAppleMenuOpen(false)
      setOpenMenu(null)
    }
  }, [])

  useEffect(() => {
    if (appleMenuOpen || openMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [appleMenuOpen, openMenu, handleClickOutside])

  const handleAppleMenuItemClick = (item: MenuItem) => {
    if (item.separator) return
    if (item.label === 'About This Mac') {
      aboutThisMac.open()
      setAppleMenuOpen(false)
      return
    }
    if (item.action) {
      openApp(item.action)
    }
    setAppleMenuOpen(false)
  }

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.separator) return
    if (item.action) {
      openApp(item.action)
    }
    setOpenMenu(null)
  }

  const handleMenuToggle = (menuName: string) => {
    if (openMenu === menuName) {
      setOpenMenu(null)
    } else {
      setAppleMenuOpen(false)
      setOpenMenu(menuName)
    }
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[28px] bg-black/70 backdrop-blur-xl text-white/90 text-[13px] font-sans z-[9999] flex items-center justify-between px-2 select-none"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}
      ref={menuBarRef}
    >
      {/* Left side */}
      <div className="flex items-center gap-0">
        {/* Apple logo + dropdown */}
        <div className="relative">
          <button
            className={`px-2 h-[28px] flex items-center rounded transition-colors text-[16px] leading-none ${
              appleMenuOpen ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            onClick={() => {
              setOpenMenu(null)
              setAppleMenuOpen(prev => !prev)
            }}
            aria-label="Apple Menu"
          >
            <svg
              className="w-[14px] h-[14px]"
              viewBox="0 0 170 170"
              fill="currentColor"
            >
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.75-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.04 3.69-6.27 8.6-11.23 14.76-14.88 6.15-3.65 12.8-5.51 19.97-5.63 3.92 0 9.06 1.21 15.43 3.6 6.36 2.4 10.44 3.62 12.24 3.62 1.34 0 5.87-1.43 13.56-4.28 7.27-2.64 13.41-3.74 18.44-3.32 13.63 1.1 23.87 6.47 30.68 16.15-12.2 7.39-18.22 17.73-18.1 31 0.12 10.33 3.86 18.93 11.19 25.77 3.33 3.17 7.05 5.62 11.18 7.37-.9 2.6-1.84 5.09-2.85 7.47zM119.1 7.01c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37a25.2 25.2 0 0 1-.19-3.07c0-7.78 3.39-16.1 9.4-22.9 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.75.13 1.11.17 2.22.17 3.28z" />
            </svg>
          </button>

          <AnimatePresence>
            {appleMenuOpen && (
              <MenuDropdown items={APPLE_MENU_ITEMS} onAction={handleAppleMenuItemClick} />
            )}
          </AnimatePresence>
        </div>

        {/* Active app name */}
        <span className="font-semibold px-2 h-[28px] flex items-center">
          {activeAppName}
        </span>

        {/* Menu items */}
        {Object.keys(MENU_ITEMS).map(item => (
          <div key={item} className="relative">
            <button
              className={`px-2 h-[28px] flex items-center rounded transition-colors ${
                openMenu === item ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleMenuToggle(item)}
              onMouseEnter={() => {
                // If any menu is open, switch to hovered menu
                if (openMenu !== null || appleMenuOpen) {
                  setAppleMenuOpen(false)
                  setOpenMenu(item)
                }
              }}
            >
              {item}
            </button>

            <AnimatePresence>
              {openMenu === item && (
                <MenuDropdown items={MENU_ITEMS[item]} onAction={handleMenuItemClick} />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <BatteryIconWithLevel />
        <Wifi className="h-4 w-4" />
        <Bluetooth className="h-3.5 w-3.5 opacity-80" />
        <Search className="h-3.5 w-3.5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity" onClick={toggleSpotlight} />
        <button
          className="w-4 h-4 rounded-sm bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
          onClick={controlCenter.toggle}
          aria-label="Control Center"
        >
          <div className="flex gap-[1.5px] items-end">
            <div className="w-[3px] h-[4px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[3px] h-[6px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[3px] h-[8px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[3px] h-[10px] bg-white/70 rounded-[0.5px]" />
          </div>
        </button>
        <button
          className="text-[12px] tracking-tight whitespace-nowrap hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
          onClick={notificationCenter.toggle}
          aria-label="Notification Center"
        >
          {formatDateTime(currentTime)}
        </button>
      </div>
    </div>
  )
}
