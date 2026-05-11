'use client'

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Compass,
  NotebookPen,
  Terminal,
  Calculator,
  CalendarIcon,
  ImageIcon,
  Music as MusicIcon,
  Settings,
  Clock as ClockIcon,
  FileText,
  CloudSun,
  Trash2,
  Rocket,
  type LucideIcon,
} from 'lucide-react'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'
import { useLaunchpad } from '@/components/macos/Launchpad'

// Magnification parameters
const ICON_SIZE = 52
const MAX_SCALE = 1.8
const MAGNIFICATION_RANGE = 150 // pixel range for magnification effect
const SIGMA = 70 // gaussian spread
const ICON_GAP = 6 // gap between icons (gap-1.5 = 6px)
const DOCK_PADDING_X = 16 // px-4 = 16px

// Icon configuration mapping
interface IconConfig {
  gradient: string
  icon: LucideIcon
  iconColor?: string // Override icon color for light backgrounds
}

const ICON_MAP: Record<string, IconConfig> = {
  finder: { gradient: 'linear-gradient(135deg, #4FC3F7, #2196F3)', icon: FolderOpen },
  safari: { gradient: 'linear-gradient(135deg, #64B5F6, #E3F2FD)', icon: Compass, iconColor: '#1a73e8' },
  notes: { gradient: 'linear-gradient(135deg, #FFD54F, #FFC107)', icon: NotebookPen, iconColor: '#5D4037' },
  terminal: { gradient: 'linear-gradient(135deg, #37474F, #263238)', icon: Terminal },
  calculator: { gradient: 'linear-gradient(135deg, #FF8A65, #FF7043)', icon: Calculator },
  calendar: { gradient: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)', icon: CalendarIcon, iconColor: '#E53935' },
  photos: { gradient: 'linear-gradient(135deg, #FF6F61, #FFB74D, #4FC3F7, #81C784, #BA68C8)', icon: ImageIcon },
  music: { gradient: 'linear-gradient(135deg, #FF5252, #E91E63)', icon: MusicIcon },
  settings: { gradient: 'linear-gradient(135deg, #78909C, #546E7A)', icon: Settings },
  clock: { gradient: 'linear-gradient(135deg, #212121, #424242)', icon: ClockIcon },
  textedit: { gradient: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)', icon: FileText, iconColor: '#3949AB' },
  weather: { gradient: 'linear-gradient(135deg, #64B5F6, #42A5F5)', icon: CloudSun },
  trash: { gradient: 'linear-gradient(135deg, #90A4AE, #78909C)', icon: Trash2 },
  launchpad: { gradient: 'linear-gradient(135deg, #424242, #757575)', icon: Rocket },
}

// Dock App Icon component
function DockAppIcon({ appId, size }: { appId: string; size: number }) {
  const config = ICON_MAP[appId]
  if (!config) {
    return (
      <div
        className="flex items-center justify-center rounded-[22%]"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #9E9E9E, #757575)',
        }}
      >
        <span className="text-white text-xs">?</span>
      </div>
    )
  }

  const IconComponent = config.icon
  const iconColor = config.iconColor || 'white'
  const iconSize = Math.round(size * 0.52)

  return (
    <div
      className="flex items-center justify-center rounded-[22%] relative overflow-hidden"
      style={{
        width: size,
        height: size,
        background: config.gradient,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.2)',
        border: '0.5px solid rgba(255,255,255,0.2)',
      }}
    >
      {/* Subtle shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
          borderRadius: 'inherit',
        }}
      />
      <IconComponent
        size={iconSize}
        color={iconColor}
        strokeWidth={1.8}
        style={{ position: 'relative', zIndex: 1 }}
      />
    </div>
  )
}

// Trash config (not in APP_CONFIGS since it's not an app)
const TRASH_CONFIG = { id: 'trash', name: 'Trash', icon: 'trash' }

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
  onContextMenu: (e: React.MouseEvent) => void
  isTrash?: boolean
}

function DockIcon({
  appId,
  scale,
  name,
  isRunning,
  isBouncing,
  onClick,
  onHoverStart,
  onHoverEnd,
  onContextMenu,
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
            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-gray-800/90 px-4 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md"
          >
            {name}
            {/* Caret/arrow pointing down to the icon */}
            <div className="absolute -bottom-[5px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-gray-800/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.button
        onClick={onClick}
        onContextMenu={onContextMenu}
        aria-label={name}
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
        className="flex items-center justify-center rounded-[12px] transition-shadow duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        style={{
          background: isTrash
            ? 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
          padding: 0,
        }}
      >
        <DockAppIcon appId={appId} size={currentSize * 0.85} />
      </motion.button>

      {/* Running indicator dot */}
      {isRunning && !isTrash && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-0.5 h-[5px] w-[5px] rounded-full bg-white shadow-[0_0_3px_rgba(255,255,255,0.5)]"
        />
      )}
    </div>
  )
}

