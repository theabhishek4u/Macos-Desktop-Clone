'use client'

import React, { useRef, useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore from '@/store/macos-store'
import useDarkModeStore from '@/store/dark-mode-store'

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

// Apps that use light window chrome (light title bar, light frame)
const LIGHT_WINDOW_APPS = new Set(['notes', 'textedit', 'calculator', 'calendar', 'clock', 'settings', 'finder', 'photos'])

const SNAP_ZONE_SIZE = 20

type SnapPreview = 'left' | 'right' | 'top' | null

export default function Window({ windowId, children }: WindowProps) {
  const windowState = useMacOSStore((s) => s.windows.find((w) => w.id === windowId))
  const activeWindowId = useMacOSStore((s) => s.activeWindowId)
  const closeWindow = useMacOSStore((s) => s.closeWindow)
  const minimizeWindow = useMacOSStore((s) => s.minimizeWindow)
  const maximizeWindow = useMacOSStore((s) => s.maximizeWindow)
  const focusWindow = useMacOSStore((s) => s.focusWindow)
  const updateWindowPosition = useMacOSStore((s) => s.updateWindowPosition)
  const updateWindowSize = useMacOSStore((s) => s.updateWindowSize)
  const snapWindow = useMacOSStore((s) => s.snapWindow)
  const unsnapWindow = useMacOSStore((s) => s.unsnapWindow)
  const { isDarkMode } = useDarkModeStore()

  const [trafficHover, setTrafficHover] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMinimizing, setIsMinimizing] = useState(false)
  const [prevIsMinimized, setPrevIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [snapPreview, setSnapPreview] = useState<SnapPreview>(null)

  // Use refs for drag/resize state to avoid re-renders during interaction
  const dragRef = useRef<{
    startX: number
    startY: number
    windowX: number
    windowY: number
    hadSnap: boolean
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

  // --- Snap zone detection ---
  const getSnapZone = useCallback((clientX: number, clientY: number): SnapPreview => {
    const screenW = window.innerWidth
    // Check top edge for maximize
    if (clientY <= 28 + SNAP_ZONE_SIZE) {
      return 'top'
    }
    // Check left edge for left snap
    if (clientX <= SNAP_ZONE_SIZE) {
      return 'left'
    }
    // Check right edge for right snap
    if (clientX >= screenW - SNAP_ZONE_SIZE) {
      return 'right'
    }
    return null
  }, [])

  // --- Drag handlers ---
  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't drag if clicking traffic light buttons
      if ((e.target as HTMLElement).closest('[data-traffic-light]')) return
      e.preventDefault()
      focusWindow(windowId)

      // If window is snapped, unsnap it first and set position to where mouse grabbed it
      const hadSnap = !!windowState?.snapPosition

      setIsDragging(true)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        windowX: windowState!.x,
        windowY: windowState!.y,
        hadSnap,
      }

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return

        // If window was snapped, unsnap on first drag movement
        if (dragRef.current.hadSnap && windowState?.snapPosition) {
          unsnapWindow(windowId)
          // After unsnap, recalculate positions based on prevBounds
          dragRef.current.hadSnap = false
          // Use the unsnapped position - re-read from store isn't possible here,
          // so we compute the new position relative to current mouse
          const prevBounds = windowState.prevBounds ?? { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height }
          dragRef.current = {
            startX: ev.clientX,
            startY: ev.clientY,
            windowX: prevBounds.x,
            windowY: prevBounds.y,
            hadSnap: false,
          }
          updateWindowPosition(windowId, prevBounds.x, prevBounds.y)
          updateWindowSize(windowId, prevBounds.width, prevBounds.height)
          return
        }

        const dx = ev.clientX - dragRef.current.startX
        const dy = ev.clientY - dragRef.current.startY
        const newX = dragRef.current.windowX + dx
        const newY = Math.max(28, dragRef.current.windowY + dy) // Don't drag above menu bar
        updateWindowPosition(windowId, newX, newY)

        // Check snap zone for preview
        const zone = getSnapZone(ev.clientX, ev.clientY)
        setSnapPreview(zone)
      }

      const handleMouseUp = (ev: MouseEvent) => {
        dragRef.current = null
        setIsDragging(false)

        // Check if we should snap
        const zone = getSnapZone(ev.clientX, ev.clientY)
        if (zone === 'top') {
          maximizeWindow(windowId)
        } else if (zone === 'left') {
          snapWindow(windowId, 'left')
        } else if (zone === 'right') {
          snapWindow(windowId, 'right')
        }

        setSnapPreview(null)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [windowId, windowState, focusWindow, updateWindowPosition, updateWindowSize, maximizeWindow, snapWindow, unsnapWindow, getSnapZone]
  )

  // --- Resize handlers ---
  const handleResizeMouseDown = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowId)

      setIsResizing(true)
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
        setIsResizing(false)
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

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      closeWindow(windowId)
    }, 200)
  }, [closeWindow, windowId])

  if (!windowState) return null

  const { id, title, x, y, width, height, isMinimized, isMaximized } = windowState
  const isLightWindow = !isDarkMode && LIGHT_WINDOW_APPS.has(windowState.appId)

  // Inactive desaturated traffic light colors
  const inactiveCloseColor = isLightWindow ? '#c8c8c8' : '#555555'
  const inactiveMinColor = isLightWindow ? '#c8c8c8' : '#555555'
  const inactiveMaxColor = isLightWindow ? '#c8c8c8' : '#555555'

  // Track minimize state transitions (render-phase derived state pattern)
  if (isMinimized && !prevIsMinimized) {
    setPrevIsMinimized(true)
    setIsMinimizing(true)
  } else if (!isMinimized && prevIsMinimized) {
    setPrevIsMinimized(false)
    setIsMinimizing(false)
  }

  // The window should render if not minimized, or currently in minimize animation
  const shouldRender = !isMinimized || isMinimizing

  // Calculate minimize animation target (toward dock at bottom center)
  const dockCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 960
  const dockCenterY = typeof window !== 'undefined' ? window.innerHeight - 40 : 1040
  const minimizeTranslateX = dockCenterX - (x + width / 2)
  const minimizeTranslateY = dockCenterY - (y + height / 2)

  // Multi-layered shadow system
  const getBoxShadow = () => {
    if (isActive) {
      if (isDragging) {
        return isLightWindow
          ? '0 0 0 0.5px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.15), 0 40px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.2)'
          : '0 0 0 0.5px rgba(255,255,255,0.12), 0 20px 40px rgba(0,0,0,0.3), 0 40px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)'
      }
      return isLightWindow
        ? '0 0 0 0.5px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)'
        : '0 0 0 0.5px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.2), 0 24px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
    }
    return isLightWindow
      ? '0 0 0 0.5px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.04)'
      : '0 0 0 0.5px rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)'
  }

  // Snap preview overlay dimensions
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080
  const menuBarH = 28
  const dockH = 80

  return (
    <>
      {/* Snap Preview Overlay */}
      <AnimatePresence>
        {snapPreview && isDragging && (
          <motion.div
            className="fixed z-[9999] pointer-events-none rounded-lg"
            style={{
              top: menuBarH,
              left: snapPreview === 'right' ? screenW / 2 : 0,
              width: snapPreview === 'top' ? screenW : screenW / 2,
              height: screenH - menuBarH - dockH,
              background: 'rgba(0, 122, 255, 0.15)',
              border: '2px solid rgba(0, 122, 255, 0.3)',
              boxShadow: 'inset 0 0 20px rgba(0, 122, 255, 0.1)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shouldRender && (
          <motion.div
            key={id}
            className="absolute flex flex-col"
            style={{
              left: x,
              top: y,
              width,
              height,
              zIndex: windowState.zIndex,
              transition: isDragging || isResizing ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={
              isMinimizing
                ? {
                    scale: 0.1,
                    x: minimizeTranslateX,
                    y: minimizeTranslateY,
                    opacity: 0,
                    rotate: 0,
                  }
                : isClosing
                  ? { scale: 0.92, opacity: 0, x: 0, y: 0, rotate: 0 }
                  : { scale: isDragging ? 1.01 : 1, opacity: isActive ? 1 : 0.98, x: 0, y: 0, rotate: isDragging ? 0.5 : 0 }
            }
            exit={{
              scale: 0.92,
              opacity: 0,
            }}
            transition={
              isMinimizing
                ? { duration: 0.4, ease: 'easeIn' }
                : {
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }
            }
            onAnimationComplete={() => {
              if (isMinimizing) {
                setIsMinimizing(false)
              }
            }}
            onMouseDown={() => focusWindow(windowId)}
          >
            {/* Window frame */}
            <div
              className={`flex flex-col w-full h-full rounded-xl overflow-hidden transition-shadow duration-300 relative ${
                isMaximized || windowState.snapPosition ? 'rounded-none' : ''
              }`}
              style={{
                background: isLightWindow ? '#f0f0f0' : '#1e1e1e',
                boxShadow: getBoxShadow(),
              }}
            >
              {/* Inner shadow overlay for depth */}
              <div
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                  boxShadow: isLightWindow
                    ? 'inset 0 0 0 0.5px rgba(0,0,0,0.06)'
                    : 'inset 0 0 0 0.5px rgba(255,255,255,0.05)',
                  borderRadius: 'inherit',
                }}
              />
              {/* Top highlight line - inner border highlight for light windows */}
              <div
                className="w-full h-[1px] shrink-0"
                style={{
                  background: isLightWindow
                    ? isActive
                      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 80%, transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.03) 20%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.03) 80%, transparent)'
                    : isActive
                      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 80%, transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 80%, transparent)',
                }}
              />

              {/* Title Bar */}
              <div
                className={`flex items-center h-[36px] shrink-0 select-none px-3 transition-colors duration-150 relative ${
                  isLightWindow
                    ? isActive
                      ? 'bg-[#e8e8e8]/95 backdrop-blur-md border-b border-black/10'
                      : 'bg-[#e0e0e0]/95 backdrop-blur-md border-b border-black/[0.08]'
                    : isActive
                      ? 'bg-[#3a3a3a]/95 backdrop-blur-md border-b border-white/10'
                      : 'bg-[#2d2d2d]/95 backdrop-blur-md border-b border-white/5'
                }`}
                style={{
                  // Subtle bottom border for light inactive windows
                  ...(isLightWindow && !isActive ? { borderBottomColor: 'rgba(0,0,0,0.08)' } : {}),
                }}
                onMouseDown={handleDragMouseDown}
                onDoubleClick={() => {
                  if (windowState.snapPosition) {
                    unsnapWindow(windowId)
                  } else {
                    maximizeWindow(windowId)
                  }
                }}
              >
                {/* Traffic Light Buttons */}
                <div
                  className="flex items-center gap-[8px] mr-3"
                  data-traffic-light
                  onMouseEnter={() => setTrafficHover(true)}
                  onMouseLeave={() => setTrafficHover(false)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Close */}
                  <button
                    data-traffic-light
                    className={`w-[13px] h-[13px] rounded-full flex items-center justify-center transition-all duration-150 ${
                      isActive ? 'bg-[#ff5f57]' : ''
                    } ${trafficHover && isActive ? 'hover:brightness-90' : ''}`}
                    style={!isActive ? { background: inactiveCloseColor, boxShadow: isLightWindow ? 'inset 0 0 0 0.5px rgba(0,0,0,0.12), inset 0 1px 2px rgba(0,0,0,0.06)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 2px rgba(0,0,0,0.15)' } : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClose()
                    }}
                  >
                    <svg
                      className="w-[8px] h-[8px] text-black/80 transition-opacity duration-150"
                      style={{ opacity: trafficHover && isActive ? 1 : 0 }}
                      viewBox="0 0 8 8"
                      fill="none"
                    >
                      <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Minimize */}
                  <button
                    data-traffic-light
                    className={`w-[13px] h-[13px] rounded-full flex items-center justify-center transition-all duration-150 ${
                      isActive ? 'bg-[#febc2e]' : ''
                    } ${trafficHover && isActive ? 'hover:brightness-90' : ''}`}
                    style={!isActive ? { background: inactiveMinColor, boxShadow: isLightWindow ? 'inset 0 0 0 0.5px rgba(0,0,0,0.12), inset 0 1px 2px rgba(0,0,0,0.06)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 2px rgba(0,0,0,0.15)' } : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      minimizeWindow(windowId)
                    }}
                  >
                    <svg
                      className="w-[8px] h-[8px] text-black/80 transition-opacity duration-150"
                      style={{ opacity: trafficHover && isActive ? 1 : 0 }}
                      viewBox="0 0 8 8"
                      fill="none"
                    >
                      <path d="M1 4H7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Maximize (fullscreen icon) */}
                  <button
                    data-traffic-light
                    className={`w-[13px] h-[13px] rounded-full flex items-center justify-center transition-all duration-150 ${
                      isActive ? 'bg-[#28c840]' : ''
                    } ${trafficHover && isActive ? 'hover:brightness-90' : ''}`}
                    style={!isActive ? { background: inactiveMaxColor, boxShadow: isLightWindow ? 'inset 0 0 0 0.5px rgba(0,0,0,0.12), inset 0 1px 2px rgba(0,0,0,0.06)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 2px rgba(0,0,0,0.15)' } : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (windowState.snapPosition) {
                        unsnapWindow(windowId)
                      } else {
                        maximizeWindow(windowId)
                      }
                    }}
                  >
                    <svg
                      className="w-[8px] h-[8px] text-black/80 transition-opacity duration-150"
                      style={{ opacity: trafficHover && isActive ? 1 : 0 }}
                      viewBox="0 0 8 8"
                      fill="none"
                    >
                      <path d="M1 5.5L1 7L2.5 7M7 2.5L7 1L5.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 7L4.5 4.5M1 1L3.5 3.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Window Title */}
                <div className="flex-1 text-center pr-14">
                  <span
                    className={`text-[13px] font-medium transition-colors duration-150 ${
                      isLightWindow
                        ? isActive ? 'text-black/85' : 'text-black/40'
                        : isActive ? 'text-white/85' : 'text-white/40'
                    }`}
                  >
                    {title}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-90'}`}>
                {children}
              </div>
            </div>

            {/* Resize Handles - 8 directions (hide when snapped) */}
            {!windowState.snapPosition && RESIZE_HANDLES.map(({ direction, className }) => (
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
    </>
  )
}
