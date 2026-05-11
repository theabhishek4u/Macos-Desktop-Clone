'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
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
  icon: string
  category: 'Applications' | 'Files' | 'Settings'
  appId?: string
}

const SYSTEM_RESULTS: SearchResult[] = [
  {
    id: 'about-mac',
    name: 'About This Mac',
    icon: '🍎',
    category: 'Settings',
    appId: 'settings',
  },
  {
    id: 'sleep',
    name: 'Sleep',
    icon: '😴',
    category: 'Settings',
  },
  {
    id: 'restart',
    name: 'Restart',
    icon: '🔄',
    category: 'Settings',
  },
  {
    id: 'shutdown',
    name: 'Shut Down',
    icon: '⏻',
    category: 'Settings',
  },
]

function buildAppResults(): SearchResult[] {
  return Object.values(APP_CONFIGS).map(app => ({
    id: `app-${app.id}`,
    name: app.name,
    icon: app.icon,
    category: 'Applications' as const,
    appId: app.id,
  }))
}

function buildFileResults(): SearchResult[] {
  return [
    { id: 'file-documents', name: 'Documents', icon: '📂', category: 'Files', appId: 'finder' },
    { id: 'file-downloads', name: 'Downloads', icon: '📥', category: 'Files', appId: 'finder' },
    { id: 'file-desktop', name: 'Desktop', icon: '🖥️', category: 'Files', appId: 'finder' },
    { id: 'file-pictures', name: 'Pictures', icon: '🖼️', category: 'Files', appId: 'finder' },
    { id: 'file-music', name: 'Music', icon: '🎵', category: 'Files', appId: 'finder' },
  ]
}

const CATEGORY_ORDER = ['Applications', 'Files', 'Settings'] as const

export default function Spotlight() {
  const { isOpen, close } = useSpotlight()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const { openApp } = useMacOSStore()

  // Track previous isOpen to reset state on open (render-phase derived state)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false)
  }

  // Track previous query to reset selection (render-phase derived state)
  const [prevQuery, setPrevQuery] = useState(query)
  if (prevQuery !== query) {
    setPrevQuery(query)
    if (prevIsOpen === isOpen) {
      setSelectedIndex(0)
    }
  }

  // Focus input when spotlight opens (side effect in effect is fine)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Build all results
  const allResults = [...buildAppResults(), ...buildFileResults(), ...SYSTEM_RESULTS]

  // Filter results based on query
  const filteredResults = query.trim()
    ? allResults.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    : allResults

  // Group results by category
  const groupedResults: { category: string; items: SearchResult[] }[] = []
  for (const cat of CATEGORY_ORDER) {
    const items = filteredResults.filter(r => r.category === cat)
    if (items.length > 0) {
      groupedResults.push({ category: cat, items })
    }
  }

  // Flat list for keyboard navigation
  const flatResults = groupedResults.flatMap(g => g.items)

  // Note: Cmd+Space is now handled globally in KeyboardShortcuts.tsx

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
            className="w-[640px] max-w-[90vw] bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden"
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
            </div>

            {/* Results */}
            {flatResults.length > 0 && (
              <div
                ref={resultsRef}
                className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar"
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
                        className={`flex items-center gap-3 px-5 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-500/80 text-white'
                            : 'text-white/80 hover:bg-white/[0.06]'
                        }`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                      >
                        <span className="text-xl w-8 text-center shrink-0">
                          {item.icon}
                        </span>
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                    )
                  })

                  return (
                    <div key={group.category} className="mb-1 last:mb-0">
                      <div className="px-7 pt-2 pb-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        {group.category}
                      </div>
                      {items}
                    </div>
                  )
                })}
              </div>
            )}

            {/* No results */}
            {flatResults.length === 0 && query.trim() && (
              <div className="px-5 py-8 text-center text-white/30 text-sm">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
