'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Battery, Search, BatteryFull, BatteryMedium, BatteryLow, Bluetooth } from 'lucide-react'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'
import useDarkModeStore from '@/store/dark-mode-store'
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

interface MenuSection {
  name: string
  items: MenuItem[]
}

// ─── App-specific menu definitions ────────────────────────────────────────────

function getMenuItems(appId: string): MenuSection[] {
  const File: MenuSection = {
    name: 'File',
    items: [
      { label: 'New Window', shortcut: '⌘N' },
      { label: 'New Tab', shortcut: '⌘T' },
      { label: 'Open', shortcut: '⌘O' },
      { separator: true, label: '' },
      { label: 'Close Window', shortcut: '⌘W' },
      { separator: true, label: '' },
      { label: 'Print', shortcut: '⌘P' },
    ],
  }

  const Edit: MenuSection = {
    name: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z' },
      { label: 'Redo', shortcut: '⇧⌘Z' },
      { separator: true, label: '' },
      { label: 'Cut', shortcut: '⌘X' },
      { label: 'Copy', shortcut: '⌘C' },
      { label: 'Paste', shortcut: '⌘V' },
      { label: 'Select All', shortcut: '⌘A' },
    ],
  }

  const View: MenuSection = {
    name: 'View',
    items: [
      { label: 'as Icons' },
      { label: 'as List' },
      { label: 'as Columns' },
      { separator: true, label: '' },
      { label: 'Show Sidebar', shortcut: '⌘S' },
      { label: 'Show Path Bar' },
      { label: 'Show Status Bar' },
    ],
  }

  const Window: MenuSection = {
    name: 'Window',
    items: [
      { label: 'Minimize', shortcut: '⌘M' },
      { label: 'Zoom' },
      { separator: true, label: '' },
      { label: 'Bring All to Front' },
    ],
  }

  const Help: MenuSection = {
    name: 'Help',
    items: [
      { label: 'Search' },
      { label: 'macOS Help' },
    ],
  }

  switch (appId) {
    case 'finder':
      return [
        File,
        Edit,
        View,
        {
          name: 'Go',
          items: [
            { label: 'Back', shortcut: '⌘[' },
            { label: 'Forward', shortcut: '⌘]' },
            { label: 'Enclosing Folder', shortcut: '⌘↑' },
            { separator: true, label: '' },
            { label: 'Computer', shortcut: '⇧⌘C' },
            { label: 'Home', shortcut: '⇧⌘H' },
            { label: 'Desktop', shortcut: '⇧⌘D' },
            { label: 'Downloads', shortcut: '⌥⌘L' },
            { label: 'Applications', shortcut: '⇧⌘A' },
          ],
        },
        Window,
        Help,
      ]

    case 'safari':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Show Toolbar' },
            { label: 'Show Bookmarks Bar' },
            { separator: true, label: '' },
            { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
          ],
        },
        {
          name: 'History',
          items: [
            { label: 'Back', shortcut: '⌘[' },
            { label: 'Forward', shortcut: '⌘]' },
            { separator: true, label: '' },
            { label: 'Show All History', shortcut: '⌥⌘0' },
            { separator: true, label: '' },
            { label: 'Recently Closed Tabs' },
          ],
        },
        {
          name: 'Bookmarks',
          items: [
            { label: 'Show Bookmarks', shortcut: '⌥⌘B' },
            { separator: true, label: '' },
            { label: 'Add Bookmark', shortcut: '⌘D' },
            { label: 'Add Bookmark Folder' },
          ],
        },
        Window,
        Help,
      ]

    case 'calculator':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Basic' },
            { label: 'Scientific' },
            { label: 'Programmer' },
            { separator: true, label: '' },
            { label: 'RPN Mode' },
          ],
        },
        {
          name: 'Convert',
          items: [
            { label: 'Currency' },
            { label: 'Length' },
            { label: 'Weight' },
            { label: 'Temperature' },
          ],
        },
        {
          name: 'Speech',
          items: [
            { label: 'Speak Button Pressed' },
            { label: 'Speak Result' },
          ],
        },
        Window,
        Help,
      ]

    case 'notes':
      return [
        File,
        Edit,
        {
          name: 'Format',
          items: [
            { label: 'Bold', shortcut: '⌘B' },
            { label: 'Italic', shortcut: '⌘I' },
            { label: 'Underline', shortcut: '⌘U' },
            { separator: true, label: '' },
            { label: 'Heading' },
            { label: 'Body' },
            { separator: true, label: '' },
            { label: 'List' },
            { label: 'Checklist', shortcut: '⇧⌘L' },
            { label: 'Table' },
          ],
        },
        {
          name: 'View',
          items: [
            { label: 'Show Folders' },
            { label: 'Show Attachment Browser' },
            { separator: true, label: '' },
            { label: 'Sort By' },
          ],
        },
        Window,
        Help,
      ]

    case 'terminal':
      return [
        {
          name: 'Terminal',
          items: [
            { label: 'Preferences...', shortcut: '⌘,' },
            { separator: true, label: '' },
            { label: 'Secure Keyboard Entry' },
          ],
        },
        {
          name: 'Shell',
          items: [
            { label: 'New Window', shortcut: '⌘N' },
            { label: 'New Tab', shortcut: '⌘T' },
            { separator: true, label: '' },
            { label: 'Close Tab', shortcut: '⌘W' },
            { label: 'Close Window', shortcut: '⇧⌘W' },
          ],
        },
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Bigger', shortcut: '⌘+' },
            { label: 'Smaller', shortcut: '⌘-' },
            { separator: true, label: '' },
            { label: 'Default Size' },
          ],
        },
        Window,
        Help,
      ]

    case 'calendar':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Day', shortcut: '⌘1' },
            { label: 'Week', shortcut: '⌘2' },
            { label: 'Month', shortcut: '⌘3' },
            { label: 'Year', shortcut: '⌘4' },
            { separator: true, label: '' },
            { label: 'Show Holidays Calendar' },
          ],
        },
        {
          name: 'Go',
          items: [
            { label: 'Today', shortcut: '⌘T' },
            { separator: true, label: '' },
            { label: 'Back', shortcut: '⌘[' },
            { label: 'Forward', shortcut: '⌘]' },
          ],
        },
        Window,
        Help,
      ]

    case 'music':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Show Sidebar', shortcut: '⌘S' },
            { label: 'Show Song List' },
            { separator: true, label: '' },
            { label: 'Column Browser' },
          ],
        },
        {
          name: 'Controls',
          items: [
            { label: 'Play/Pause', shortcut: 'Space' },
            { label: 'Next Song', shortcut: '⌘→' },
            { label: 'Previous Song', shortcut: '⌘←' },
            { separator: true, label: '' },
            { label: 'Shuffle' },
            { label: 'Repeat' },
            { separator: true, label: '' },
            { label: 'Volume Up', shortcut: '⌘↑' },
            { label: 'Volume Down', shortcut: '⌘↓' },
          ],
        },
        {
          name: 'Account',
          items: [
            { label: 'Sign In...' },
            { separator: true, label: '' },
            { label: 'Apple Music Settings...' },
          ],
        },
        Window,
        Help,
      ]

    case 'settings':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Show All' },
            { separator: true, label: '' },
            { label: 'General' },
            { label: 'Appearance' },
            { label: 'Desktop & Screen Saver' },
            { label: 'Dock & Menu Bar' },
            { label: 'Display' },
            { label: 'Battery' },
            { label: 'Sound' },
          ],
        },
        Window,
        Help,
      ]

    case 'maps':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Show Toolbar' },
            { label: 'Show Sidebar' },
            { separator: true, label: '' },
            { label: 'Satellite' },
            { label: 'Explore' },
            { label: 'Driving' },
            { label: 'Transit' },
          ],
        },
        {
          name: 'Go',
          items: [
            { label: 'My Location', shortcut: '⌘L' },
            { separator: true, label: '' },
            { label: 'Back', shortcut: '⌘[' },
            { label: 'Forward', shortcut: '⌘]' },
          ],
        },
        Window,
        Help,
      ]

    case 'reminders':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Show Sidebar', shortcut: '⌘S' },
            { separator: true, label: '' },
            { label: 'Sort By' },
            { separator: true, label: '' },
            { label: 'Show Completed' },
          ],
        },
        Window,
        Help,
      ]

    case 'photos':
      return [
        File,
        Edit,
        {
          name: 'View',
          items: [
            { label: 'Photos' },
            { label: 'Memories' },
            { label: 'Favorites' },
            { separator: true, label: '' },
            { label: 'Show Sidebar' },
          ],
        },
        Window,
        Help,
      ]

    case 'weather':
      return [
        File,
        Edit,
        View,
        Window,
        Help,
      ]

    case 'clock':
      return [
        File,
        Edit,
        View,
        Window,
        Help,
      ]

    case 'textedit':
      return [
        File,
        Edit,
        {
          name: 'Format',
          items: [
            { label: 'Bold', shortcut: '⌘B' },
            { label: 'Italic', shortcut: '⌘I' },
            { label: 'Underline', shortcut: '⌘U' },
            { separator: true, label: '' },
            { label: 'Bigger', shortcut: '⌘+' },
            { label: 'Smaller', shortcut: '⌘-' },
            { separator: true, label: '' },
            { label: 'List' },
            { label: 'Table' },
          ],
        },
        View,
        Window,
        Help,
      ]

    default:
      return [File, Edit, View, Window, Help]
  }
}

