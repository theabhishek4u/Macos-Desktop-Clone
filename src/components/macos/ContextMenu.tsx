'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore from '@/store/macos-store'

export default function ContextMenu() {
  const { contextMenu, setContextMenu } = useMacOSStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextMenu) return

    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside the context menu
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return
      setContextMenu(null)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }

    // Use mousedown for more responsive closing (don't wait for click)
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu, setContextMenu])

  if (!contextMenu) return null

  // Adjust position to not overflow viewport
  const menuWidth = 220
  const menuHeight = contextMenu.items.length * 28
  const x = Math.min(contextMenu.x, window.innerWidth - menuWidth - 10)
  const y = Math.min(contextMenu.y, window.innerHeight - menuHeight - 10)

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.96, y: -2 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -2 }}
        transition={{ duration: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed z-[99999] min-w-[200px] rounded-lg bg-[#2a2a2e]/95 backdrop-blur-2xl border border-white/[0.12] py-1 shadow-2xl"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {contextMenu.items.map((item, i) => (
          <div key={i}>
            {item.separator ? (
              <div className="my-1 h-px bg-white/10 mx-3" />
            ) : (
              <button
                className="w-full px-3 py-[3px] text-left text-[13px] text-white/90 hover:bg-[#0060df] hover:text-white rounded-[4px] mx-1 flex items-center justify-between disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-75"
                style={{ width: 'calc(100% - 8px)' }}
                disabled={item.disabled}
                onClick={() => {
                  item.action?.()
                  setContextMenu(null)
                }}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-white/40 text-[12px] ml-4">{item.shortcut}</span>
                )}
              </button>
            )}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
