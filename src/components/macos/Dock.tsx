'use client'

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'

// Magnification parameters
const ICON_SIZE = 52
const MAX_SCALE = 1.8
const MAGNIFICATION_RANGE = 150 // pixel range for magnification effect
const SIGMA = 70 // gaussian spread
const ICON_GAP = 6 // gap between icons (gap-1.5 = 6px)
const DOCK_PADDING_X = 12 // px-3 = 12px

// Trash config (not in APP_CONFIGS since it's not an app)
const TRASH_CONFIG = { id: 'trash', name: 'Trash', icon: '🗑️' }

interface DockIconProps {
  appId: string
  icon: string
  name: string
  scale: number
  isRunning: boolean
  isBouncing: boolean
  onClick: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
  isTrash?: boolean
}

function DockIcon({
  icon,
  name,
  scale,
  isRunning,
  isBouncing,
  onClick,
  onHoverStart,
  onHoverEnd,
  isTrash = false,
}: DockIconProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const currentSize = ICON_SIZE * scale

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => {
        setShowTooltip(true)
        onHoverStart()
      }}
      onMouseLeave={() => {
        setShowTooltip(false)
        onHoverEnd()
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
          >
            {name}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.button
        onClick={onClick}
        animate={{
          width: currentSize,
          height: currentSize,
          scale: isBouncing ? [1, 1.1, 0.95, 1.05, 1] : 1,
        }}
        transition={
          isBouncing
            ? {
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }
            : {
                type: 'spring',
                stiffness: 400,
                damping: 25,
                mass: 0.8,
              }
        }
        className="flex items-center justify-center rounded-xl transition-shadow duration-200 hover:shadow-lg hover:shadow-white/10"
        style={{
          fontSize: Math.round(currentSize * 0.55),
          lineHeight: 1,
          background: isTrash
            ? 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <span className="select-none">{icon}</span>
      </motion.button>

      {/* Running indicator dot */}
      {isRunning && !isTrash && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-0.5 h-1 w-1 rounded-full bg-white/90 shadow-sm shadow-white/50"
        />
      )}
    </div>
  )
}

export default function Dock() {
  const dockApps = useMacOSStore((s) => s.dockApps)
  const openApps = useMacOSStore((s) => s.openApps)
  const openApp = useMacOSStore((s) => s.openApp)
  const dockRef = useRef<HTMLDivElement>(null)

  // Mouse tracking state (updated via events, not ref access during render)
  const [mouseX, setMouseX] = useState<number | null>(null)
  const [dockRect, setDockRect] = useState<DOMRect | null>(null)
  const [bouncingApp, setBouncingApp] = useState<string | null>(null)

  // All dock items: apps + trash
  const dockItems = useMemo(
    () => [
      ...dockApps
        .map((id) => {
          const config = APP_CONFIGS[id]
          return config ? { id: config.id, icon: config.icon, name: config.name, isTrash: false } : null
        })
        .filter(Boolean),
      { ...TRASH_CONFIG, isTrash: true },
    ],
    [dockApps]
  )

  // Calculate scales based on mouseX and dockRect from state
  const scales = useMemo(() => {
    if (mouseX === null || !dockRect) {
      return dockItems.map(() => 1)
    }

    return dockItems.map((_, index) => {
      // Calculate approximate icon center position
      // This uses a simplified layout model: each icon takes ICON_SIZE + ICON_GAP
      // plus separator width for trash
      const separatorWidth = dockItems[dockItems.length - 1]?.isTrash ? 1 + 8 : 0 // 1px line + mx-1 (8px each side)
      const itemsBeforeTrash = dockItems.length - 1

      let iconCenterX: number
      if (index < itemsBeforeTrash) {
        iconCenterX = dockRect.left + DOCK_PADDING_X + index * (ICON_SIZE + ICON_GAP) + ICON_SIZE / 2
      } else {
        // Trash icon position: after separator
        const trashStartX =
          dockRect.left +
          DOCK_PADDING_X +
          itemsBeforeTrash * (ICON_SIZE + ICON_GAP) -
          ICON_GAP + // no gap before separator
          separatorWidth +
          ICON_GAP // gap after separator
        iconCenterX = trashStartX + ICON_SIZE / 2
      }

      const distance = Math.abs(mouseX - iconCenterX)

      if (distance > MAGNIFICATION_RANGE) return 1

      // Gaussian curve for magnification
      const gaussian = Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA))
      return 1 + (MAX_SCALE - 1) * gaussian
    })
  }, [mouseX, dockRect, dockItems])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX)
    if (dockRef.current) {
      setDockRect(dockRef.current.getBoundingClientRect())
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseX(null)
  }, [])

  const handleClick = useCallback(
    (appId: string, isTrash: boolean) => {
      if (isTrash) return
      setBouncingApp(appId)
      setTimeout(() => setBouncingApp(null), 1200)
      openApp(appId)
    },
    [openApp]
  )

  // Keep dockRect updated on mount
  useEffect(() => {
    if (dockRef.current) {
      setDockRect(dockRef.current.getBoundingClientRect())
    }
    const handleResize = () => {
      if (dockRef.current) {
        setDockRect(dockRef.current.getBoundingClientRect())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="fixed bottom-3 left-1/2 z-[9999] -translate-x-1/2">
      <motion.div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex items-end gap-1.5 rounded-2xl border border-white/30 bg-white/20 px-3 pb-2 pt-2 shadow-2xl shadow-black/20 backdrop-blur-2xl"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.3 }}
      >
        {dockItems.map((item, index) => {
          if (!item) return null

          const isTrash = item.isTrash
          const scale = scales[index] ?? 1
          const isRunning = openApps.includes(item.id)

          return (
            <React.Fragment key={item.id}>
              {/* Separator before Trash */}
              {isTrash && (
                <div className="mx-1.5 h-10 w-px self-center bg-white/25" />
              )}
              <DockIcon
                appId={item.id}
                icon={item.icon}
                name={item.name}
                scale={scale}
                isRunning={isRunning}
                isBouncing={bouncingApp === item.id}
                onClick={() => handleClick(item.id, isTrash)}
                onHoverStart={() => {}}
                onHoverEnd={() => {}}
                isTrash={isTrash}
              />
            </React.Fragment>
          )
        })}
      </motion.div>
    </div>
  )
}