// Dock Context Menu component
function DockContextMenu({
  x,
  y,
  appId,
  isTrash,
  onClose,
}: {
  x: number
  y: number
  appId: string
  isTrash: boolean
  onClose: () => void
}) {
  const openApp = useMacOSStore((s) => s.openApp)

  const appMenuItems = [
    { label: 'Options', disabled: true },
    { label: 'Keep in Dock', action: () => {} },
    { label: 'Open at Login', action: () => {} },
    { label: 'Show All Windows', action: () => {} },
    { separator: true, label: '' },
    { label: 'Open', action: () => { openApp(appId); onClose() } },
  ]

  const trashMenuItems = [
    { label: 'Open', action: () => { onClose() } },
    { label: 'Empty Trash', action: () => { onClose() } },
    { separator: true, label: '' },
    { label: 'Get Info', action: () => { onClose() } },
  ]

  const items = isTrash ? trashMenuItems : appMenuItems

  // Adjust position so menu doesn't go off-screen
  const menuWidth = 180
  const menuHeight = items.length * 28
  const adjustedX = Math.min(x - menuWidth / 2, window.innerWidth - menuWidth - 8)
  const adjustedY = Math.max(28, y - menuHeight - 8)

  return (
    <>
      {/* Backdrop to catch clicks outside */}
      <div className="fixed inset-0 z-[10001]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className="fixed z-[10002] w-[180px] bg-[#2a2a2e]/95 backdrop-blur-2xl rounded-md border border-white/[0.12] py-1 shadow-2xl"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {items.map((item, idx) => {
          if (item.separator) {
            return <div key={`sep-${idx}`} className="h-px bg-white/10 mx-2 my-1" />
          }
          return (
            <button
              key={item.label}
              className={`w-full text-left px-3 py-[3px] text-[13px] text-white/90 hover:bg-[#0060df] hover:text-white rounded-[4px] mx-1 flex items-center transition-colors ${
                item.disabled ? 'opacity-40 pointer-events-none' : ''
              }`}
              style={{ width: 'calc(100% - 8px)' }}
              onClick={item.action}
            >
              {item.label}
            </button>
          )
        })}
      </motion.div>
    </>
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
  const [dockContextMenu, setDockContextMenu] = useState<{ x: number; y: number; appId: string; isTrash: boolean } | null>(null)

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

  const { toggle: toggleLaunchpad } = useLaunchpad()

  const handleClick = useCallback(
    (appId: string, isTrash: boolean) => {
      if (isTrash) return
      if (appId === 'launchpad') {
        toggleLaunchpad()
        return
      }
      setBouncingApp(appId)
      setTimeout(() => setBouncingApp(null), 1200)
      openApp(appId)
    },
    [openApp, toggleLaunchpad]
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
        className="relative flex items-end gap-1.5 overflow-visible rounded-[18px] border border-white/20 bg-white/[0.15] px-4 pb-2.5 pt-2 shadow-2xl shadow-black/20 backdrop-blur-2xl"
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.3 }}
      >
        {/* Subtle top highlight/reflection shine */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 80%, transparent)',
          }}
        />
        {/* Subtle gradient reflection below the highlight line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[1px] h-6"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)',
          }}
        />

        {dockItems.map((item, index) => {
          if (!item) return null

          const isTrash = item.isTrash
          const scale = scales[index] ?? 1
          const isRunning = openApps.includes(item.id)

          return (
            <React.Fragment key={item.id}>
              {/* Separator before Trash */}
              {isTrash && (
                <div
                  className="mx-1.5 h-10 w-[1px] self-center"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    boxShadow: '0 0 2px rgba(255,255,255,0.08), -1px 0 0 rgba(255,255,255,0.05)',
                  }}
                />
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
                onContextMenu={(e) => {
                  e.preventDefault()
                  setDockContextMenu({ x: e.clientX, y: e.clientY, appId: item.id, isTrash })
                }}
                isTrash={isTrash}
              />
            </React.Fragment>
          )
        })}
      </motion.div>

      {/* Right-click context menu */}
      <AnimatePresence>
        {dockContextMenu && (
          <DockContextMenu
            x={dockContextMenu.x}
            y={dockContextMenu.y}
            appId={dockContextMenu.appId}
            isTrash={dockContextMenu.isTrash}
            onClose={() => setDockContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
