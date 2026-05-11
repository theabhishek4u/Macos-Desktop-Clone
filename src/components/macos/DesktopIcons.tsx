'use client'

import { useState, useCallback } from 'react'
import { HardDrive, FolderOpen, Download, type LucideIcon } from 'lucide-react'
import useMacOSStore from '@/store/macos-store'

interface DesktopIcon {
  id: string
  name: string
  appId: string
  icon: LucideIcon
  gradient: string
  iconColor: string
}

const DESKTOP_ICONS: DesktopIcon[] = [
  {
    id: 'macintosh-hd',
    name: 'Macintosh HD',
    appId: 'finder',
    icon: HardDrive,
    gradient: 'linear-gradient(135deg, #B0BEC5, #78909C)',
    iconColor: '#ffffff',
  },
  {
    id: 'documents',
    name: 'Documents',
    appId: 'finder',
    icon: FolderOpen,
    gradient: 'linear-gradient(135deg, #42A5F5, #1E88E5)',
    iconColor: '#ffffff',
  },
  {
    id: 'downloads',
    name: 'Downloads',
    appId: 'finder',
    icon: Download,
    gradient: 'linear-gradient(135deg, #64B5F6, #2196F3)',
    iconColor: '#ffffff',
  },
]

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
      className="absolute top-[40px] right-[16px] flex flex-col items-end gap-1 z-10"
      onClick={handleDesktopClick}
    >
      {DESKTOP_ICONS.map(icon => {
        const IconComponent = icon.icon
        const isSelected = selectedId === icon.id

        return (
          <div
            key={icon.id}
            className={`flex flex-col items-center justify-center w-[80px] h-[88px] rounded-lg cursor-default select-none transition-all duration-150 ${
              isSelected ? 'bg-blue-500/30' : 'hover:bg-white/8'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleClick(icon.id)
            }}
            onDoubleClick={() => handleDoubleClick(icon.appId)}
          >
            {/* Icon container with gradient background */}
            <div
              className="flex items-center justify-center rounded-[12px] mb-1.5"
              style={{
                width: 48,
                height: 48,
                background: icon.gradient,
                boxShadow: isSelected
                  ? 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 0 0 1.5px rgba(59,130,246,0.6), 0 2px 8px rgba(0,0,0,0.3)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.2)',
                border: isSelected ? '1px solid rgba(59,130,246,0.5)' : '0.5px solid rgba(255,255,255,0.2)',
              }}
            >
              {/* Subtle shine overlay */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[12px]"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
                }}
              />
              <IconComponent
                size={26}
                color={icon.iconColor}
                strokeWidth={1.8}
                style={{ position: 'relative', zIndex: 1 }}
              />
            </div>
            <span
              className={`text-[11px] text-center leading-tight font-medium max-w-[72px] truncate px-1 ${
                isSelected
                  ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                  : 'text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              }`}
            >
              {icon.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