const APPLE_MENU_ITEMS: MenuItem[] = [
  { label: 'About This Mac', shortcut: '' },
  { separator: true, label: '' },
  { label: 'System Preferences...', shortcut: '', action: 'settings' },
  { label: 'App Store...', shortcut: '' },
  { separator: true, label: '' },
  { label: 'Recent Items', shortcut: '', disabled: true },
  { separator: true, label: '' },
  { label: 'Force Quit...', shortcut: '⌥⌘⎋' },
  { separator: true, label: '' },
  { label: 'Sleep', shortcut: '' },
  { label: 'Restart...', shortcut: '' },
  { label: 'Shut Down...', shortcut: '' },
  { separator: true, label: '' },
  { label: 'Log Out User...', shortcut: '⇧⌘Q' },
  { label: 'Lock Screen', shortcut: '⌃⌘Q' },
]

function formatTimeOnly(date: Date): string {
  let hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes} ${ampm}`
}

function formatDateShort(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = days[date.getDay()]
  const month = months[date.getMonth()]
  const dayNum = date.getDate()
  return `${day} ${month} ${dayNum}`
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
      className="absolute top-[25px] left-0 w-[240px] bg-[#2a2a2e]/95 backdrop-blur-2xl rounded-md shadow-2xl border border-white/[0.12] py-1 overflow-hidden"
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
            className={`w-full text-left px-3 py-[3px] text-[13px] text-white/90 hover:bg-[#0060df] hover:text-white rounded-[4px] mx-1 flex items-center justify-between transition-colors duration-75 ${
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
  const { isDarkMode } = useDarkModeStore()
  const { toggle: toggleSpotlight } = useSpotlight()
  const aboutThisMac = useAboutThisMac()
  const controlCenter = useControlCenter()
  const notificationCenter = useNotificationCenter()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [appleMenuOpen, setAppleMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)

  // Determine active app name and ID
  const activeWindow = windows.find(w => w.id === activeWindowId)
  const activeAppName = activeWindow
    ? APP_CONFIGS[activeWindow.appId]?.name ?? 'Finder'
    : 'Finder'
  const activeAppId = activeWindow?.appId ?? 'finder'

  // Get app-specific menus
  const currentMenus = useMemo(() => getMenuItems(activeAppId), [activeAppId])

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
      className={`fixed top-0 left-0 right-0 h-[25px] backdrop-blur-xl text-white/90 text-[12.5px] font-medium z-[9999] flex items-center justify-between px-2 select-none ${
        isDarkMode ? 'bg-black/80' : 'bg-black/50'
      }`}
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
      ref={menuBarRef}
    >
      {/* Left side */}
      <div className="flex items-center gap-0">
        {/* Apple logo + dropdown */}
        <div className="relative">
          <button
            className={`px-2 h-[25px] flex items-center rounded transition-colors text-[16px] leading-none ${
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
        <span className="font-bold text-[12.5px] px-2 h-[25px] flex items-center">
          {activeAppName}
        </span>

        {/* App-specific menu items */}
        {currentMenus.map(section => (
          <div key={section.name} className="relative">
            <button
              className={`px-2 h-[25px] flex items-center rounded transition-colors text-[12.5px] font-medium ${
                openMenu === section.name ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
              onClick={() => handleMenuToggle(section.name)}
              onMouseEnter={() => {
                // If any menu is open, switch to hovered menu
                if (openMenu !== null || appleMenuOpen) {
                  setAppleMenuOpen(false)
                  setOpenMenu(section.name)
                }
              }}
            >
              {section.name}
            </button>

            <AnimatePresence>
              {openMenu === section.name && (
                <MenuDropdown items={section.items} onAction={handleMenuItemClick} />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-0">
        <BatteryIconWithLevel />
        <div className="w-px h-3 bg-white/20 mx-1.5" />
        <Wifi className="h-4 w-4" />
        <Bluetooth className="h-3.5 w-3.5 opacity-80 ml-1.5" />
        <div className="w-px h-3 bg-white/20 mx-1.5" />
        <Search className="h-3.5 w-3.5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity ml-0.5" onClick={toggleSpotlight} />
        {/* Control Center - pill-shaped icon matching macOS */}
        <button
          className="flex items-center gap-[3px] rounded-full px-1.5 py-[3px] hover:bg-white/15 transition-colors cursor-pointer ml-1"
          onClick={controlCenter.toggle}
          aria-label="Control Center"
        >
          <div className="flex gap-[2px] items-end">
            <div className="w-[2.5px] h-[3px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[2.5px] h-[5px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[2.5px] h-[7px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[2.5px] h-[9px] bg-white/70 rounded-[0.5px]" />
          </div>
          <div className="flex gap-[2px] items-start">
            <div className="w-[2.5px] h-[3px] bg-white/70 rounded-[0.5px]" />
            <div className="w-[2.5px] h-[5px] bg-white/70 rounded-[0.5px]" />
          </div>
        </button>
        {/* Date and Time */}
        <button
          className="text-[13px] tracking-tight whitespace-nowrap hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors cursor-pointer ml-0.5 flex items-center gap-1.5"
          onClick={notificationCenter.toggle}
          aria-label="Notification Center"
        >
          <span className="text-white/60">{formatDateShort(currentTime)}</span>
          <span>{formatTimeOnly(currentTime)}</span>
        </button>
      </div>
    </div>
  )
}
