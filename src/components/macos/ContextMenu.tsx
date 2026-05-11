'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore from '@/store/macos-store'

export default function ContextMenu() {
  const { contextMenu, setContextMenu } = useMacOSStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }
    if (contextMenu) {
      window.addEventListener('click', handleClick)
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('click', handleClick)
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12 }}
        className="fixed z-[99999] min-w-[200px] rounded-lg bg-gray-800/95 backdrop-blur-xl border border-white/10 py-1 shadow-2xl"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        {contextMenu.items.map((item, i) => (
          <div key={i}>
            {item.separator ? (
              <div className="my-1 h-px bg-white/10 mx-3" />
            ) : (
              <button
                className="w-full px-3 py-1 text-left text-[13px] text-white/90 hover:bg-blue-500 hover:text-white rounded-[4px] mx-1 flex items-center justify-between disabled:opacity-40 disabled:hover:bg-transparent"
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
