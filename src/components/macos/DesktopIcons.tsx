'use client'

import { useState, useCallback } from 'react'
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

// macOS-style hard drive icon SVG
function HardDriveIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Drive body */}
      <rect x="8" y="14" width="48" height="36" rx="4" fill="url(#hd-gradient)" />
      {/* Top face */}
      <path d="M12 14h40a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4z" fill="url(#hd-top-gradient)" />
      {/* Drive detail line */}
      <rect x="12" y="40" width="40" height="1" fill="rgba(255,255,255,0.15)" />
      {/* LED indicator */}
      <circle cx="48" cy="44" r="2" fill="#4ade80" opacity="0.9" />
      <circle cx="48" cy="44" r="2" fill="#4ade80" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Drive slot */}
      <rect x="14" y="30" width="36" height="2" rx="1" fill="rgba(0,0,0,0.3)" />
      <rect x="14" y="30" width="36" height="1" rx="0.5" fill="rgba(255,255,255,0.08)" />
      {/* Border highlight */}
      <rect x="8" y="14" width="48" height="36" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none" />
      <defs>
        <linearGradient id="hd-gradient" x1="8" y1="14" x2="8" y2="50">
          <stop offset="0%" stopColor="#B0BEC5" />
          <stop offset="50%" stopColor="#90A4AE" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
        <linearGradient id="hd-top-gradient" x1="8" y1="14" x2="8" y2="20">
          <stop offset="0%" stopColor="#CFD8DC" />
          <stop offset="100%" stopColor="#B0BEC5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// macOS-style folder icon SVG (blue folder)
function FolderBlueIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Folder back */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" fill="url(#fb-gradient)" />
      {/* Folder front tab */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H10C7.79086 18 6 19.7909 6 22V18Z" fill="url(#fb-tab-gradient)" />
      {/* Folder front face */}
      <path d="M6 22H58V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V22Z" fill="url(#fb-front-gradient)" />
      {/* Shine overlay */}
      <path d="M6 22H58V28H6V22Z" fill="rgba(255,255,255,0.12)" />
      {/* Border */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" fill="none" />
      <defs>
        <linearGradient id="fb-gradient" x1="6" y1="14" x2="6" y2="52">
          <stop offset="0%" stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>
        <linearGradient id="fb-tab-gradient" x1="6" y1="14" x2="6" y2="18">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
        <linearGradient id="fb-front-gradient" x1="6" y1="22" x2="6" y2="52">
          <stop offset="0%" stopColor="#42A5F5" />
          <stop offset="30%" stopColor="#2196F3" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Downloads folder icon (with down arrow emblem)
function FolderDownloadsIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Folder back */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" fill="url(#fd-gradient)" />
      {/* Folder front tab */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H10C7.79086 18 6 19.7909 6 22V18Z" fill="url(#fd-tab-gradient)" />
      {/* Folder front face */}
      <path d="M6 22H58V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V22Z" fill="url(#fd-front-gradient)" />
      {/* Shine overlay */}
      <path d="M6 22H58V28H6V22Z" fill="rgba(255,255,255,0.12)" />
      {/* Download arrow emblem */}
      <circle cx="46" cy="42" r="8" fill="rgba(255,255,255,0.9)" />
      <path d="M46 38L46 45M46 45L43 42M46 45L49 42" stroke="#1E88E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Border */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" fill="none" />
      <defs>
        <linearGradient id="fd-gradient" x1="6" y1="14" x2="6" y2="52">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
        <linearGradient id="fd-tab-gradient" x1="6" y1="14" x2="6" y2="18">
          <stop offset="0%" stopColor="#90CAF9" />
          <stop offset="100%" stopColor="#64B5F6" />
        </linearGradient>
        <linearGradient id="fd-front-gradient" x1="6" y1="22" x2="6" y2="52">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="30%" stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#1976D2" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Pictures folder icon (with landscape photo emblem)
function FolderPicturesIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Folder back */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" fill="url(#fp-gradient)" />
      {/* Folder front tab */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H10C7.79086 18 6 19.7909 6 22V18Z" fill="url(#fp-tab-gradient)" />
      {/* Folder front face */}
      <path d="M6 22H58V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V22Z" fill="url(#fp-front-gradient)" />
      {/* Shine overlay */}
      <path d="M6 22H58V28H6V22Z" fill="rgba(255,255,255,0.12)" />
      {/* Photo emblem */}
      <rect x="36" y="34" width="18" height="14" rx="2" fill="rgba(255,255,255,0.9)" />
      {/* Mini landscape */}
      <rect x="37.5" y="35.5" width="15" height="11" rx="1" fill="#81C784" />
      <path d="M37.5 43L42 39L45.5 42L48 40L52.5 43V46.5H37.5V43Z" fill="#4CAF50" />
      <circle cx="49" cy="38.5" r="1.5" fill="#FFD54F" />
      {/* Border */}
      <path d="M6 18C6 15.7909 7.79086 14 10 14H24L28 18H54C56.2091 18 58 19.7909 58 22V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V18Z" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" fill="none" />
      <defs>
        <linearGradient id="fp-gradient" x1="6" y1="14" x2="6" y2="52">
          <stop offset="0%" stopColor="#7986CB" />
          <stop offset="100%" stopColor="#5C6BC0" />
        </linearGradient>
        <linearGradient id="fp-tab-gradient" x1="6" y1="14" x2="6" y2="18">
          <stop offset="0%" stopColor="#9FA8DA" />
          <stop offset="100%" stopColor="#7986CB" />
        </linearGradient>
        <linearGradient id="fp-front-gradient" x1="6" y1="22" x2="6" y2="52">
          <stop offset="0%" stopColor="#7986CB" />
          <stop offset="30%" stopColor="#5C6BC0" />
          <stop offset="100%" stopColor="#3949AB" />
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

export default function DesktopIcons() {
  const { openApp } = useMacOSStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleDoubleClick = useCallback(
    (appId: string) => {
      openApp(appId)
    },
    [openApp]
  )

  const handleClick = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleDesktopClick = useCallback(() => {
    setSelectedId(null)
  }, [])

  return (
    <div
      className="absolute top-[32px] right-[16px] flex flex-col items-end gap-[8px] z-10"
      onClick={handleDesktopClick}
    >
      {DESKTOP_ICONS.map(icon => {
        const isSelected = selectedId === icon.id

        return (
          <div
            key={icon.id}
            className={`flex flex-col items-center justify-center w-[90px] py-2 cursor-default select-none transition-all duration-100 rounded-[6px] ${
              isSelected ? 'bg-blue-500/35' : 'hover:bg-white/[0.06]'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleClick(icon.id)
            }}
            onDoubleClick={() => handleDoubleClick(icon.appId)}
          >
            {/* Icon container with shadow */}
            <div
              className="relative mb-1"
              style={{
                width: 52,
                height: 52,
                filter: isSelected
                  ? 'drop-shadow(0 2px 6px rgba(59,130,246,0.3)) drop-shadow(0 1px 3px rgba(0,0,0,0.4))'
                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
              }}
            >
              <IconRenderer iconType={icon.iconType} />
            </div>
            {/* Label */}
            <span
              className={`text-[11px] text-center leading-tight font-medium max-w-[100px] break-words px-1.5 py-[2px] rounded-sm ${
                isSelected
                  ? 'text-white bg-blue-500/40'
                  : 'text-white/90'
              }`}
              style={{
                textShadow: isSelected
                  ? '0 0 4px rgba(59,130,246,0.5), 0 1px 3px rgba(0,0,0,0.9)'
                  : '0 1px 3px rgba(0,0,0,0.9), 0 0px 2px rgba(0,0,0,0.6)',
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
