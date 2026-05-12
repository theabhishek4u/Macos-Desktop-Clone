'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore, { ContextMenuItem } from '@/store/macos-store'

// Chevron right icon for submenu items
function ChevronRight() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="shrink-0">
      <path d="M1.5 1L6.5 6L1.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ContextMenu() {
  const { contextMenu, setContextMenu } = useMacOSStore()
  const menuRef = useRef<HTMLDivElement>(null)
  const [hoveredSubmenuIndex, setHoveredSubmenuIndex] = useState<number | null>(null)
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)

  // Callback ref to capture bounding rect without accessing ref during render
  const menuRefCallback = useCallback((node: HTMLDivElement | null) => {
    menuRef.current = node
    if (node) {
      setMenuRect(node.getBoundingClientRect())
    }
  }, [])

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

  // Reset hovered submenu when context menu changes (adjust state during render)
  if (contextMenu && hoveredSubmenuIndex !== null) {
    setHoveredSubmenuIndex(null)
  }

  if (!contextMenu) return null

  // Adjust position to not overflow viewport
  const menuWidth = 240
  const menuHeight = contextMenu.items.filter(i => !i.separator).length * 28 + contextMenu.items.filter(i => i.separator).length * 10
  const x = Math.min(contextMenu.x, window.innerWidth - menuWidth - 10)
  const y = Math.min(contextMenu.y, window.innerHeight - menuHeight - 10)

  const handleSubmenuEnter = (index: number) => {
    if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current)
    setHoveredSubmenuIndex(index)
  }

  const handleSubmenuLeave = () => {
    submenuTimerRef.current = setTimeout(() => {
      setHoveredSubmenuIndex(null)
    }, 150)
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRefCallback}
        initial={{ opacity: 0, scale: 0.95, y: -3 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -3 }}
        transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed z-[99999] min-w-[220px] rounded-md backdrop-blur-2xl shadow-2xl"
        style={{
          left: x,
          top: y,
          background: 'rgba(42, 42, 46, 0.95)',
          border: '0.5px solid rgba(255,255,255,0.12)',
          padding: '4px 0',
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {contextMenu.items.map((item, i) => (
          <div key={i}>
            {item.separator ? (
              <div className="h-px bg-white/10 mx-3 my-1" />
            ) : (
              <div
                className="relative"
                onMouseEnter={() => item.submenu && handleSubmenuEnter(i)}
                onMouseLeave={() => item.submenu && handleSubmenuLeave()}
              >
                <button
                  className={`w-full px-3 py-[3px] text-left text-[13px] text-white/90 hover:bg-[#0058d0] hover:text-white rounded-[4px] mx-1 flex items-center justify-between disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-75 ${
                    hoveredSubmenuIndex === i && item.submenu ? 'bg-[#0058d0] text-white' : ''
                  }`}
                  style={{
                    width: 'calc(100% - 8px)',
                    font: "13px -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                  }}
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.submenu) return // Don't close on submenu parent click
                    item.action?.()
                    setContextMenu(null)
                  }}
                >
                  <span>{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <span className="text-white/50 text-[12px] ml-4">{item.shortcut}</span>
                    )}
                    {item.submenu && (
                      <span className="text-white/50 ml-1">
                        <ChevronRight />
                      </span>
                    )}
                  </div>
                </button>

                {/* Submenu */}
                <AnimatePresence>
                  {item.submenu && hoveredSubmenuIndex === i && menuRect && (
                    <Submenu
                      items={item.submenu}
                      parentRect={menuRect}
                      onClose={() => setContextMenu(null)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

// Submenu component that appears to the right of the parent item
function Submenu({
  items,
  parentRect,
  onClose,
}: {
  items: ContextMenuItem[]
  parentRect: DOMRect
  onClose: () => void
}) {
  const submenuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 })

  useEffect(() => {
    if (!submenuRef.current) return
    const submenuRect = submenuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Position to the right of parent, or left if not enough space
    const left = parentRect.right + 4 + submenuRect.width > viewportWidth
      ? parentRect.left - submenuRect.width - 4
      : parentRect.right + 4

    // Keep within viewport vertically
    const top = Math.max(4, Math.min(parentRect.top, viewportHeight - submenuRect.height - 4))

    setPosition({ left, top })
  }, [parentRect])

  return (
    <motion.div
      ref={submenuRef}
      initial={{ opacity: 0, scale: 0.95, x: -4 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -4 }}
      transition={{ duration: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed z-[100000] min-w-[180px] rounded-md backdrop-blur-2xl shadow-2xl"
      style={{
        left: position.left,
        top: position.top,
        background: 'rgba(42, 42, 46, 0.95)',
        border: '0.5px solid rgba(255,255,255,0.12)',
        padding: '4px 0',
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.separator ? (
            <div className="h-px bg-white/10 mx-3 my-1" />
          ) : (
            <button
              className="w-full px-3 py-[3px] text-left text-[13px] text-white/90 hover:bg-[#0058d0] hover:text-white rounded-[4px] mx-1 flex items-center justify-between disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-75"
              style={{
                width: 'calc(100% - 8px)',
                font: "13px -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
              }}
              disabled={item.disabled}
              onClick={() => {
                item.action?.()
                onClose()
              }}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-white/50 text-[12px] ml-4">{item.shortcut}</span>
              )}
            </button>
          )}
        </div>
      ))}
    </motion.div>
  )
}
