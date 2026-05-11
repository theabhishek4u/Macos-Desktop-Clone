'use client'

import React, { useRef, useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore from '@/store/macos-store'

interface WindowProps {
  windowId: string
  children: React.ReactNode
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'

const CURSOR_MAP: Record<ResizeDirection, string> = {
  n: 'n-resize',
  s: 's-resize',
  e: 'e-resize',
  w: 'w-resize',
  nw: 'nw-resize',
  ne: 'ne-resize',
  sw: 'sw-resize',
  se: 'se-resize',
}

const RESIZE_HANDLES: { direction: ResizeDirection; className: string }[] = [
  { direction: 'n', className: 'top-0 left-2 right-2 h-[6px] -mt-[3px]' },
  { direction: 's', className: 'bottom-0 left-2 right-2 h-[6px] -mb-[3px]' },
  { direction: 'w', className: 'left-0 top-2 bottom-2 w-[6px] -ml-[3px]' },
  { direction: 'e', className: 'right-0 top-2 bottom-2 w-[6px] -mr-[3px]' },
  { direction: 'nw', className: 'top-0 left-0 w-[12px] h-[12px] -mt-[3px] -ml-[3px]' },
  { direction: 'ne', className: 'top-0 right-0 w-[12px] h-[12px] -mt-[3px] -mr-[3px]' },
  { direction: 'sw', className: 'bottom-0 left-0 w-[12px] h-[12px] -mb-[3px] -ml-[3px]' },
  { direction: 'se', className: 'bottom-0 right-0 w-[12px] h-[12px] -mb-[3px] -mr-[3px]' },
]

export default function Window({ windowId, children }: WindowProps) {
  const windowState = useMacOSStore((s) => s.windows.find((w) => w.id === windowId))
  const activeWindowId = useMacOSStore((s) => s.activeWindowId)
  const closeWindow = useMacOSStore((s) => s.closeWindow)
  const minimizeWindow = useMacOSStore((s) => s.minimizeWindow)
  const maximizeWindow = useMacOSStore((s) => s.maximizeWindow)
  const focusWindow = useMacOSStore((s) => s.focusWindow)
  const updateWindowPosition = useMacOSStore((s) => s.updateWindowPosition)
  const updateWindowSize = useMacOSStore((s) => s.updateWindowSize)

  const [trafficHover, setTrafficHover] = useState(false)

  // Use refs for drag/resize state to avoid re-renders during interaction
  const dragRef = useRef<{
    startX: number
    startY: number
    windowX: number
    windowY: number
  } | null>(null)

  const resizeRef = useRef<{
    direction: ResizeDirection
    startMouseX: number
    startMouseY: number
    startWindowX: number
    startWindowY: number
    startWidth: number
    startHeight: number
  } | null>(null)

  const isActive = activeWindowId === windowId

  // Focus on mount
  useEffect(() => {
    focusWindow(windowId)
  }, [focusWindow, windowId])

  // --- Drag handlers ---
  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't drag if clicking traffic light buttons
      if ((e.target as HTMLElement).closest('[data-traffic-light]')) return
      e.preventDefault()
      focusWindow(windowId)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        windowX: windowState!.x,
        windowY: windowState!.y,
      }

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return
        const dx = ev.clientX - dragRef.current.startX
        const dy = ev.clientY - dragRef.current.startY
        const newX = dragRef.current.windowX + dx
        const newY = Math.max(28, dragRef.current.windowY + dy) // Don't drag above menu bar
        updateWindowPosition(windowId, newX, newY)
      }

      const handleMouseUp = () => {
        dragRef.current = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [windowId, windowState, focusWindow, updateWindowPosition]
  )

  // --- Resize handlers ---
  const handleResizeMouseDown = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowId)

      resizeRef.current = {
        direction,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startWindowX: windowState!.x,
        startWindowY: windowState!.y,
        startWidth: windowState!.width,
        startHeight: windowState!.height,
      }

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return
        const {
          direction: dir,
          startMouseX,
          startMouseY,
          startWindowX,
          startWindowY,
          startWidth,
          startHeight,
        } = resizeRef.current

        const dx = ev.clientX - startMouseX
        const dy = ev.clientY - startMouseY

        let newX = startWindowX
        let newY = startWindowY
        let newWidth = startWidth
        let newHeight = startHeight

        // East edge
        if (dir.includes('e')) {
          newWidth = Math.max(windowState!.minWidth, startWidth + dx)
        }
        // West edge
        if (dir.includes('w')) {
          const proposedWidth = startWidth - dx
          if (proposedWidth >= windowState!.minWidth) {
            newWidth = proposedWidth
            newX = startWindowX + dx
          } else {
            newWidth = windowState!.minWidth
            newX = startWindowX + (startWidth - windowState!.minWidth)
          }
        }
        // South edge
        if (dir.includes('s')) {
          newHeight = Math.max(windowState!.minHeight, startHeight + dy)
        }
        // North edge
        if (dir.includes('n')) {
          const proposedHeight = startHeight - dy
          const minY = 28
          if (proposedHeight >= windowState!.minHeight) {
            newHeight = proposedHeight
            newY = Math.max(minY, startWindowY + dy)
          } else {
            newHeight = windowState!.minHeight
            newY = startWindowY + (startHeight - windowState!.minHeight)
          }
          // Don't let window go above menu bar
          if (newY < minY) {
            newY = minY
          }
        }

        updateWindowPosition(windowId, newX, newY)
        updateWindowSize(windowId, newWidth, newHeight)
      }

      const handleMouseUp = () => {
        resizeRef.current = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = CURSOR_MAP[direction]
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [windowId, windowState, focusWindow, updateWindowPosition, updateWindowSize]
  )

  if (!windowState) return null

  const { id, title, x, y, width, height, isMinimized, isMaximized } = windowState

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          key={id}
          className="absolute flex flex-col"
          style={{
            left: x,
            top: y,
            width,
            height,
            zIndex: windowState.zIndex,
          }}
          initial={false}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.4,
            opacity: 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          onMouseDown={() => focusWindow(windowId)}
        >
          {/* Window frame */}
          <div
            className={`flex flex-col w-full h-full rounded-xl overflow-hidden transition-shadow duration-200 transition-all duration-300 ${
              isActive
                ? 'shadow-2xl shadow-black/30'
                : 'shadow-lg shadow-black/15'
            } ${isMaximized ? 'rounded-none' : ''}`}
            style={{
              background: '#1e1e1e',
            }}
          >
            {/* Title Bar */}
            <div
              className={`flex items-center h-[38px] shrink-0 select-none px-3 transition-colors duration-150 ${
                isActive
                  ? 'bg-[#3a3a3a] border-b border-white/10'
                  : 'bg-[#2d2d2d] border-b border-white/5'
              }`}
              onMouseDown={handleDragMouseDown}
              onDoubleClick={() => maximizeWindow(windowId)}
            >
              {/* Traffic Light Buttons */}
              <div
                className="flex items-center gap-2 mr-3"
                onMouseEnter={() => setTrafficHover(true)}
                onMouseLeave={() => setTrafficHover(false)}
              >
                {/* Close */}
                <button
                  data-traffic-light
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors duration-150 ${
                    isActive ? 'bg-[#ff5f57]' : 'bg-[#4a4a4a]'
                  } ${trafficHover ? 'hover:brightness-90' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    closeWindow(windowId)
                  }}
                >
                  {trafficHover && isActive && (
                    <span className="text-[9px] leading-none text-black/80 font-bold">✕</span>
                  )}
                </button>

                {/* Minimize */}
                <button
                  data-traffic-light
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors duration-150 ${
                    isActive ? 'bg-[#febc2e]' : 'bg-[#4a4a4a]'
                  } ${trafficHover ? 'hover:brightness-90' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    minimizeWindow(windowId)
                  }}
                >
                  {trafficHover && isActive && (
                    <span className="text-[11px] leading-none text-black/80 font-bold -mt-[1px]">−</span>
                  )}
                </button>

                {/* Maximize */}
                <button
                  data-traffic-light
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors duration-150 ${
                    isActive ? 'bg-[#28c840]' : 'bg-[#4a4a4a]'
                  } ${trafficHover ? 'hover:brightness-90' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    maximizeWindow(windowId)
                  }}
                >
                  {trafficHover && isActive && (
                    <span className="text-[10px] leading-none text-black/80 font-bold">+</span>
                  )}
                </button>
              </div>

              {/* Window Title */}
              <div className="flex-1 text-center pr-14">
                <span
                  className={`text-[13px] font-medium transition-colors duration-150 ${
                    isActive ? 'text-white/85' : 'text-white/40'
                  }`}
                >
                  {title}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>

          {/* Resize Handles - 8 directions */}
          {RESIZE_HANDLES.map(({ direction, className }) => (
            <div
              key={direction}
              className={`absolute z-10 ${className}`}
              style={{ cursor: CURSOR_MAP[direction] }}
              onMouseDown={handleResizeMouseDown(direction)}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
