'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Calculator,
  Monitor,
  Battery,
  Volume2,
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Keyboard,
  Mouse,
  Airplay,
  HardDrive,
  Folder,
  FileText,
  ImageIcon,
  Music,
  Globe,
  Settings,
  Lock,
  User,
  Palette,
  Bell,
  Accessibility,
  Shield,
  Calendar,
} from 'lucide-react'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'

// --- Shared spotlight state (module-level) ---
interface SpotlightState {
  isOpen: boolean
}

const spotlightState: SpotlightState = { isOpen: false }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useSpotlight() {
  const [isOpen, setIsOpen] = useState(spotlightState.isOpen)

  useEffect(() => {
    const listener = () => setIsOpen(spotlightState.isOpen)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const open = useCallback(() => {
    spotlightState.isOpen = true
    emitChange()
  }, [])

  const close = useCallback(() => {
    spotlightState.isOpen = false
    emitChange()
  }, [])

  const toggle = useCallback(() => {
    spotlightState.isOpen = !spotlightState.isOpen
    emitChange()
  }, [])

  return { isOpen, open, close, toggle }
}

// --- Search result types ---
interface SearchResult {
  id: string
  name: string
  category: 'Applications' | 'Documents' | 'System Preferences' | 'Suggestions'
  appId?: string
  icon: React.ReactNode
  description?: string
  action?: () => void
}

// --- App icon with colored background ---
function AppIcon({ color, icon, size = 28 }: { color: string; icon: React.ReactNode; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[8px] shrink-0"
      style={{ width: size, height: size, background: color }}
    >
      {icon}
    </div>
  )
}

// --- Build application results ---
function buildAppResults(): SearchResult[] {
  const appConfigs: { id: string; name: string; color: string; icon: React.ReactNode }[] = [
    { id: 'finder', name: 'Finder', color: '#2196F3', icon: <Folder className="w-4 h-4 text-white" /> },
    { id: 'safari', name: 'Safari', color: '#007AFF', icon: <Globe className="w-4 h-4 text-white" /> },
    { id: 'calculator', name: 'Calculator', color: '#333', icon: <Calculator className="w-4 h-4 text-white" /> },
    { id: 'notes', name: 'Notes', color: '#FFCC02', icon: <FileText className="w-4 h-4 text-[#333]" /> },
    { id: 'terminal', name: 'Terminal', color: '#1e1e1e', icon: <Monitor className="w-4 h-4 text-white" /> },
    { id: 'calendar', name: 'Calendar', color: '#FF3B30', icon: <Calendar className="w-4 h-4 text-white" /> },
    { id: 'music', name: 'Music', color: '#FC3C44', icon: <Music className="w-4 h-4 text-white" /> },
    { id: 'photos', name: 'Photos', color: '#FF9500', icon: <ImageIcon className="w-4 h-4 text-white" /> },
    { id: 'settings', name: 'System Preferences', color: '#8E8E93', icon: <Settings className="w-4 h-4 text-white" /> },
    { id: 'clock', name: 'Clock', color: '#1c1c1e', icon: <Monitor className="w-4 h-4 text-white" /> },
    { id: 'weather', name: 'Weather', color: '#5AC8FA', icon: <Globe className="w-4 h-4 text-white" /> },
    { id: 'textedit', name: 'TextEdit', color: '#333', icon: <FileText className="w-4 h-4 text-white" /> },
    { id: 'maps', name: 'Maps', color: '#34C759', icon: <Globe className="w-4 h-4 text-white" /> },
    { id: 'reminders', name: 'Reminders', color: '#007AFF', icon: <FileText className="w-4 h-4 text-white" /> },
  ]

  return appConfigs.map(app => ({
    id: `app-${app.id}`,
    name: app.name,
    icon: <AppIcon color={app.color} icon={app.icon} />,
    category: 'Applications' as const,
    appId: app.id,
    description: `Open ${app.name}`,
  }))
}

// --- Build document results ---
function buildDocumentResults(): SearchResult[] {
  return [
    { id: 'file-documents', name: 'Documents', icon: <AppIcon color="#5AC8FA" icon={<Folder className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Folder — /Users/user/Documents' },
    { id: 'file-downloads', name: 'Downloads', icon: <AppIcon color="#5AC8FA" icon={<Folder className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Folder — /Users/user/Downloads' },
    { id: 'file-desktop', name: 'Desktop', icon: <AppIcon color="#5AC8FA" icon={<Folder className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Folder — /Users/user/Desktop' },
    { id: 'file-pictures', name: 'Pictures', icon: <AppIcon color="#5AC8FA" icon={<Folder className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Folder — /Users/user/Pictures' },
    { id: 'file-music', name: 'Music', icon: <AppIcon color="#FC3C44" icon={<Music className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Folder — /Users/user/Music' },
    { id: 'file-readme', name: 'README.md', icon: <AppIcon color="#8E8E93" icon={<FileText className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Markdown — 1.2 KB' },
    { id: 'file-todo', name: 'todo.txt', icon: <AppIcon color="#8E8E93" icon={<FileText className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Plain Text — 0.4 KB' },
    { id: 'file-bash', name: '.bash_profile', icon: <AppIcon color="#8E8E93" icon={<FileText className="w-4 h-4 text-white" />} />, category: 'Documents', appId: 'finder', description: 'Shell Script — 0.3 KB' },
  ]
}

// --- Build system preferences results ---
function buildSystemPrefResults(): SearchResult[] {
  const prefs: { id: string; name: string; icon: React.ReactNode; color: string; description: string }[] = [
    { id: 'pref-display', name: 'Display', icon: <Airplay className="w-4 h-4 text-white" />, color: '#007AFF', description: 'Resolution, brightness, Night Shift' },
    { id: 'pref-battery', name: 'Battery', icon: <Battery className="w-4 h-4 text-white" />, color: '#34C759', description: 'Battery level, power adapter, energy' },
    { id: 'pref-sound', name: 'Sound', icon: <Volume2 className="w-4 h-4 text-white" />, color: '#FF9500', description: 'Volume, alerts, output device' },
    { id: 'pref-wifi', name: 'Wi-Fi', icon: <Wifi className="w-4 h-4 text-white" />, color: '#007AFF', description: 'Network, join, known networks' },
    { id: 'pref-bluetooth', name: 'Bluetooth', icon: <Bluetooth className="w-4 h-4 text-white" />, color: '#007AFF', description: 'Devices, discoverable, connect' },
    { id: 'pref-appearance', name: 'Appearance', icon: <Palette className="w-4 h-4 text-white" />, color: '#5856D6', description: 'Light, dark, auto mode' },
    { id: 'pref-notifications', name: 'Notifications', icon: <Bell className="w-4 h-4 text-white" />, color: '#FF3B30', description: 'Alerts, banners, sounds' },
    { id: 'pref-privacy', name: 'Privacy & Security', icon: <Shield className="w-4 h-4 text-white" />, color: '#007AFF', description: 'Permissions, analytics, security' },
    { id: 'pref-accessibility', name: 'Accessibility', icon: <Accessibility className="w-4 h-4 text-white" />, color: '#007AFF', description: 'Vision, hearing, motor' },
    { id: 'pref-keyboard', name: 'Keyboard', icon: <Keyboard className="w-4 h-4 text-white" />, color: '#8E8E93', description: 'Key repeat, shortcuts, input sources' },
    { id: 'pref-mouse', name: 'Mouse', icon: <Mouse className="w-4 h-4 text-white" />, color: '#8E8E93', description: 'Tracking speed, secondary click' },
    { id: 'pref-lock', name: 'Lock Screen', icon: <Lock className="w-4 h-4 text-white" />, color: '#8E8E93', description: 'Screen lock, timeout, password' },
    { id: 'pref-users', name: 'Users & Groups', icon: <User className="w-4 h-4 text-white" />, color: '#8E8E93', description: 'Accounts, login items' },
    { id: 'pref-storage', name: 'Storage', icon: <HardDrive className="w-4 h-4 text-white" />, color: '#8E8E93', description: 'Disk usage, manage storage' },
  ]

  return prefs.map(p => ({
    id: p.id,
    name: p.name,
    icon: <AppIcon color={p.color} icon={p.icon} />,
    category: 'System Preferences' as const,
    appId: 'settings',
    description: p.description,
  }))
}

// --- Build web suggestion results ---
function buildSuggestionResults(query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.trim()
  return [
    { id: 'search-web', name: `Search the web for "${q}"`, icon: <AppIcon color="#007AFF" icon={<Globe className="w-4 h-4 text-white" />} />, category: 'Suggestions', description: 'Search with Safari' },
    { id: 'search-wiki', name: `Search Wikipedia for "${q}"`, icon: <AppIcon color="#8E8E93" icon={<Globe className="w-4 h-4 text-white" />} />, category: 'Suggestions', description: 'en.wikipedia.org' },
  ]
}

// --- Try to evaluate a math expression ---
function tryMathExpression(query: string): { result: string; expression: string } | null {
  const trimmed = query.trim()
  // Match simple math expressions: numbers with +, -, *, /, (, )
  if (/^[\d\s+\-*/().%]+$/.test(trimmed) && /\d/.test(trimmed) && /[+\-*/]/.test(trimmed)) {
    try {
      // Replace % with modulo
      const sanitized = trimmed.replace(/%/g, '%')
      // Use Function constructor for safe eval of math expressions
      const fn = new Function(`return (${sanitized})`)
      const result = fn()
      if (typeof result === 'number' && isFinite(result)) {
        // Format: remove trailing zeros
        const formatted = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString()
        return { result: formatted, expression: trimmed }
      }
    } catch {
      return null
    }
  }
  return null
}

const CATEGORY_ORDER = ['Applications', 'Documents', 'System Preferences', 'Suggestions'] as const

const CATEGORY_LABELS: Record<string, string> = {
  'Applications': 'APPLICATIONS',
  'Documents': 'DOCUMENTS',
  'System Preferences': 'SYSTEM PREFERENCES',
  'Suggestions': 'SUGGESTIONS',
}

export default function Spotlight() {
  const { isOpen, close } = useSpotlight()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const { openApp } = useMacOSStore()

  // Track previous isOpen to reset state on open
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false)
  }

  // Track previous query to reset selection
  const [prevQuery, setPrevQuery] = useState(query)
  if (prevQuery !== query) {
    setPrevQuery(query)
    if (prevIsOpen === isOpen) {
      setSelectedIndex(0)
    }
  }

  // Focus input when spotlight opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Build all results
  const appResults = useMemo(() => buildAppResults(), [])
  const documentResults = useMemo(() => buildDocumentResults(), [])
  const systemPrefResults = useMemo(() => buildSystemPrefResults(), [])

  // Check for calculator result
  const mathResult = useMemo(() => tryMathExpression(query), [query])

  // Filter results based on query
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [...appResults, ...documentResults, ...systemPrefResults]

    return [
      ...appResults.filter(r => r.name.toLowerCase().includes(q)),
      ...documentResults.filter(r => r.name.toLowerCase().includes(q)),
      ...systemPrefResults.filter(r => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))),
      ...buildSuggestionResults(query),
    ]
  }, [query, appResults, documentResults, systemPrefResults])

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: { category: string; items: SearchResult[] }[] = []

    // Add calculator result at the top if available
    if (mathResult) {
      groups.push({
        category: 'Calculator',
        items: [{
          id: 'calc-result',
          name: mathResult.result,
          icon: <AppIcon color="#FF9500" icon={<Calculator className="w-4 h-4 text-white" />} />,
          category: 'Calculator',
          description: `${mathResult.expression} =`,
        }],
      })
    }

    for (const cat of CATEGORY_ORDER) {
      const items = filteredResults.filter(r => r.category === cat)
      if (items.length > 0) {
        groups.push({ category: cat, items })
      }
    }
    return groups
  }, [filteredResults, mathResult])

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => groupedResults.flatMap(g => g.items), [groupedResults])

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.appId) {
        openApp(result.appId)
      }
      close()
    },
    [openApp, close]
  )

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedEl = resultsRef.current.querySelector('[data-selected="true"]')
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close()
      }
    },
    [close]
  )

  // Track the flat index offset as we iterate grouped results
  let flatIndex = 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-start justify-center pt-[20vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="w-[680px] max-w-[90vw] bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                close()
                return
              }

              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % Math.max(flatResults.length, 1))
                return
              }

              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev =>
                  prev <= 0 ? Math.max(flatResults.length - 1, 0) : prev - 1
                )
                return
              }

              if (e.key === 'Enter') {
                e.preventDefault()
                const selected = flatResults[selectedIndex]
                if (selected) {
                  handleSelect(selected)
                }
                return
              }
            }}
          >
            {/* Search bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              <Search className="h-5 w-5 text-white/50 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Spotlight Search"
                className="flex-1 bg-transparent text-white text-lg placeholder:text-white/30 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-white/30 hover:text-white/60 transition-colors text-xs px-2"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results */}
            {flatResults.length > 0 && (
              <div
                ref={resultsRef}
                className="max-h-[450px] overflow-y-auto py-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.15) transparent',
                }}
              >
                {groupedResults.map(group => {
                  const groupStartIndex = flatIndex
                  const items = group.items.map((item, idx) => {
                    const currentFlatIndex = groupStartIndex + idx
                    const isSelected = currentFlatIndex === selectedIndex
                    flatIndex = currentFlatIndex + 1

                    return (
                      <div
                        key={item.id}
                        data-selected={isSelected}
                        className={`flex items-center gap-3 px-4 py-[7px] mx-2 rounded-lg cursor-pointer transition-colors duration-75 ${
                          isSelected
                            ? 'bg-[#007AFF]/90 text-white'
                            : 'text-white/80 hover:bg-white/[0.06]'
                        }`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                      >
                        {/* Icon */}
                        <div className="shrink-0">
                          {item.icon}
                        </div>
                        {/* Text content */}
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium truncate">{item.name}</div>
                          {item.description && (
                            <div className={`text-[11px] truncate ${isSelected ? 'text-white/70' : 'text-white/35'}`}>
                              {item.description}
                            </div>
                          )}
                        </div>
                        {/* Category badge */}
                        {group.category !== 'Calculator' && (
                          <div className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-white/20 text-white/80' : 'bg-white/[0.06] text-white/30'
                          }`}>
                            {CATEGORY_LABELS[group.category] || group.category.toUpperCase()}
                          </div>
                        )}
                      </div>
                    )
                  })

                  return (
                    <div key={group.category} className="mb-1 last:mb-0">
                      {group.category === 'Calculator' ? (
                        <>
                          <div className="px-6 pt-2 pb-1 text-xs font-semibold text-[#FF9500] uppercase tracking-wider">
                            Calculator
                          </div>
                          {items}
                        </>
                      ) : (
                        <>
                          <div className="px-6 pt-2 pb-1 text-xs font-semibold text-white/30 uppercase tracking-wider">
                            {CATEGORY_LABELS[group.category] || group.category}
                          </div>
                          {items}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* No results */}
            {flatResults.length === 0 && query.trim() && (
              <div className="px-5 py-8 text-center">
                <div className="text-white/30 text-sm">
                  No results for &ldquo;{query}&rdquo;
                </div>
                <div className="text-white/20 text-xs mt-1">
                  Try searching for an app, file, or system setting
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
