'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpotlight } from '@/components/macos/Spotlight'
import { useMissionControl } from '@/components/macos/MissionControl'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'

// ─── App icon helper ──────────────────────────────────────────────────────────

function getAppIcon(appId: string): string {
  const iconMap: Record<string, string> = {
    finder: '📁',
    calculator: '🧮',
    notes: '📝',
    terminal: '💻',
    calendar: '📅',
    safari: '🧭',
    settings: '⚙️',
    clock: '🕐',
    photos: '🖼️',
    music: '🎵',
    textedit: '📄',
    weather: '🌤️',
  }
  return iconMap[appId] || '📱'
}

function getAppName(appId: string): string {
  return APP_CONFIGS[appId]?.name || appId
}

// ─── App Switcher Overlay ─────────────────────────────────────────────────────

function AppSwitcher({
  openApps,
  selectedIndex,
}: {
  openApps: string[]
  selectedIndex: number
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10001] flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="bg-[#2a2a2e]/95 backdrop-blur-2xl rounded-xl px-4 py-3 border border-white/[0.12] shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center gap-1">
            {openApps.map((appId, i) => {
              const isSelected = i === selectedIndex
              return (
                <motion.div
                  key={appId}
                  className={`
                    flex flex-col items-center justify-center w-[72px] h-[72px] rounded-lg transition-all duration-150
                    ${isSelected
                      ? 'bg-white/20 ring-2 ring-white/40 shadow-lg'
                      : 'bg-transparent'
                    }
                  `}
                  animate={isSelected ? { scale: 1.08 } : { scale: 1 }}
                  transition={{ duration: 0.12 }}
                >
                  <span className="text-2xl mb-1">{getAppIcon(appId)}</span>
                  <span
                    className={`
                      text-[9px] truncate max-w-[64px] text-center
                      ${isSelected ? 'text-white font-semibold' : 'text-white/50'}
                    `}
                  >
                    {getAppName(appId)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main KeyboardShortcuts Component ─────────────────────────────────────────

export default function KeyboardShortcuts() {
  const { toggle: toggleSpotlight } = useSpotlight()
  const { toggle: toggleMissionControl } = useMissionControl()
  const windows = useMacOSStore((s) => s.windows)
  const activeWindowId = useMacOSStore((s) => s.activeWindowId)
  const openApps = useMacOSStore((s) => s.openApps)
  const closeWindow = useMacOSStore((s) => s.closeWindow)
  const minimizeWindow = useMacOSStore((s) => s.minimizeWindow)
  const focusWindow = useMacOSStore((s) => s.focusWindow)
  const openApp = useMacOSStore((s) => s.openApp)

  // App switcher state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [switcherIndex, setSwitcherIndex] = useState(0)
  const cmdDownRef = useRef(false)

  // Handle Cmd+Tab app switcher selection
  const handleSwitcherSelect = useCallback(() => {
    if (openApps.length === 0) return
    const targetAppId = openApps[switcherIndex]
    if (!targetAppId) return

    // Find a non-minimized window for this app, or open the app
    const appWindow = windows.find(
      (w) => w.appId === targetAppId && !w.isMinimized
    )
    if (appWindow) {
      focusWindow(appWindow.id)
    } else {
      openApp(targetAppId)
    }
    setIsSwitcherOpen(false)
  }, [openApps, switcherIndex, windows, focusWindow, openApp])

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ─── Cmd+Tab: App Switcher ───────────────────────────────────
      if (e.metaKey && e.key === 'Tab') {
        e.preventDefault()

        if (!cmdDownRef.current) {
          // Cmd just pressed + Tab → open switcher
          cmdDownRef.current = true
          const apps = openApps.length > 0 ? openApps : []
          if (apps.length > 0) {
            setIsSwitcherOpen(true)
            setSwitcherIndex((prev) => {
              // On first activation, select the next app (not current)
              if (prev === 0) return apps.length > 1 ? 1 : 0
              return prev
            })
          }
        } else {
          // Cmd already down, Tab pressed again → cycle
          setSwitcherIndex((prev) =>
            openApps.length > 0 ? (prev + 1) % openApps.length : 0
          )
        }
        return
      }

      // ─── Cmd+W: Close active window ──────────────────────────────
      if (e.metaKey && e.key === 'w') {
        e.preventDefault()
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
        return
      }

      // ─── Cmd+M: Minimize active window ───────────────────────────
      if (e.metaKey && e.key === 'm') {
        e.preventDefault()
        if (activeWindowId) {
          minimizeWindow(activeWindowId)
        }
        return
      }

      // ─── Cmd+N: Open new Finder window ───────────────────────────
      if (e.metaKey && e.key === 'n') {
        e.preventDefault()
        openApp('finder')
        return
      }

      // ─── Cmd+Q: Quit active app ──────────────────────────────────
      if (e.metaKey && e.key === 'q') {
        e.preventDefault()
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
        return
      }

      // ─── Cmd+Space: Toggle Spotlight ─────────────────────────────
      if (e.metaKey && e.code === 'Space') {
        e.preventDefault()
        toggleSpotlight()
        return
      }

      // ─── F11 or Cmd+F3: Toggle Mission Control ──────────────────
      if (e.key === 'F11' || (e.metaKey && e.key === 'F3')) {
        e.preventDefault()
        toggleMissionControl()
        return
      }

      // ─── Ctrl+Left/Right: Navigate between windows ──────────────
      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault()
        const visibleWindows = windows.filter((w) => !w.isMinimized)
        if (visibleWindows.length <= 1) return

        const sortedByZ = [...visibleWindows].sort((a, b) => b.zIndex - a.zIndex)
        const currentIdx = sortedByZ.findIndex((w) => w.id === activeWindowId)
        const nextIdx = (currentIdx + 1) % sortedByZ.length
        focusWindow(sortedByZ[nextIdx].id)
        return
      }

      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        const visibleWindows = windows.filter((w) => !w.isMinimized)
        if (visibleWindows.length <= 1) return

        const sortedByZ = [...visibleWindows].sort((a, b) => b.zIndex - a.zIndex)
        const currentIdx = sortedByZ.findIndex((w) => w.id === activeWindowId)
        const prevIdx = currentIdx <= 0 ? sortedByZ.length - 1 : currentIdx - 1
        focusWindow(sortedByZ[prevIdx].id)
        return
      }

      // ─── Cmd+,: Open System Preferences ──────────────────────────
      if (e.metaKey && e.key === ',') {
        e.preventDefault()
        openApp('settings')
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // When Cmd is released and switcher is open, select the app
      if (e.key === 'Meta' && isSwitcherOpen) {
        handleSwitcherSelect()
        cmdDownRef.current = false
        return
      }
      if (e.key === 'Meta') {
        cmdDownRef.current = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    activeWindowId,
    closeWindow,
    minimizeWindow,
    openApp,
    toggleSpotlight,
    toggleMissionControl,
    windows,
    focusWindow,
    openApps,
    isSwitcherOpen,
    handleSwitcherSelect,
  ])

  return (
    <AnimatePresence>
      {isSwitcherOpen && openApps.length > 0 && (
        <AppSwitcher openApps={openApps} selectedIndex={switcherIndex} />
      )}
    </AnimatePresence>
  )
}
