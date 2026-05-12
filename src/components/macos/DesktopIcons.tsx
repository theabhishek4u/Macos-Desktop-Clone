'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import useMacOSStore from '@/store/macos-store'

interface DesktopIcon {
  id: string
  name: string
  appId: string
  iconType: 'harddrive' | 'folder-blue' | 'folder-downloads' | 'folder-pictures'
}

const DESKTOP_ICONS: DesktopIcon[] = [
  {
    id: 'macintosh-hd',
    name: 'Macintosh HD',
    appId: 'finder',
    iconType: 'harddrive',
  },
  {
    id: 'documents',
    name: 'Documents',
    appId: 'finder',
    iconType: 'folder-blue',
  },
  {
    id: 'downloads',
    name: 'Downloads',
    appId: 'finder',
    iconType: 'folder-downloads',
  },
  {
    id: 'pictures',
    name: 'Pictures',
    appId: 'finder',
    iconType: 'folder-pictures',
  },
]

// Grid snapping constants
const GRID_X = 100
const GRID_Y = 90
const MARGIN_TOP = 32 + 12 // menu bar + padding
const MARGIN_RIGHT = 16

// Default positions (right-aligned, top to bottom)
function getDefaultPositions(): Record<string, { x: number; y: number }> {
  if (typeof window === 'undefined') return {}
  const rightEdge = window.innerWidth - MARGIN_RIGHT - 90
  const result: Record<string, { x: number; y: number }> = {}
  DESKTOP_ICONS.forEach((icon, index) => {
    result[icon.id] = {
      x: rightEdge,
      y: MARGIN_TOP + index * GRID_Y,
    }
  })
  return result
}

// Snap to grid
function snapToGrid(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.round(x / GRID_X) * GRID_X,
    y: Math.round((y - MARGIN_TOP) / GRID_Y) * GRID_Y + MARGIN_TOP,
  }
}

// ─── 3D Metallic Hard Drive Icon ────────────────────────────────────────────
function HardDriveIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Main body with 3D metallic gradient */}
      <rect x="8" y="14" width="48" height="36" rx="4" fill="url(#hd-body)" />
      {/* Top edge highlight — bevel effect */}
      <path d="M12 14h40a4 4 0 0 1 4 4v1.5H8V18a4 4 0 0 1 4-4z" fill="url(#hd-top-bevel)" />
      {/* Secondary highlight strip */}
      <rect x="8" y="19.5" width="48" height="0.5" fill="rgba(255,255,255,0.08)" />
      {/* Drive slot with depth */}
      <rect x="14" y="30" width="36" height="2.5" rx="1.25" fill="url(#hd-slot)" />
      <rect x="14" y="30" width="36" height="1" rx="0.5" fill="rgba(0,0,0,0.4)" />
      <rect x="14" y="31.5" width="36" height="0.5" rx="0.25" fill="rgba(255,255,255,0.06)" />
      {/* Bottom separator line */}
      <rect x="12" y="40" width="40" height="0.75" fill="rgba(255,255,255,0.12)" />
      {/* LED indicator with glow */}
      <circle cx="48" cy="44" r="2.5" fill="#22c55e" opacity="0.2" />
      <circle cx="48" cy="44" r="1.8" fill="#4ade80" opacity="0.9" />
      <circle cx="48" cy="44" r="1.8" fill="#4ade80" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Specular highlight on top-left */}
      <rect x="10" y="15" width="20" height="3" rx="1.5" fill="url(#hd-specular)" />
      {/* Outer stroke */}
      <rect x="8" y="14" width="48" height="36" rx="4" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" fill="none" />
      {/* Bottom shadow edge */}
      <path d="M8 46a4 4 0 0 0 4 4h40a4 4 0 0 0 4-4v-0.5H8V46z" fill="rgba(0,0,0,0.15)" />
      <defs>
        <linearGradient id="hd-body" x1="8" y1="14" x2="8" y2="50">
          <stop offset="0%" stopColor="#CFD8DC" />
          <stop offset="15%" stopColor="#B0BEC5" />
          <stop offset="40%" stopColor="#90A4AE" />
          <stop offset="65%" stopColor="#84A4AE" />
          <stop offset="85%" stopColor="#78909C" />
          <stop offset="100%" stopColor="#607D8B" />
        </linearGradient>
        <linearGradient id="hd-top-bevel" x1="8" y1="14" x2="8" y2="19.5">
          <stop offset="0%" stopColor="#E0E8EC" />
          <stop offset="40%" stopColor="#CFD8DC" />
          <stop offset="100%" stopColor="#B0BEC5" />
        </linearGradient>
        <linearGradient id="hd-slot" x1="14" y1="30" x2="14" y2="32.5">
          <stop offset="0%" stopColor="#546E7A" />
          <stop offset="50%" stopColor="#37474F" />
          <stop offset="100%" stopColor="#263238" />
        </linearGradient>
        <linearGradient id="hd-specular" x1="10" y1="15" x2="30" y2="18">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Realistic Blue Folder with Paper-like Front ────────────────────────────
function FolderBlueIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Folder back */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" fill="url(#fb-gradient)" />
      {/* Tab */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H10C7.79086 18 6 19.7909 6 22V18Z" fill="url(#fb-tab-gradient)" />
      {/* Front face with paper-like texture */}
      <path d="M6 22H58V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V22Z" fill="url(#fb-front-gradient)" />
      {/* Paper texture — subtle horizontal lines */}
      <g opacity="0.04">
        <line x1="10" y1="28" x2="54" y2="28" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="32" x2="54" y2="32" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="36" x2="54" y2="36" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="40" x2="54" y2="40" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="44" x2="54" y2="44" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="48" x2="54" y2="48" stroke="white" strokeWidth="0.5" />
      </g>
      {/* Top shine strip */}
      <path d="M6 22H58V28H6V22Z" fill="rgba(255,255,255,0.12)" />
      {/* Specular highlight on front */}
      <rect x="8" y="23" width="22" height="4" rx="2" fill="url(#fb-specular)" />
      {/* Outer stroke */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" fill="none" />
      <defs>
        <linearGradient id="fb-gradient" x1="6" y1="14" x2="6" y2="52">
          <stop offset="0%" stopColor="#54B5F6" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
        <linearGradient id="fb-tab-gradient" x1="6" y1="14" x2="6" y2="18">
          <stop offset="0%" stopColor="#72C4F8" />
          <stop offset="100%" stopColor="#54B5F6" />
        </linearGradient>
        <linearGradient id="fb-front-gradient" x1="6" y1="22" x2="6" y2="52">
          <stop offset="0%" stopColor="#4AB2F5" />
          <stop offset="20%" stopColor="#34A0F2" />
          <stop offset="50%" stopColor="#2196F3" />
          <stop offset="80%" stopColor="#1A80D8" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        <linearGradient id="fb-specular" x1="8" y1="23" x2="30" y2="27">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Downloads Folder Icon ──────────────────────────────────────────────────
function FolderDownloadsIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" fill="url(#fd-gradient)" />
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H10C7.79086 18 6 19.7909 6 22V18Z" fill="url(#fd-tab-gradient)" />
      <path d="M6 22H58V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V22Z" fill="url(#fd-front-gradient)" />
      {/* Paper texture */}
      <g opacity="0.04">
        <line x1="10" y1="28" x2="54" y2="28" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="32" x2="54" y2="32" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="36" x2="54" y2="36" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="40" x2="54" y2="40" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="44" x2="54" y2="44" stroke="white" strokeWidth="0.5" />
      </g>
      <path d="M6 22H58V28H6V22Z" fill="rgba(255,255,255,0.12)" />
      {/* Download emblem */}
      <circle cx="46" cy="42" r="9" fill="rgba(255,255,255,0.92)" />
      <circle cx="46" cy="42" r="9" fill="url(#fd-emblem-shine)" />
      <path d="M46 37L46 45M46 45L42.5 41.5M46 45L49.5 41.5" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" fill="none" />
      <defs>
        <linearGradient id="fd-gradient" x1="6" y1="14" x2="6" y2="52">
          <stop offset="0%" stopColor="#72C4F8" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
        <linearGradient id="fd-tab-gradient" x1="6" y1="14" x2="6" y2="18">
          <stop offset="0%" stopColor="#90CAF9" />
          <stop offset="100%" stopColor="#72C4F8" />
        </linearGradient>
        <linearGradient id="fd-front-gradient" x1="6" y1="22" x2="6" y2="52">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="20%" stopColor="#54B0F4" />
          <stop offset="50%" stopColor="#42A5F5" />
          <stop offset="80%" stopColor="#3090E0" />
          <stop offset="100%" stopColor="#1976D2" />
        </linearGradient>
        <radialGradient id="fd-emblem-shine" cx="44" cy="39" r="7">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// ─── Pictures Folder Icon ───────────────────────────────────────────────────
function FolderPicturesIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" fill="url(#fp-gradient)" />
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H10C7.79086 18 6 19.7909 6 22V18Z" fill="url(#fp-tab-gradient)" />
      <path d="M6 22H58V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V22Z" fill="url(#fp-front-gradient)" />
      {/* Paper texture */}
      <g opacity="0.04">
        <line x1="10" y1="28" x2="54" y2="28" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="32" x2="54" y2="32" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="36" x2="54" y2="36" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="40" x2="54" y2="40" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="44" x2="54" y2="44" stroke="white" strokeWidth="0.5" />
      </g>
      <path d="M6 22H58V28H6V22Z" fill="rgba(255,255,255,0.12)" />
      {/* Photo emblem */}
      <rect x="36" y="33" width="19" height="15" rx="2.5" fill="rgba(255,255,255,0.92)" />
      <rect x="37.5" y="34.5" width="16" height="12" rx="1.5" fill="#81C784" />
      <path d="M37.5 42.5L42.5 38L46 41L48.5 39L53.5 42V46.5H37.5V42.5Z" fill="#4CAF50" />
      <circle cx="50" cy="37.5" r="1.5" fill="#FFD54F" />
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" fill="none" />
      <defs>
        <linearGradient id="fp-gradient" x1="6" y1="14" x2="6" y2="52">
          <stop offset="0%" stopColor="#9FA8DA" />
          <stop offset="100%" stopColor="#7986CB" />
        </linearGradient>
        <linearGradient id="fp-tab-gradient" x1="6" y1="14" x2="6" y2="18">
          <stop offset="0%" stopColor="#B3B9E0" />
          <stop offset="100%" stopColor="#9FA8DA" />
        </linearGradient>
        <linearGradient id="fp-front-gradient" x1="6" y1="22" x2="6" y2="52">
          <stop offset="0%" stopColor="#939BE0" />
          <stop offset="20%" stopColor="#7F8AD8" />
          <stop offset="50%" stopColor="#6C78CC" />
          <stop offset="80%" stopColor="#5C6BC0" />
          <stop offset="100%" stopColor="#4A5AB0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function IconRenderer({ iconType }: { iconType: DesktopIcon['iconType'] }) {
  switch (iconType) {
    case 'harddrive':
      return <HardDriveIcon />
    case 'folder-blue':
      return <FolderBlueIcon />
    case 'folder-downloads':
      return <FolderDownloadsIcon />
    case 'folder-pictures':
      return <FolderPicturesIcon />
  }
}

interface IconPosition {
  x: number
  y: number
}

export default function DesktopIcons() {
  const { openApp } = useMacOSStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [positions, setPositions] = useState<Record<string, IconPosition>>(() => getDefaultPositions())
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const didDragRef = useRef(false)

  // Re-calculate positions on window resize
  useEffect(() => {
    const handleResize = () => {
      setPositions(getDefaultPositions())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleIconMouseDown = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      didDragRef.current = false

      // Handle multi-select with Shift or Cmd/Ctrl
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        setSelectedIds(prev => {
          const next = new Set(prev)
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return next
        })
      } else {
        // Single select
        setSelectedIds(new Set([id]))
      }

      const startPos = positions[id] ?? { x: 0, y: 0 }
      let hasDragged = false

      const startMouseX = e.clientX
      const startMouseY = e.clientY
      const iconStartX = startPos.x
      const iconStartY = startPos.y

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startMouseX
        const dy = ev.clientY - startMouseY

        // Only start dragging after moving 5px
        if (!hasDragged && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          hasDragged = true
          didDragRef.current = true
          setDraggingId(id)
        }

        if (hasDragged) {
          const newX = iconStartX + dx
          const newY = Math.max(MARGIN_TOP, iconStartY + dy)
          setPositions(prev => ({
            ...prev,
            [id]: { x: newX, y: newY },
          }))
        }
      }

      const handleMouseUp = () => {
        if (hasDragged) {
          // Snap to grid on drop
          setPositions(prev => {
            const pos = prev[id]
            if (!pos) return prev
            const snapped = snapToGrid(pos.x, pos.y)
            return {
              ...prev,
              [id]: snapped,
            }
          })
        }
        setDraggingId(null)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [positions]
  )

  const handleIconDoubleClick = useCallback(
    (appId: string) => {
      openApp(appId)
    },
    [openApp]
  )

  const handleDesktopClick = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  return (
    <div
      className="absolute inset-0 z-10"
      onClick={handleDesktopClick}
    >
      {DESKTOP_ICONS.map(icon => {
        const isSelected = selectedIds.has(icon.id)
        const isDragging = draggingId === icon.id
        const isHovered = hoveredId === icon.id
        const pos = positions[icon.id]

        return (
          <div
            key={icon.id}
            className={`absolute flex flex-col items-center justify-center w-[96px] py-2.5 cursor-default select-none rounded-[8px] ${
              isSelected && !isDragging ? 'bg-blue-500/30' : !isDragging && isHovered && !isSelected ? 'hover:bg-white/[0.06]' : ''
            }`}
            style={{
              left: pos?.x ?? 0,
              top: pos?.y ?? MARGIN_TOP,
              filter: isDragging
                ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))'
                : undefined,
              transform: isDragging
                ? 'scale(1.08)'
                : isHovered && !isSelected
                  ? 'scale(1.05)'
                  : isSelected
                    ? 'scale(1.02)'
                    : 'scale(1)',
              opacity: isDragging ? 0.7 : 1,
              transition: isDragging
                ? 'filter 0.05s, transform 0.05s, opacity 0.05s'
                : 'filter 0.2s ease, transform 0.2s ease, background-color 0.15s ease, opacity 0.15s ease',
              zIndex: isDragging ? 50 : 10,
            }}
            onMouseDown={(e) => handleIconMouseDown(icon.id, e)}
            onMouseEnter={() => setHoveredId(icon.id)}
            onMouseLeave={() => setHoveredId(null)}
            onDoubleClick={(e) => {
              e.stopPropagation()
              if (!didDragRef.current) {
                handleIconDoubleClick(icon.appId)
              }
            }}
          >
            {/* Icon container with shadow */}
            <div
              className="relative mb-1"
              style={{
                width: 58,
                height: 58,
                filter: isDragging
                  ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))'
                  : isSelected
                    ? 'drop-shadow(0 2px 6px rgba(59,130,246,0.3)) drop-shadow(0 1px 3px rgba(0,0,0,0.4))'
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
                transition: 'filter 0.2s ease',
              }}
            >
              <IconRenderer iconType={icon.iconType} />
            </div>
            {/* Label */}
            <span
              className={`text-[12px] text-center leading-tight font-medium max-w-[100px] break-words px-1.5 py-[2px] rounded-[4px] ${
                isSelected && !isDragging
                  ? 'text-white bg-blue-500/30'
                  : 'text-white/90'
              }`}
              style={{
                textShadow: isSelected
                  ? '0 0 4px rgba(59,130,246,0.5), 0 1px 3px rgba(0,0,0,0.9), 0 0px 8px rgba(59,130,246,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.95), 0 0px 2px rgba(0,0,0,0.7), 0 0px 8px rgba(0,0,0,0.5)',
                transition: 'color 0.15s ease, background-color 0.15s ease',
              }}
            >
              {icon.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
