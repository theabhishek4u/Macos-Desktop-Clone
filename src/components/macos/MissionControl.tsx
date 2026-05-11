'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore, { APP_CONFIGS, WindowState } from '@/store/macos-store'

// --- Shared mission control state (module-level) ---
interface MissionControlState {
  isOpen: boolean
}

const mcState: MissionControlState = { isOpen: false }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useMissionControl() {
  const [isOpen, setIsOpen] = useState(mcState.isOpen)

  useEffect(() => {
    const listener = () => setIsOpen(mcState.isOpen)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const open = useCallback(() => {
    mcState.isOpen = true
    emitChange()
  }, [])

  const close = useCallback(() => {
    mcState.isOpen = false
    emitChange()
  }, [])

  const toggle = useCallback(() => {
    mcState.isOpen = !mcState.isOpen
    emitChange()
  }, [])

  return { isOpen, open, close, toggle }
}

// --- Grid layout helpers ---
function getGridCols(count: number): number {
  if (count <= 1) return 1
  if (count <= 2) return 2
  if (count <= 4) return 2
  if (count <= 6) return 3
  if (count <= 9) return 3
  return 4
}

// --- Window preview card ---
function MissionControlWindow({
  win,
  index,
  onClick,
}: {
  win: WindowState
  index: number
  onClick: () => void
}) {
  const appConfig = APP_CONFIGS[win.appId]

  // Calculate thumbnail dimensions maintaining aspect ratio
  const maxW = 260
  const maxH = 170
  const aspectRatio = win.width / win.height
  let thumbW = maxW
  let thumbH = maxW / aspectRatio
  if (thumbH > maxH) {
    thumbH = maxH
    thumbW = maxH * aspectRatio
  }

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer group"
      initial={{ opacity: 0, scale: 0.5, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 40 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.06, 0.5),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.06, y: -5 }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {/* Window preview card */}
      <div
        className="rounded-lg overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.12] transition-all duration-200 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:border-white/[0.22]"
        style={{
          width: thumbW,
          height: thumbH,
          background: '#1e1e1e',
        }}
      >
        {/* Title bar */}
        <div className="h-[22px] bg-[#3a3a3a]/95 flex items-center px-2 border-b border-white/[0.08]">
          <div className="flex gap-[5px]">
            <div className="w-[7px] h-[7px] rounded-full bg-[#ff5f57]" />
            <div className="w-[7px] h-[7px] rounded-full bg-[#febc2e]" />
            <div className="w-[7px] h-[7px] rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 text-center pr-10">
            <span className="text-[8px] text-white/50 font-medium">{win.title}</span>
          </div>
        </div>
        {/* Content area placeholder */}
        <div className="flex-1 flex items-center justify-center bg-[#2a2a2a]">
          <span className="text-white/15 text-lg font-semibold tracking-wide">
            {appConfig?.name || win.appId}
          </span>
        </div>
      </div>

      {/* Window title below */}
      <span className="mt-2 text-[11px] text-white/60 font-medium group-hover:text-white/90 transition-colors duration-200 truncate max-w-[260px]">
        {win.title}
      </span>
    </motion.div>
  )
}

// --- Main Mission Control component ---
export default function MissionControl() {
  const { isOpen, close } = useMissionControl()
  const windows = useMacOSStore((s) => s.windows)
  const focusWindow = useMacOSStore((s) => s.focusWindow)
  const visibleWindows = useMemo(() => windows.filter((w) => !w.isMinimized), [windows])

  // Keyboard shortcut: F3 or Ctrl+Up to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3' || (e.ctrlKey && e.key === 'ArrowUp')) {
        e.preventDefault()
        mcState.isOpen = !mcState.isOpen
        emitChange()
      }
      if (e.key === 'Escape' && mcState.isOpen) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close])

  // Handle clicking a window → focus it and close Mission Control
  const handleWindowClick = useCallback(
    (windowId: string) => {
      focusWindow(windowId)
      close()
    },
    [focusWindow, close]
  )

  // Handle clicking empty area → close Mission Control
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close()
      }
    },
    [close]
  )

  const count = visibleWindows.length
  const cols = getGridCols(count)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xl flex flex-col items-center select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdropClick}
        >
          {/* Desktop Spaces Bar */}
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="h-[40px] bg-black/30 backdrop-blur-md rounded-lg flex items-center px-4 gap-3">
              <div className="w-[120px] h-[28px] bg-white/15 rounded-md flex items-center justify-center border border-white/10">
                <span className="text-white/90 text-xs font-medium">Desktop 1</span>
              </div>
            </div>
          </motion.div>

          {/* Windows Grid */}
          <div className="flex-1 flex items-center justify-center px-8 py-6 w-full">
            {count > 0 ? (
              <div
                className="grid gap-6 justify-items-center"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  maxWidth: `${cols * 280}px`,
                  width: '100%',
                }}
              >
                {visibleWindows.map((win, index) => (
                  <MissionControlWindow
                    key={win.id}
                    win={win}
                    index={index}
                    onClick={() => handleWindowClick(win.id)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/40 text-lg"
              >
                No windows open
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
