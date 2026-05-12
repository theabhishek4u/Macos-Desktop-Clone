'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Compass,
  NotebookPen,
  Terminal,
  Calculator,
  Calendar,
  ImageIcon,
  Music,
  Settings,
  Clock,
  FileText,
  CloudSun,
  Search,
  Rocket,
} from 'lucide-react'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'

// --- Shared launchpad state (module-level) ---
interface LaunchpadState {
  isOpen: boolean
}

const launchpadState: LaunchpadState = { isOpen: false }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useLaunchpad() {
  const [isOpen, setIsOpen] = useState(launchpadState.isOpen)

  useEffect(() => {
    const listener = () => setIsOpen(launchpadState.isOpen)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const open = useCallback(() => {
    launchpadState.isOpen = true
    emitChange()
  }, [])

  const close = useCallback(() => {
    launchpadState.isOpen = false
    emitChange()
  }, [])

  const toggle = useCallback(() => {
    launchpadState.isOpen = !launchpadState.isOpen
    emitChange()
  }, [])

  return { isOpen, open, close, toggle }
}

// --- App icon styling config ---
interface AppStyleConfig {
  gradient: string
  icon: React.ComponentType<{ className?: string }>
}

const APP_STYLES: Record<string, AppStyleConfig> = {
  finder: {
    gradient: 'linear-gradient(135deg, #4FC3F7, #1565C0)',
    icon: FolderOpen,
  },
  safari: {
    gradient: 'linear-gradient(135deg, #64B5F6, #E3F2FD)',
    icon: Compass,
  },
  notes: {
    gradient: 'linear-gradient(135deg, #FFF176, #F9A825)',
    icon: NotebookPen,
  },
  terminal: {
    gradient: 'linear-gradient(135deg, #424242, #000000)',
    icon: Terminal,
  },
  calculator: {
    gradient: 'linear-gradient(135deg, #9E9E9E, #FF9800)',
    icon: Calculator,
  },
  calendar: {
    gradient: 'linear-gradient(135deg, #EF5350, #FFFFFF)',
    icon: Calendar,
  },
  photos: {
    gradient: 'linear-gradient(135deg, #F44336, #FF9800, #FFEB3B, #4CAF50, #2196F3, #9C27B0)',
    icon: ImageIcon,
  },
  music: {
    gradient: 'linear-gradient(135deg, #E91E63, #F48FB1)',
    icon: Music,
  },
  settings: {
    gradient: 'linear-gradient(135deg, #9E9E9E, #616161)',
    icon: Settings,
  },
  clock: {
    gradient: 'linear-gradient(135deg, #424242, #E0E0E0)',
    icon: Clock,
  },
  textedit: {
    gradient: 'linear-gradient(135deg, #F5F5F5, #BDBDBD)',
    icon: FileText,
  },
  weather: {
    gradient: 'linear-gradient(135deg, #42A5F5, #90CAF9)',
    icon: CloudSun,
  },
  launchpad: {
    gradient: 'linear-gradient(135deg, #424242, #757575)',
    icon: Rocket,
  },
}

// --- App tile component ---
interface AppTileProps {
  appId: string
  name: string
  onClick: () => void
}

function AppTile({ appId, name, onClick }: AppTileProps) {
  const style = APP_STYLES[appId]
  const IconComponent = style?.icon

  // Determine icon color based on app
  const iconColor = ['notes', 'safari', 'calendar', 'photos', 'textedit'].includes(appId)
    ? 'text-gray-800'
    : 'text-white'

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 w-[80px] cursor-pointer group"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Icon container */}
      <div
        className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center shadow-lg transition-shadow duration-200 group-hover:shadow-xl"
        style={{
          background: style?.gradient || 'linear-gradient(135deg, #757575, #424242)',
        }}
      >
        {IconComponent ? (
          <IconComponent className={`w-7 h-7 ${iconColor}`} />
        ) : (
          <Rocket className="w-7 h-7 text-white" />
        )}
      </div>

      {/* App name */}
      <span className="text-[11px] font-medium text-white text-center leading-tight truncate w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {name}
      </span>
    </motion.button>
  )
}

export default function Launchpad() {
  const { isOpen, close } = useLaunchpad()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { openApp } = useMacOSStore()

  // Reset state on open
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true)
    setQuery('')
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false)
  }

  // Focus input when launchpad opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && launchpadState.isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close])

  // Get all apps excluding launchpad itself
  const allApps = Object.values(APP_CONFIGS).filter(app => app.id !== 'launchpad')

  // Filter apps based on search query
  const filteredApps = query.trim()
    ? allApps.filter(app => app.name.toLowerCase().includes(query.toLowerCase()))
    : allApps

  // Handle app click
  const handleAppClick = useCallback(
    (appId: string) => {
      if (appId === 'launchpad') {
        close()
        return
      }
      openApp(appId)
      close()
    },
    [openApp, close]
  )

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close()
      }
    },
    [close]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xl flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdropClick}
        >
          {/* Search bar */}
          <motion.div
            className="mt-12 mb-8 w-[280px]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md shadow-lg">
              <Search className="w-4 h-4 text-white/50 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
              />
            </div>
          </motion.div>

          {/* App grid */}
          <motion.div
            className="flex-1 w-full overflow-y-auto custom-scrollbar px-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="max-w-[720px] mx-auto grid grid-cols-7 gap-x-4 gap-y-6 justify-items-center pb-32">
              {filteredApps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.03, 0.4),
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <AppTile
                    appId={app.id}
                    name={app.name}
                    onClick={() => handleAppClick(app.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* No results */}
            {filteredApps.length === 0 && query.trim() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/40 text-sm mt-20"
              >
                No apps found for &ldquo;{query}&rdquo;
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
